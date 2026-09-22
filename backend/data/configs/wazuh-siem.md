# NLRPLS Wazuh SIEM

## Server
- Host: wfl-wazuh01, 192.168.13.14
- Wazuh v4.14.7, all-in-one install, Ubuntu 24.04, 32GB RAM, 8 vCPU, 400GB disk
- Install method: `curl -sO https://packages.wazuh.com/4.14/wazuh-install.sh && sudo bash wazuh-install.sh -a`
- Scope: HOST-based agents only (Windows/Linux). Switches, SonicWall, and the firewall are explicitly excluded — that's Security Onion's job (separate project, packet-capture based).

## Agent groups
- argenta-public, argenta-staff, laman-public, laman-staff — Windows workstations
- laman-windows-servers — 8 agents, adds realtime FIM on registry hives + scheduled tasks, PowerShell logging
- laman-domain-controllers — DCs, adds realtime FIM on NTDS + SYSVOL, Directory Service + DNS Server event channels
- laman-linux-servers — Ubuntu servers, FIM on /etc, /etc/passwd, /etc/shadow, /etc/sudoers, /bin, /sbin, /boot
- macos — ~4 machines, unified-logging-compatible config
- network-devices — stays empty (out of scope)
- special-systems, default — catch-alls

Wazuh does NOT support config inheritance between groups — each group's agent.conf must be pasted independently (Dashboard → Groups → group → Files tab).

## Baseline config (every group)
- SCA enabled, scan on start, 12h interval
- Syscheck (FIM): realtime on sensitive paths per OS/role, frequency 43200s
- Windows: Security/System/Application event channels via eventchannel log_format
- Linux: /var/log/auth.log, /var/log/syslog, /var/log/dpkg.log via syslog log_format

## Retention
- Alerts (rule-triggered): OpenSearch ISM policy "Retention_Policy_14_days" — hot → delete after 14 days
- Archives (raw, all events): NOT indexed into OpenSearch (would double indexer load). Retained via logrotate copytruncate + a daily cron deleting files older than 14 days. View via direct file access (grep/jq) at /var/ossec/logs/archives.
- Enable archives: set logall/logall_json = yes in /var/ossec/etc/ossec.conf, restart manager.

## Wazuh → Loki forwarding
- Grafana Alloy runs directly on wfl-wazuh01, config at /etc/alloy/config.alloy
- Tails /var/ossec/logs/alerts/alerts.json
- Uses `stage.drop` with regex `"level": ?[0-9][,}]` to drop severity 0-9, keeping only level 10-15 alerts
- Forwards to Loki with label source=wazuh

## Common troubleshooting
- Agents show "Unknown" but are actually connected: check indexer isn't out of disk space first (`df -h` vs `lsblk` — LVM logical volume can be smaller than the physical disk if the installer didn't auto-extend it). Fix: `sudo lvextend -l +100%FREE /dev/ubuntu-vg/ubuntu-lv && sudo resize2fs /dev/ubuntu-vg/ubuntu-lv`
- Alloy "looks fine" (config parses, service running) but nothing reaches Loki: check the positions file (`/var/lib/alloy/data/.../positions.yml`) — if it stays `positions: {}`, the alloy service user likely lacks read permission on the target log directory. Fix: add alloy user to the log-owning group (e.g. `usermod -aG wazuh alloy`), restart.
- Alloy `stage.match` errors ("match stage requires at least one additional stage"): current Alloy versions require a nested `stages` sub-block. For simple severity filtering, use `stage.drop` with a direct regex instead — avoids the syntax entirely.
- Agent MSI version must match the manager's major.minor version, not just "latest."
- GPO-based agent rollout: PowerShell startup script staged on NETLOGON, includes an idempotency check. Requires firewall ports TCP 1514/1515 open from endpoint VLANs to VLAN 13.
