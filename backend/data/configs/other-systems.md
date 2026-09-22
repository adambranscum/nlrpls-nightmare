# NLRPLS Other Systems Reference

## AI Reference Server (this system's own backend)
- Runs on a Mac mini M2 Pro (headless), migrated from a Xeon VM (wfl-ai01, 192.168.13.20)
- LM Studio serves the chat model on port 1234 (OpenAI-compatible API)
- RAG stack: hybrid search over ingested config files, backend at nlrpls-nightmare
- Web search capability via self-hosted SearXNG (Docker container, port 8888) for general IT knowledge not covered by internal configs

## Alerting pipeline (design goal)
- Wazuh + Uptime Kuma + MeshCentral + Ansible events should together fan out to: (1) a temporary Slack post, (2) a ticket in ithelpdesk, (3) a permanent local log file
