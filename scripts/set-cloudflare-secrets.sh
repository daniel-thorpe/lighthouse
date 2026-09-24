#!/usr/bin/env bash
set -euo pipefail

REPO="daniel-thorpe/lighthouse"

command -v gh >/dev/null 2>&1 || { echo "gh is not installed." >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Not logged in. Run: gh auth login" >&2; exit 1; }

printf 'Cloudflare account ID: '
read -r ACCOUNT_ID

printf 'Cloudflare API token (input hidden): '
read -rs API_TOKEN
printf '\n'

[ -n "$ACCOUNT_ID" ] || { echo "Account ID was empty." >&2; exit 1; }
[ -n "$API_TOKEN" ]  || { echo "API token was empty." >&2; exit 1; }

printf '%s' "$ACCOUNT_ID" | gh secret set CLOUDFLARE_ACCOUNT_ID --repo "$REPO"
printf '%s' "$API_TOKEN"  | gh secret set CLOUDFLARE_API_TOKEN  --repo "$REPO"

unset ACCOUNT_ID API_TOKEN

echo
echo "Stored. Secrets now on $REPO:"
gh secret list --repo "$REPO"
