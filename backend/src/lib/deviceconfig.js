import { Client } from 'ssh2';
import { DEVICES } from './devices.js';

// Redact any line that looks like it carries a secret — PSKs, SNMP community
// strings, hashed passwords, etc. This runs on every line unconditionally,
// no exceptions, before anything reaches the model.
const SECRET_LINE = /(secret|password|passwd|community|psk|pre-shared[- ]?key)/i;

function redact(configText) {
  return configText
    .split('\n')
    .map((line) => (SECRET_LINE.test(line) ? line.replace(/\S+$/, '[REDACTED]') : line))
    .join('\n');
}

function runCommands(host, username, password, commands, port = 22) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = '';

    conn
      .on('ready', () => {
        conn.shell((err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }

          stream
            .on('close', () => {
              conn.end();
              resolve(output);
            })
            .on('data', (data) => {
              output += data.toString();
            });

          // Send commands with small delays; disable paging first where relevant.
          let i = 0;
          const sendNext = () => {
            if (i >= commands.length) {
              setTimeout(() => stream.end('exit\n'), 1500);
              return;
            }
            stream.write(commands[i] + '\n');
            i++;
            setTimeout(sendNext, 800);
          };
          sendNext();
        });
      })
      .on('error', reject)
      .connect({ host, port, username, password, readyTimeout: 8000 });
  });
}

// Returns { config } or { error }. Never throws to the caller.
export async function getDeviceConfig(deviceName) {
  const device = DEVICES[deviceName];
  if (!device || !device.host) {
    return { error: `Unknown device "${deviceName}". Known devices: ${Object.keys(DEVICES).join(', ')}` };
  }

  try {
    let raw;

    if (device.type === 'aruba-aoscx') {
      const username = process.env.ARUBA_RO_USER;
      const password = process.env.ARUBA_RO_PASS;
      if (!username || !password) return { error: 'Aruba read-only credentials not configured' };

      raw = await runCommands(device.host, username, password, [
        'no page',
        'show running-config',
      ]);
    } else if (device.type === 'sonicwall') {
      const username = process.env.SONICWALL_RO_USER;
      const password = process.env.SONICWALL_RO_PASS;
      if (!username || !password) return { error: 'SonicWall read-only credentials not configured' };

      raw = await runCommands(device.host, username, password, [
        'configure terminal',
        'no cli pager session',
        'show current-config',
      ]);
    } else {
      return { error: `Unsupported device type: ${device.type}` };
    }

    // Trim the SSH banner/echoed commands roughly — keep it simple, the model
    // is fine parsing around minor noise. Cap length so one huge config
    // doesn't blow the context window.
    const cleaned = redact(raw).slice(0, 12000);
    return { config: cleaned };
  } catch (err) {
    return { error: `Could not reach ${deviceName}: ${err.message}` };
  }
}
