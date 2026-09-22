# NLRPLS Network Infrastructure

## VLANs (Laman)
- VLAN 1 — Staff/Mgmt — 192.168.1.0/24 — GW .220
- VLAN 10 — VoIP — 192.168.10.0/24 — GW .1 (phones/fax ATAs)
- VLAN 11 — Public — 192.168.11.0/24 — GW .1
- VLAN 12 — Staff WiFi — 192.168.12.0/24 — GW .1
- VLAN 13 — IT — 192.168.13.0/24 — GW .1 (Wazuh, Onion, IT AI Helper, Patch Management)
- VLAN 14 — replicated core ACL VLAN (mirrors Argenta's VLAN 24)

## VLANs (Argenta)
- VLAN 24 — ACL blocking 192.168.2.0/24, 192.168.21.0/24, 192.168.22.0/24
- VoIP/PCI zone: SonicWall X3 at 192.168.21.254/24, Aruba 6200F as L2 passthrough, two dedicated IPSec VPN tunnels (phones and fax bridges separately)

## Laman core infrastructure
- Primary DC: 192.168.1.1
- Backup DC: 192.168.1.10
- SonicWall: 192.168.1.251
- LAM-SW-CORE: 192.168.1.220
- LAM-SW-STAFF: mgmt 192.168.1.221 (VLAN 1); SVI on VLAN 13 at 192.168.13.221/24 forwards to core at 192.168.13.1
- LAM-SW-WIFI (Aruba Central cloud-managed, GUI-only config, no CLI):
  - Port 48: uplink to SonicWall, VLAN 1 (guest) only — do not touch
  - Port 47: uplink to LAM-SW-CORE port 46, VLAN 12 only
  - Ports 1–46: AP ports, trunk VLAN 1 + 12
- Netgear switches: pure L2, no VLAN config needed (upstream Aruba handles tagging). Only need: mgmt IP, hostname, portfast on access ports.
- Aruba 6200F at Laman: hostname nlr-shutup, mgmt IP 192.168.1.228/24, VLAN 14 access ports, trunk on 1/1/48
- AOS-CX ACL syntax for SVIs: `apply access-list ip [NAME] routed-in`

## SSL VPN (SonicWall SonicOS 7, Laman)
- Local users only (no LDAP), client route LAM-Net-Staff 192.168.1.0/24
- Fix checklist if broken: HTTPS User Login enabled on X1 WAN, SSLVPN→LAN firewall rule present, case-sensitive usernames disabled, check for self-signed cert issues

## SSL certificates
- Six .nlrlibrary.org domains on Bitnami AWS VPS: ithelpdesk, faciconn, displays, remote, faci, ms365-conn
- Auto-renewal script: /opt/bitnami/scripts/renew-certs.sh, daily 2am cron

## Known troubleshooting patterns
- Staff WiFi outage: check AP ports trunking the wrong VLAN (past incident: ports stuck on old VLAN 200 instead of VLAN 12) — fix via Aruba Central MultiEdit across all AP ports
- nrlibrary.org (Shopify-hosted) intermittent unreachability from some machines: DNS resolves fine everywhere, but TCP connect times out silently on affected machines even off-VLAN. SonicWall packet monitor unreliable for this. Long-term fix: Security Onion (Arkime + Zeek) packet capture via SPAN/mirror port.
- Security Onion sensor (wfl-onion01): mgmt IP 192.168.13.19, monitor interface cabled to LAM-SW-CORE port 1/1/43, mirror source port 1/1/47 (SonicWall uplink). If seeing capture loss, check NIC ring buffer size and multi-queue/RSS support — onboard NICs often lack this; dedicated capture NIC (Intel i350/X710-class) is the permanent fix.
