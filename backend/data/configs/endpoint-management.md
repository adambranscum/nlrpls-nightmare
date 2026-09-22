# NLRPLS Endpoint Management Stack

## Scale
- 150+ machines across Laman + Argenta, 12+ switches, 7 servers, 2 firewalls (~170+ monitored sources)
- Active Directory domain: laman.local (realm LAMAN.LOCAL), DCs wfl-dc01 / wfl-dc02

## Division of labor
- Ansible: OS/software/Steam updates + heartbeat
- GPO: software installs + Delivery Optimization
- MeshCentral: remote-hands / RMM
- Wazuh: host-based security monitoring only (see wazuh-siem.md)
- Loki + Grafana: permanent log storage (including filtered Wazuh alerts)
- Semaphore: scheduling/UI for Ansible

## MeshCentral
- Runs at servant.nlrlibrary.org on the Bitnami public VPS, systemd unit `meshcentral`, port 4430, behind Apache reverse proxy
- Device groups: Laman-Staff, Laman-Public, Argenta-Staff, Argenta-Public, Servers

## Ansible control node
- Host: wfl-ansible01, 192.168.13.17
- Ubuntu VM, ansible-core via apt, git repo at ~/ansible (/root/ansible), remote "nlrpls-ansible"
- Auth: Kerberos via service account admin-ansi (LAMAN.LOCAL), keytab at /etc/krb5.keytab.ansible, refreshed every 4hrs via root crontab
- Commands require explicit `-i inventories/production/hosts.ini` and must run from ~/ansible (relative paths break elsewhere)
- Workflow: playbooks written/edited locally in VS Code, pushed to git, pulled onto wfl-ansible01 to run

## Semaphore
- v2.19.8, SQLite DB, playbook path /root/ansible, web UI at http://192.168.13.17:3000
- Runs as a systemd service (manually created — the .deb install doesn't ship one)
- IMPORTANT: cron scheduling fields expect UTC unless you set `"schedule": {"timezone": "America/Chicago"}` in /var/lib/semaphore/output/config.json and restart Semaphore

## Key playbooks
- install-updates.yml — Windows updates, reboot handled as a separate win_reboot task (not win_updates' own reboot flag, which is unreliable reconnecting over Kerberos)
- heartbeat.yml — CPU/RAM/disk every 30min, tickets/logs only fire on >90% breach
- inventory-check.yml — every 12hrs, pending updates + outdated software count
- update-software.yml — `winget upgrade --all --silent`
- scan-updates.yml — read-only report
- update-steam.yml — scoped to laman_public_gaming, uses SteamCMD with Ansible Vault credentials (Steam Guard removed from the shared account so login works with no 2FA prompt)

## Loki + Grafana
- Host: wfl-loki01, 192.168.13.10
- Loki v3.7.6 native binary, systemd unit `loki`, config /etc/loki/config.yaml, retention 180 days
- Grafana Alloy runs on wfl-loki01, wfl-ansible01, and wfl-wazuh01

## New-machine onboarding
- Interactive script: onboard-machine.sh (bash, in scripts/ folder of the ansible repo) — prompts for machine name, appends to hosts.ini, verifies connection, prompts for machine type/group
- Hostname prefix → inventory group: THUB/LH/EXP/GENE → laman_public_nongaming; NLR-LAM-SLAP/LAP → laman_lap; NLR-LAM-CHILD → laman_child; NLR-LAM-TEEN → laman_teen
- Installer share: \\WFL-NAS01\Ansible
- Staff machines do NOT get Envisionware installers (LPT1 or Reservation) or Deepfreeze — those are public-machine-only
