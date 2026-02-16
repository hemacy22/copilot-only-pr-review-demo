
# Copilot-only PR Review Demo (No Spec-Kit)

This repo demonstrates **GitHub Copilot** PR review workflows **without using Spec-Kit**. It collects **PR review latency metrics** (time to Copilot review, time to human review, time to merge) and displays them in a small React dashboard.

## What’s inside
- `server/` – Express API that also serves `/metrics/pr-metrics.json` if present
- `web/` – React (Vite) dashboard that reads `/metrics/pr-metrics.json`
- `.github/workflows/pr-metrics.yml` – GitHub Action that appends review events to `metrics/pr-metrics.json`
- `scripts/pr-report.mjs` – CLI summary of metrics in terminal

## Prereqs
- Node.js 20+
- A GitHub repo with Actions enabled

## Setup
1. **Install deps**
   ```bash
   npm i
   ```
2. **Enable automatic Copilot review** in your GitHub repo:
   - Settings → Rules → Rulesets → New branch ruleset → enable **Automatically request Copilot code review** (optional: review new pushes & draft PRs).
3. **Push this repo** and open PRs. The workflow writes metrics to `metrics/pr-metrics.json`.

> Copilot reviews are **comment-type** reviews (not approvals) and typically arrive quickly after request. Humans still need to approve merges if required by your rules. Measure the overall delay using the tools below.

## Run locally
- API: `npm -w server run dev` (or `npm run dev` for concurrent server+web)
- Web: `npm -w web run dev` → open http://localhost:5173

The dashboard reads `/metrics/pr-metrics.json` served by the API if you run both from repo root.

## Reports
Generate a terminal summary anytime:
```bash
npm run pr:report
```

## Notes
- This project intentionally avoids Spec-Kit (no `specify` CLI, no /speckit commands).
- To compare with your Spec-Kit runs, collect a similar set of PRs here and compare the averages.
