#!/usr/bin/env bash
# Server-side deploy for xeed.ink — started by scripts/server/webhook.mjs
# (or manually: ssh gx, then
#  `runuser -u blog-ci -- env HOME=/home/blog-ci bash ~/blog/scripts/server/deploy.sh`).
#
# Mirrors the retired .github/workflows/deploy.yml:
#   1. shallow-fetch the pushed branch into the persistent clone
#   2. bun install + autocorrect lint + astro check + build
#   3. rsync into /var/www/xeed.ink (Caddy serves it). Content-hashed /_astro/
#      retires into ~/blog-attic instead of being deleted: an HTML page cached
#      in a browser may still reference the previous generation's assets.
set -Eeuo pipefail
umask 022

REF="${1:-refs/heads/astro}"
BRANCH="${REF#refs/heads/}"
REPO=/home/blog-ci/blog
DEST=/var/www/xeed.ink
LOCK=/home/blog-ci/.deploy.lock
RERUN=/home/blog-ci/.deploy-rerun

say() { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
die() { say "FATAL: $*"; exit 1; }

cd "$REPO"

# One deploy at a time; a push that lands mid-deploy queues exactly one rerun
# (latest commit wins — the queued rerun fetches the newest sha anyway).
exec 9>"$LOCK"
if ! flock -n 9; then
  touch "$RERUN"
  say "deploy already running — queued one rerun"
  exit 0
fi

say "=== deploy start (${BRANCH}, sha=${BLOG_PUSH_SHA:-unknown}) ==="

# `bun run lint` (autocorrect --fix) mutates the worktree; a fix left behind
# would make the next checkout refuse to run. The clone is disposable.
git reset --hard -q

# Snapshot the running script BEFORE the fetch: bash keeps executing the old
# inode across the checkout, but $0 is just a path and resolves to the new
# file afterwards — path-to-path comparison can never detect the change.
SELF_SNAP=$(mktemp)
cat "$0" > "$SELF_SNAP"
git fetch --depth=1 origin "$BRANCH" && git checkout -q -B "$BRANCH" FETCH_HEAD
if ! cmp -s "$SELF_SNAP" "$REPO/scripts/server/deploy.sh"; then
  rm -f "$SELF_SNAP"; say "deploy.sh changed — re-execing"
  exec /bin/bash "$REPO/scripts/server/deploy.sh" "$@"
fi
rm -f "$SELF_SNAP"

# --- build (same gates the Actions workflow ran) ----------------------------
bun install --frozen-lockfile
bun run lint
bunx astro check
bun run build

printf '{"sha":"%s","branch":"%s","deployedAt":"%s"}\n' \
  "$(git rev-parse HEAD)" "$BRANCH" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > dist/deploy-meta.json

# --- publish ----------------------------------------------------------------
# Shells (HTML/CSS outside _astro) replace wholesale. Hashed /_astro/ chunks
# retire into a timestamped attic instead of being deleted: a browser-cached
# HTML page may still reference them. Attic dirs are pruned by their own age,
# i.e. measured from retirement, independent of deploy cadence. $HOME (not
# /var/www) — the web-served tree is all ReadWritePaths grants beside it.
ATTIC="$HOME/blog-attic"
mkdir -p "$ATTIC"
rsync -a --delete --delay-updates --exclude=/_astro \
  --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
  dist/ "$DEST/"
# --checksum: dist mtimes are always fresh, so quick-check would rewrite (and
# thus --backup) every file each deploy; content comparison makes the attic
# hold only genuinely retired assets.
rsync -a --delete --checksum --backup --backup-dir="$ATTIC/$(date -u +%Y%m%dT%H%M%S)" \
  --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
  dist/_astro/ "$DEST/_astro/"
# GNU find rounds age up: +6 = 7 full days, comfortably longer than any
# heuristic-cached HTML would survive; prune from retirement time.
find "$ATTIC" -mindepth 1 -maxdepth 1 -type d -mtime +6 -exec rm -rf {} +
say "published $(git rev-parse --short HEAD) → $DEST (attic: $(du -sh "$ATTIC" 2>/dev/null | cut -f1))"

say "=== deploy done ==="
if [ -e "$RERUN" ]; then
  rm -f "$RERUN"
  say "a newer push arrived during this deploy — running again"
  exec /bin/bash "$0" "$REF"
fi
