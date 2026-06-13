# Governed by DefenseClaw

A hands-on series on running a governed AI agent (OpenClaw) on NVIDIA DGX Spark with Cisco DefenseClaw — covering the install, Telegram channel, and Webex use case end-to-end.

This repo is the source for the MkDocs site published at the GitHub Pages URL configured under Settings → Pages.

## Local preview

```bash
pip install mkdocs-material pymdown-extensions
mkdocs serve
```

Then open <http://127.0.0.1:8000>.

## Deploy

The GitHub Actions workflow at `.github/workflows/deploy.yml` builds the site and deploys to GitHub Pages on every push to `main`.
