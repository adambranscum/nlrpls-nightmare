# NLRPLS VoIP / Fax Infrastructure

## Core setup
- SIP trunk provider: Voxtelesys
- FreePBX on Debian 12 at 192.168.10.7 (VLAN 10) — should run a full Wazuh agent, not agentless monitoring
- Fax server WFL-FAXSVR01 at 192.168.10.8 — native Asterisk res_fax/ReceiveFax() via PJSIP trunk to Voxtelesys with T.38, delivers PDFs via fax2email.sh (mutt). HylaFax is disabled and NOT in the actual fax path — confirmed.

## Laman
- SIP call drops (32-second) fixed via: 1:1 NAT (12.14.28.74 → 192.168.10.7), SIP ALG disabled, PJSIP external_signaling_address configured
- HylaFax server (192.168.10.8) has its own dedicated public IP 12.14.28.75 with its own 1:1 NAT
- DNS fixed to 8.8.8.8/1.1.1.1, locked with `chattr +i` on /etc/resolv.conf to prevent it reverting
- Holiday voicemail: mailbox 124, flat file /etc/asterisk/branch_overrides/laman.conf

## Argenta
- VoIP/PCI network segmentation: SonicWall X3 at 192.168.21.254/24, Aruba 6200F as L2 passthrough
- Two dedicated IPSec VPN tunnels: one for phones, one for fax bridges (kept separate)
- Holiday voicemail: mailbox 125, flat file argenta.conf

## Fax troubleshooting
- Known failure mode: chan_sip.so loaded alongside chan_pjsip.so on port 5063 — causes UDPTL initialization errors. Check for and disable chan_sip.so if fax fails intermittently.
- Missing fax extension in the [inbound-fax] context can drop CNG-detected redirects.
- Fax log: /var/log/asterisk/full.log

## General troubleshooting checklist for SIP call issues
1. Check NAT mapping (1:1 NAT, correct public/private IP pairing)
2. Check SIP ALG is disabled on the firewall/router
3. Check PJSIP external_signaling_address matches the actual public IP
4. Check DNS resolution isn't silently reverting (verify resolv.conf hasn't been overwritten)
