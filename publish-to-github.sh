#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="bling-mcp-pro"
GITHUB_USER="marlo01"
DESCRIPTION="Servidor MCP open source para integração segura com a API do Bling ERP. Fork hardened do bling-mcp original com logs sanitizados, rate limiting, validação reforçada e suporte HTTP/SSE."

# Requisitos:
# 1) Git instalado
# 2) GitHub CLI instalado: https://cli.github.com/
# 3) Login feito: gh auth login

git init
git branch -M main
git add .
git commit -m "Initial release v2.0.0 - security hardened fork of bling"

gh repo create "$GITHUB_USER/$REPO_NAME" \
  --public \
  --description "$DESCRIPTION" \
  --source=. \
  --remote=origin \
  --push

gh repo edit "$GITHUB_USER/$REPO_NAME" \
  --enable-issues \
  --enable-discussions

gh repo edit "$GITHUB_USER/$REPO_NAME" \
  --add-topic mcp \
  --add-topic bling \
  --add-topic erp \
  --add-topic claude \
  --add-topic anthropic \
  --add-topic model-context-protocol \
  --add-topic api \
  --add-topic typescript \
  --add-topic open-source \
  --add-topic brazil

gh release create v2.0.0 \
  --repo "$GITHUB_USER/$REPO_NAME" \
  --title "v2.0.0 - Security Hardened Release" \
  --notes-file RELEASE_v2.0.0.md

echo "Publicado em: https://github.com/$GITHUB_USER/$REPO_NAME"
