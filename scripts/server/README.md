# Server-side webhook deploy (gx)

push → GitHub webhook → Caddy (`@deployhook`) → unix socket → systemd
`Accept=yes` → `webhook.mjs` (HMAC verify) → `deploy.sh` (build + publish).
Idle process count: 0. Same pattern as zp.xihale.top / ziglings.xihale.top.

## Layout on gx (root)

    clone:   /home/blog-ci/blog            (https clone, public repo)
    secret:  /home/blog-ci/.webhook-secret (0600, shared with GitHub hook)
    log:     /home/blog-ci/deploy.log      (deploy.sh stdout+stderr)
    dest:    /var/www/xeed.ink             (Caddy root, owned by blog-ci)
    status:  /var/www/xeed.ink/deploy-status.json (written by webhook.mjs)
    ntfy:    /home/blog-ci/.ntfy-notify    (0600: topic line + user:pass line)
    attic:   /home/blog-ci/blog-attic      (retired hashed /_astro/, 7d)
    lock:    /home/blog-ci/.deploy.lock    (flock; rerun queue .deploy-rerun)
    units:   /etc/systemd/system/blog-deploy.socket + blog-deploy@.service
    socket:  /run/blog-deploy.sock         (blog-ci:caddy 0660)
    hook:    https://xeed.ink/hooks/blog-deploy (POST, push events)

## One-time provisioning (as done 2026-08-29)

```sh
useradd -u 1502 -m -s /bin/bash blog-ci && passwd -l blog-ci
chown -R blog-ci:blog-ci /var/www/xeed.ink
runuser -u blog-ci -- git clone https://github.com/xihale/blog /home/blog-ci/blog
openssl rand -hex 32 > /home/blog-ci/.webhook-secret
chown blog-ci: /home/blog-ci/.webhook-secret && chmod 600 /home/blog-ci/.webhook-secret
apt-get install -y nodejs                     # webhook.mjs runs on node
BUN_INSTALL=/usr/local bash -c 'curl -fsSL https://bun.sh/install | bash'  # build toolchain
# units → /etc/systemd/system/blog-deploy.{socket,@.service}
systemctl daemon-reload && systemctl enable --now blog-deploy.socket
```

Caddy: the `xeed.ink` block wraps dispatch in a `route` so the hook
`reverse_proxy unix//run/blog-deploy.sock` is tried before `try_files` /
`file_server` (directive order puts `try_files` ahead of `route`; unwrapped,
the hook path would be rewritten to /index.html first).

## Manual ops

```sh
# seed/redeploy by hand
runuser -u blog-ci -- env HOME=/home/blog-ci bash ~/blog/scripts/server/deploy.sh
# tail a deploy
ssh gx tail -f /home/blog-ci/deploy.log
# fake a push (no commit needed) — sign locally with the shared secret
SECRET=$(ssh gx cat /home/blog-ci/.webhook-secret)
PAYLOAD='{"ref":"refs/heads/astro","after":"<sha>","deleted":false}'
SIG="sha256=$(printf %s "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $NF}')"
curl -i -X POST https://xeed.ink/hooks/blog-deploy \
  -H "content-type: application/json" -H "x-github-event: push" \
  -H "x-hub-signature-256: $SIG" -d "$PAYLOAD"
```

Deploy answers GitHub within ~10s and builds afterwards; smoke tests:
wrong signature → 403, `ping` event → 200 pong. Other paths fall through
to the site itself (the `try_files` catch-all serves the shell — only the
exact hook path is special). Probe file: `/deploy-meta.json`
(sha + timestamp of the live deploy).

## Observability

- `https://xeed.ink/deploy-status.json` — outcome of the last webhook deploy:
  `status` building/success/failure, `sha`, timestamps, `exitCode`. Bookmark
  this; it is the "did it deploy?" answer. (no-cache via Caddy `@probe`)
- `https://xeed.ink/deploy-meta.json` — what is actually live, written by
  deploy.sh from the tree it built. (no-cache via Caddy `@probe`)
- ntfy push on every finish — topic `xeed-blog-deploy` on ntfy.xeed.ink
  (subscribe with the `xihale` account; `blog-notify` has write-only ACL on
  the topic and its password never leaves the server).
- `ssh gx tail -f /home/blog-ci/deploy.log` — full build output; failures
  end with a `FATAL:` line and leave the previous deploy untouched.
- GitHub's webhook deliveries page only proves delivery: the receiver
  answers 200 before building, so a red build still shows 200 there.

## Retired

GitHub Actions is disabled for this repo (`actions/permissions enabled=false`)
and `.github/workflows/deploy.yml` is deleted — lint/check/build gates run in
`deploy.sh` on every webhook deploy. The old Actions→rsync pipeline's
`DEPLOY_*` secrets are deleted; the `deploy` user on gx is now unused.
