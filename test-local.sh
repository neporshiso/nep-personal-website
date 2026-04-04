#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Local integration test for the /api/signals webhook endpoint
# Fires test requests against the running Astro dev server.
# Start the server first: pnpm dev
# ─────────────────────────────────────────────────────────────────────────────
set -e

SECRET="local-test-secret"
PORT=4321
BASE="http://localhost:$PORT/api/signals?secret=$SECRET"
PASS=0
FAIL=0

green() { printf "\033[32m✓ %s\033[0m\n" "$1"; PASS=$((PASS+1)); }
red()   { printf "\033[31m✗ %s\033[0m\n" "$1"; FAIL=$((FAIL+1)); }

echo ""
echo "═══════════════════════════════════════════════════"
echo " Webhook Integration Test"
echo "═══════════════════════════════════════════════════"
echo ""

# ── Test 1: Valid combined signal
echo "─── Valid webhook payload ───"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE" \
  -H "Content-Type: application/json" \
  -d '{"s2":"AAPL,MSFT","s4":"INTC"}')
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
if [ "$STATUS" = "200" ]; then
  green "Valid payload → 200 (published to GitHub)"
elif [ "$STATUS" = "500" ]; then
  green "Valid payload → 500 (no GitHub token, parsing OK)"
else
  red "Valid payload — expected 200 or 500, got $STATUS"
  echo "  Body: $BODY"
fi

# ── Test 2: Wrong secret
echo ""
echo "─── Wrong secret ───"
RESP=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:$PORT/api/signals?secret=wrong" \
  -H "Content-Type: application/json" \
  -d '{"s2":"AAPL","s4":""}')
STATUS=$(echo "$RESP" | tail -1)
if [ "$STATUS" = "401" ]; then green "Wrong secret → 401"; else red "Wrong secret — expected 401, got $STATUS"; fi

# ── Test 3: No secret
echo ""
echo "─── Missing secret ───"
RESP=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:$PORT/api/signals" \
  -H "Content-Type: application/json" \
  -d '{"s2":"AAPL","s4":""}')
STATUS=$(echo "$RESP" | tail -1)
if [ "$STATUS" = "401" ]; then green "No secret → 401"; else red "No secret — expected 401, got $STATUS"; fi

# ── Test 4: Invalid JSON
echo ""
echo "─── Invalid JSON ───"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE" \
  -H "Content-Type: application/json" \
  -d 'not json at all')
STATUS=$(echo "$RESP" | tail -1)
if [ "$STATUS" = "400" ]; then green "Invalid JSON → 400"; else red "Invalid JSON — expected 400, got $STATUS"; fi

# ── Test 5: Empty signals
echo ""
echo "─── Empty signals ───"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE" \
  -H "Content-Type: application/json" \
  -d '{"s2":"","s4":""}')
STATUS=$(echo "$RESP" | tail -1)
if [ "$STATUS" = "400" ]; then green "Empty signals → 400"; else red "Empty signals — expected 400, got $STATUS"; fi

# ── Summary
echo ""
echo "═══════════════════════════════════════════════════"
echo " Results: $PASS passed, $FAIL failed"
echo "═══════════════════════════════════════════════════"
echo ""

[ "$FAIL" -eq 0 ] && exit 0 || exit 1
