# NLRPLS Troubleshooting Patterns (Tier 1 / Tier 2 quick reference)

## Ansible / WinRM
- SSH password auth loop with a known-correct password → check pam_faillock lockout, or a malformed /etc/ssh/sshd_config.d/*.conf drop-in
- "kerberos: Server not found in Kerberos database" → the target hostname in inventory doesn't exist or has no SPN
- win_ping returns "No route to host"/UNREACHABLE → check DNS resolution FIRST (`getent hosts <fqdn>`, `sudo systemctl restart systemd-resolved`) before assuming firewall/VLAN. Stale AD DNS records recur, especially on DHCP end-user machines.
- admin-ansi missing from local Administrators after gpupdate → GPO item must be under Computer Config (not User Config), and linked to the target's actual OU. Check with `gpresult /r`, look for "Filtering: Not Applied (Empty)".
- Module failure like "Out-String command not found" on one specific target → broken local PowerShell on that machine, not an Ansible/network/auth issue.
- Semaphore schedules running at the wrong time → cron field is UTC by default; set the timezone override in config.json (see endpoint-management.md).

## Wazuh / Loki
- Agents show "Unknown" in dashboard but are actually connected → check indexer disk space (`df -h` vs `lsblk`) before anything else — LVM volume can be smaller than the physical disk if never auto-extended.
- Grafana Alloy "looks fine" but nothing reaches Loki → check the positions file for `positions: {}`; usually a permissions issue (alloy service user can't read the target log directory).

## Linux recovery
- Lost root/user password on a system with an LVM root volume:
  1. GRUB rescue shell
  2. `lvm vgscan` then `lvm vgchange -ay`
  3. Find the device: `ls /dev/mapper/`
  4. `mkdir -p /mnt && mount /dev/mapper/<vg-lv> /mnt`
  5. Bind-mount /dev, /proc, /sys into /mnt
  6. `chroot /mnt /bin/bash`
  7. `passwd <user>`
  8. Reboot

## Git / deployment
- Repeated pull conflicts or an app crashing after deploy → check whether vendor/ or .env got committed to git. Always .gitignore both; regenerate locally instead of tracking them. Rotate any secrets that were exposed.

## General network
- SonicWall syslog rule only allows UDP but you need TCP 1514/1515 for Wazuh agent enrollment across a VPN tunnel → check the service group on the rule, add TCP explicitly.
- Staff WiFi down at a branch → check AP ports on the wireless switch for the correct VLAN trunk (a past incident involved ports stuck trunking a stale legacy VLAN instead of the current staff WiFi VLAN).
