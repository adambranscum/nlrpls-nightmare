// Registry of devices the live-config tool can query. No credentials here —
// those live in .env, keyed by DEVICE_CREDS below. Add a device by adding an
// entry here plus (if it's a new host/credential type) a matching env var.
//
// type "aruba-aoscx": SSH, runs `show running-config`, credential set ARUBA
// type "sonicwall":   SSH, runs `configure terminal` then `show current-config`,
//                     credential set SONICWALL
//
// LAM-SW-WIFI is intentionally excluded — it's Aruba Central cloud-managed,
// there is no local CLI/SSH to reach.

export const DEVICES = {
  'LAM-SW-CORE': { host: '192.168.1.220', type: 'aruba-aoscx' },
  'LAM-SW-STAFF': { host: '192.168.1.221', type: 'aruba-aoscx' },
  'NLRPLS-SW-CORE': { host: process.env.NLRPLS_SW_CORE_HOST || '', type: 'aruba-aoscx' },
  'nlr-shutup': { host: '192.168.1.228', type: 'aruba-aoscx' }, // Laman Aruba 6200F
  SonicWall: { host: process.env.SONICWALL_HOST || '192.168.1.251', type: 'sonicwall' },
};

export function listDeviceNames() {
  return Object.keys(DEVICES).filter((name) => DEVICES[name].host);
}
