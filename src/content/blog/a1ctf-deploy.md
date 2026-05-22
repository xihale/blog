---
title: "26 网安卫士平台搭建(a1ctf)"
pubDate: "2026-5-18"
description: ""
tags: ["CTF"]
---

## 服务器选型

2c4g hk \* 3；debian 12

考虑：

1. docker hub 等网络问题少
2. 免备案
3. 距离广州近
4. 参考 25 年中旬时网安卫士经验(ref: <https://blog.rkk.moe/2025/12/10/ADCTF-2025-Server/>)
5. 同域同内网服务器间通讯方便

缺点：

1. 价格将近翻倍
2. 没广州服务器近

### 拓扑

| 节点       | 角色                                                  | 调度策略                   |
| ---------- | ----------------------------------------------------- | -------------------------- |
| `infra-1`  | A1CTF、PostgreSQL、Redis、Registry、Caddy、k3s server | `NoSchedule`，默认不跑题目 |
| `worker-1` | k3s agent / challenge worker                          | 跑题目                     |
| `worker-2` | k3s agent / challenge worker                          | 跑题目                     |

infra 节点防火墙配置

| 来源      |                                 端口 | 用途          |
| --------- | -----------------------------------: | ------------- |
| 公网      | challenge 端口池，e.g. `30000-32767` | 题目访问      |
| 公网      |                              80, 443 | Caddy / A1CTF |
| 管理员 IP |                                   22 | SSH           |
| VPC 内网  |                                 6443 | k3s API       |
| VPC 内网  |                             8472/udp | flannel       |
| VPC 内网  |                                10250 | kubelet       |

worker 节点防火墙配置

| 来源      |                                 端口 | 用途     |
| --------- | -----------------------------------: | -------- |
| 公网      | challenge 端口池，e.g. `30000-32767` | 题目访问 |
| 管理员 IP |                                   22 | SSH      |
| VPC 内网  |                                 6443 | k3s API  |
| VPC 内网  |                             8472/udp | flannel  |
| VPC 内网  |                                10250 | kubelet  |

### 基础环境变量

自己改成对应的，提前开好 3 个 ssh 隧道，导入环境变量（当前教程局限于当前网络拓扑，由于在同一个内网，所以直接采用内网通信，如果不在同一个内网，请使用外网 ip 并在防火墙处添加相应安全规则）

```sh
export INFRA_PUBLIC_IP=
export INFRA_PRIVATE_IP=
export WORKER1_PUBLIC_IP=
export WORKER1_PRIVATE_IP=
export WORKER2_PUBLIC_IP=
export WORKER2_PRIVATE_IP=

export REG_DOMAIN=
export A1_DOMAIN=
export WORKER1_DOMAIN=
export WORKER2_DOMAIN=
```

## 基础环境

先分别 ssh 上去，然后做一些基础的操作。

> 密码可用 `pwgen -s 20 1` 随机生成
> 以及可以用 `secret-tool store --label="ctf user" a1 ctf` 管理 `secret-tool lookup a1 ctf`

创建一个 `ctf` 用户，之后的操作借助这个用户完成。（禁止 `root` 直接登录）

```sh
useradd -m -s /bin/bash ctf
passwd ctf
```

```
usermod -aG sudo ctf
```

先生成公私钥

```sh
ssh-keygen -t ed25519 -C "adctf-admin"
```

把我们生成的公钥传上去

```
ssh-copy-id -i ~/.ssh/ad_ctf.pub ctf@$INFRA_PUBLIC_IP
```

root 用户，修改一下 sshd 配置(`/etc/ssh/sshd_config`)

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
```

检查配置

```sh
sudo sshd -t
```

重启 `sshd`

```sh
sudo systemctl restart ssh
```

> 本地 `~/.ssh/config` 可以这样写

```
Host cp-1
    HostName $INFRA_PUBLIC_IP
    IdentityFile ~/.ssh/ad_ctf
    User ctf
    Port 22
```

### baseline

```sh
sudo apt update && sudo apt full-upgrade -y
sudo apt install -y curl wget unar rsync
```

#### 对时

```sh
sudo apt install -y chrony
sudo systemctl enable --now chrony
chronyc tracking
```

#### 自动安全更新

```sh
sudo apt install unattended-upgrades apt-listchanges
sudo dpkg-reconfigure unattended-upgrades
```

重启会进入新内核

#### \*自定义镜像

可以做一个自定义镜像，给另外两个服务器装上，统一配置。
如果要做自定义镜像可以先做一次清理

```sh
sudo apt autoremove --purge -y
sudo apt clean
sudo rm -rf /var/lib/apt/lists/*
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*

sudo journalctl --rotate
sudo journalctl --vacuum-time=1s
```

## 正戏

### Registry

#### 1. 创建用户

```sh
sudo useradd registry -d /var/lib/registry -m -s /bin/bash
sudo loginctl enable-linger registry
```

#### 2. 生成 htpasswd

```sh
sudo apt-get install -y apache2-utils
REG_PASS=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)
htpasswd -cBb /tmp/registry-passwd admin "$REG_PASS"
sudo mkdir -p /var/lib/registry/auth /var/lib/registry/data
sudo cp /tmp/registry-passwd /var/lib/registry/auth/passwd
sudo chmod 600 /var/lib/registry/auth/passwd
sudo chown registry:registry /var/lib/registry/auth/passwd
sudo chown -R registry:registry /var/lib/registry/data
```

#### 3. Pod

```sh
sudo -u registry tee /var/lib/registry/registry-pod.yaml << 'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: registry-pod
spec:
  hostname: registry
  restartPolicy: Never
  containers:
    - name: registry-container
      image: registry:3
      ports:
        - protocol: TCP
          containerPort: 5000
          hostIP: "::1"
          hostPort: 5000
      env:
        - name: REGISTRY_STORAGE_FILESYSTEM_ROOTDIRECTORY
          value: /var/lib/registry
        - name: REGISTRY_AUTH
          value: htpasswd
        - name: REGISTRY_AUTH_HTPASSWD_REALM
          value: Registry Realm
        - name: REGISTRY_AUTH_HTPASSWD_PATH
          value: /auth/passwd
      volumeMounts:
        - name: registry-data
          mountPath: /var/lib/registry
        - name: registry-auth
          mountPath: /auth
          readOnly: true
  volumes:
    - name: registry-data
      hostPath:
        type: Directory
        path: /var/lib/registry/data
    - name: registry-auth
      hostPath:
        type: Directory
        path: /var/lib/registry/auth
EOF

sudo chmod 0600 /var/lib/registry/registry-pod.yaml
```

#### 4. 修复权限 + 启动

```sh
sudo chown -R registry:registry /var/lib/registry/data /var/lib/registry/auth
```

进入 `registry` 用户环境执行命令(5同理)

```sh
sudo -u registry bash
```

```sh
podman unshare chown -R 0:0 /var/lib/registry/data /var/lib/registry/auth
podman kube play /var/lib/registry/registry-pod.yaml
```

#### 5. 生成 systemd user unit

> `podman generate systemd` 已经被废弃了，建议使用 `Quadlet` 方案

```sh
mkdir -p ~/.config/systemd/user && cd ~/.config/systemd/user
podman generate systemd --files --name registry-pod
podman pod stop registry-pod

export XDG_RUNTIME_DIR=/run/user/$(id -u)
systemctl --user daemon-reload
systemctl --user enable --now pod-registry-pod.service
```

#### 6. 登录

3 台都要; 密码是 `$REG_PASS` (参考 2, `echo` 一下就可以了)

```sh
podman login $REG_DOMAIN -u admin
```

### k3s

如果有防火墙请关闭服务器防火墙或者放行相关端口（防火墙由云防火墙接管）；此处可以参考官方教程。

#### 1. server (infra-1)

SSH 到 cp-1:

```sh
curl -sfL https://get.k3s.io | \
  INSTALL_K3S_EXEC="server \
    --node-name infra-1 \
    --node-taint CriticalAddonsOnly=true:NoSchedule \
    --write-kubeconfig-mode 0600" sh -s -
```

验证：

```sh
systemctl is-active k3s          # active
sudo k3s kubectl get nodes       # infra-1 Ready
```

#### 2. 写 k3s 配置文件

```sh
sudo tee /etc/rancher/k3s/config.yaml << 'EOF'
write-kubeconfig-mode: "0600"
tls-san:
  - host.containers.internal    # Podman 容器内访问 k3s API 需要此 SAN
disable:
  - traefik           # 用 Caddy 做反代，不需要 k3s 内置 ingress。留着会占 80/443 并在 iptables 加 REJECT 规则拦截流量
  - servicelb         # 题目用 NodePort 暴露，不用 LoadBalancer Service
  - helm-controller
EOF

sudo systemctl restart k3s
```

重启后再次确认集群正常: `sudo k3s kubectl get nodes`

#### 3. agent (worker-1 / worker-2)

在 infra 上获取 token(`id::server:token`):

```sh
sudo cat /var/lib/rancher/k3s/server/node-token
```

cp-2 (worker-1):

```sh
export NODE_TOKEN=
```

```sh
curl -sfL https://get.k3s.io | \
  K3S_URL=https://$INFRA_PRIVATE_IP:6443 \
  K3S_TOKEN="$NODE_TOKEN" \
  INSTALL_K3S_EXEC="agent --node-name worker-1" \
  sh -s -
```

cp-3 (worker-2):

```sh
export NODE_TOKEN=
```

```sh
curl -sfL https://get.k3s.io | \
  K3S_URL=https://$INFRA_PRIVATE_IP:6443 \
  K3S_TOKEN="$NODE_TOKEN" \
  INSTALL_K3S_EXEC="agent --node-name worker-2" \
  sh -s -
```

回到 cp-1 验证:

```sh
sudo k3s kubectl get nodes -o wide
# 应显示 infra-1, worker-1, worker-2 三个节点，状态均为 Ready
```

#### 4. Worker 节点 Registry 配置

在 worker-1 (cp-2) 和 worker-2 (cp-3) 上配置 `/etc/rancher/k3s/registries.yaml`:

```sh
export REG_PASS=
```

```sh
sudo mkdir -p /etc/rancher/k3s
sudo tee /etc/rancher/k3s/registries.yaml << EOF
mirrors:
  "$REG_DOMAIN":
    endpoint:
      - "https://$REG_DOMAIN"
configs:
  "$REG_DOMAIN":
    auth:
      username: admin
      password: $REG_PASS
EOF

sudo systemctl restart k3s-agent
```

#### 5. RBAC

在 cp-1 (infra) 禁用 k3s 匿名访问

```sh
sudo tee -a /etc/rancher/k3s/config.yaml << 'EOF'
kube-apiserver-arg:
  - "anonymous-auth=false"
EOF

sudo systemctl restart k3s
```

### Caddy

#### 1. 安装

```sh
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf "https://dl.cloudsmith.io/public/caddy/stable/gpg.key" | \
  sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf "https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt" | \
  sudo tee /etc/apt/sources.list.d/caddy-stable.list > /dev/null
sudo apt-get update
sudo apt-get install -y caddy
```

```sh
sudo tee /etc/caddy/Caddyfile << EOF
$A1_DOMAIN {
 reverse_proxy localhost:7777

 header {
  X-Content-Type-Options nosniff
  X-Frame-Options DENY
  Referrer-Policy strict-origin-when-cross-origin
 }
}

$REG_DOMAIN {
 reverse_proxy localhost:5000

 header {
  X-Content-Type-Options nosniff
 }
}
EOF

sudo systemctl restart caddy
```

### A1CTF

#### 1. 创建用户

SSH 到 cp-1:

```sh
sudo useradd a1ctf -d /var/lib/a1ctf -m -s /bin/bash
sudo loginctl enable-linger a1ctf
```

Debian 12 会自动在 `/etc/subuid` 和 `/etc/subgid` 中为用户分配 subuid/subgid 范围，rootless Podman 依赖这些映射。

验证 rootless 配置：

```sh
sudo -u a1ctf podman info --format {{.Host.Security.Rootless}}
# 应输出 true
```

#### 2. 配置 Podman 短名解析

```sh
sudo tee /etc/containers/registries.conf << 'EOF'
unqualified-search-registries = ["docker.io"]
EOF
```

否则 `podman kube play` 使用 `postgres:17-alpine` 这类短名镜像时会报错。

#### 3. 准备目录和密码

```sh
sudo mkdir -p /var/lib/a1ctf/data /var/lib/a1ctf/postgres /var/lib/a1ctf/redis
sudo chown -R a1ctf:a1ctf /var/lib/a1ctf


PG_PASS=$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)
REDIS_PASS=$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)
echo "PostgreSQL password: $PG_PASS"
echo "Redis password: $REDIS_PASS"
```

> 本地记录一下

```sh
secret-tool store --label="PG pass" a1 pg
secret-tool store --label="Redis pass" a1 redis
```

#### 4. 准备 kubeconfig

A1CTF 容器内需要通过 `host.containers.internal` 访问宿主的 k3s API。**不要直接复制 admin kubeconfig**，应创建最小权限 ServiceAccount:

```sh
# 0. 创建 namespace（必须先于 RBAC，否则资源无法绑定到该 namespace）
sudo k3s kubectl apply -f - <<'NS'
apiVersion: v1
kind: Namespace
metadata:
  name: a1ctf-challenges
NS

# 1. 创建 ServiceAccount 和 RBAC
sudo k3s kubectl apply -f - <<'RBAC'
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: a1ctf
  namespace: a1ctf-challenges
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: a1ctf-manager
  namespace: a1ctf-challenges
rules:
  - apiGroups: [""]
    resources: ["pods", "services"]
    verbs: ["get", "list", "create", "delete"]
  - apiGroups: ["networking.k8s.io"]
    resources: ["networkpolicies"]
    verbs: ["get", "list", "create", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: a1ctf-manager
  namespace: a1ctf-challenges
subjects:
  - kind: ServiceAccount
    name: a1ctf
    namespace: a1ctf-challenges
roleRef:
  kind: Role
  name: a1ctf-manager
  apiGroup: rbac.authorization.k8s.io
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: a1ctf-namespace-manager
rules:
  - apiGroups: [""]
    resources: ["namespaces"]
    resourceNames: ["a1ctf-challenges"]
    verbs: ["get", "create"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: a1ctf-namespace-manager
subjects:
  - kind: ServiceAccount
    name: a1ctf
    namespace: a1ctf-challenges
roleRef:
  kind: ClusterRole
  name: a1ctf-namespace-manager
  apiGroup: rbac.authorization.k8s.io
RBAC

# 2. 生成 SA token (10 年有效期)
TOKEN=$(k3s kubectl create token a1ctf -n a1ctf-challenges --duration=87600h)

# 3. 从原始 kubeconfig 提取 CA 证书
CA=$(grep certificate-authority-data /etc/rancher/k3s/k3s.yaml | awk '{print $2}')

# 4. 验证变量非空（如果为空说明前面的步骤有问题，不要继续）
echo "CA length: ${#CA}"
echo "Token length: ${#TOKEN}"
[ -z "$CA" ] && echo "ERROR: CA is empty" && exit 1
[ -z "$TOKEN" ] && echo "ERROR: Token is empty" && exit 1

# 5. 写入 SA kubeconfig（用 envsubst 避免变量展开问题）
sudo tee /var/lib/a1ctf/kubeconfig.yaml > /dev/null << EOF
apiVersion: v1
kind: Config
clusters:
- cluster:
    certificate-authority-data: ${CA}
    server: https://host.containers.internal:6443
  name: local
contexts:
- context:
    cluster: local
    user: a1ctf
  name: a1ctf
current-context: a1ctf
preferences: {}
users:
- name: a1ctf
  user:
    token: ${TOKEN}
EOF

sudo chmod 600 /var/lib/a1ctf/kubeconfig.yaml
sudo chown a1ctf:a1ctf /var/lib/a1ctf/kubeconfig.yaml
```

**注意**: k3s 的 `tls-san` 必须包含 `host.containers.internal`（见 [k3s 配置](../k3s/cluster-setup.md#2-写-k3s-配置文件)），否则容器内访问 API 会证书报错。

#### 5. 写 A1CTF 配置文件

需要 `REDIS_PASS`, `PG_PASS` 和[[#基础环境变量]]

```sh
sudo -u a1ctf tee /var/lib/a1ctf/config.yaml << EOF
configVersion: v1

system:
  gin-port: 7777
  gin-host: 0.0.0.0
  prometheus-port: 8081
  prometheus-host: 0.0.0.0
  favicon: ./data/favicon.ico
  baseURL: https://$A1_DOMAIN
  forwarded-by-client-ip: true
  remote-ip-headers:
    - X-Forwarded-For
    - X-Real-IP
  trusted-proxies:
    - 10.0.0.0/8
    - 172.21.0.0/16
    - 127.0.0.0/8
    - ::1/128
  pprof-enable: false

redis:
  address: localhost:6379
  password: "$REDIS_PASS"
  db: 0

k8s:
  k8s-config-file: "k8sconfig.yaml"
  node-ip-map:
    - { name: "worker-1", "address": "$WORKER1_DOMAIN" }
    - { name: "worker-2", "address": "$WORKER2_DOMAIN" }
  manual-port-assignments:
    enabled: false
    port-range-map: []
  pull-secret-names: []
  custom-dns-server:
    enabled: false
    nameservers:
      - 8.8.8.8

postgres:
  host: localhost
  port: 5432
  user: postgres
  password: "$PG_PASS"
  dbname: a1ctf
  sslmode: disable

cache-time:
  user-list: 500ms
  upload-list: 500ms
  solved-challenges-for-game: 500ms
  game-info: 500ms
  all-teams-for-game: 500ms
  game-scoreboard: 500ms
  challenges-for-game: 1s
  challenge-detail: 500ms
  container-status: 100ms
  team-flag: 100ms
  team-solve-status: 100ms
  judge-result: 100ms

redis-cache-time:
  user-list: 500ms
  upload-list: 500ms
  solved-challenges-for-game: 500ms
  game-info: 500ms
  all-teams-for-game: 500ms

monitoring:
  enabled: true
  system-monitor-interval: 1s
  gorm-slow-query-threshold: 100ms

job-intervals:
  update-activate-game-score: 500ms
  update-active-game-score-board: 5s
  flag-judge: 1s
  update-game-scoreboard-cache: 1s
  container-updating: 1s
  compress-and-delete-old-logs: 2h

cap-settings:
  defaultChallengeTokenSize: 25
  defaultChallengeCount: 80
  defaultChallengeSize: 32
  defaultChallengeDifficulty: 4
  defaultChallengeExpires: 10m
  defaultTokenSize: 64
  defaultTokenIdSize: 16
  defaultTokenExpires: 20m
  defaultTokenVerifyOnce: true
  defaultHttpHandleLimitRPS: 10
  defaultHttpHandleLimitBurst: 50

game-settings:
  container-cooldown-time: 60s
EOF

sudo chmod 600 /var/lib/a1ctf/config.yaml
```

**注意**: 同时确保 `/etc/rancher/k3s/k3s.yaml` 权限为 600（包含 cluster-admin 凭证）:

```sh
sudo chmod 600 /etc/rancher/k3s/k3s.yaml
```

#### 6. 写 Pod 定义

需要 `REDIS_PASS`, `PG_PASS` 环境变量

```sh
sudo -u a1ctf tee /var/lib/a1ctf/a1ctf-pod.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: a1ctf-pod
spec:
  hostname: a1ctf
  restartPolicy: OnFailure
  containers:
    - name: a1ctf-container
      image: ghcr.io/carbofish/a1ctf/a1ctf:latest
      env:
        - name: GIN_MODE
          value: release
      ports:
        - containerPort: 7777
          hostIP: ::1
          hostPort: 7777
        - containerPort: 8081
          hostIP: ::1
          hostPort: 8081
      volumeMounts:
        - name: a1ctf-data
          mountPath: /app/data
        - name: a1ctf-config
          mountPath: /app/config.yaml
          readOnly: true
        - name: k8sconfig
          mountPath: /app/k8sconfig.yaml
          readOnly: true
    - name: postgres-container
      image: postgres:17-alpine
      env:
        - name: POSTGRES_DB
          value: a1ctf
        - name: POSTGRES_USER
          value: postgres
        - name: POSTGRES_PASSWORD
          value: "$PG_PASS"
      ports:
        - containerPort: 5432
          hostIP: ::1
          hostPort: 5432
      volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
    - name: redis-container
      image: bitnami/redis:latest
      env:
        - name: REDIS_PASSWORD
          value: "$REDIS_PASS"
        - name: REDIS_AOF_ENABLED
          value: "yes"
      volumeMounts:
        - name: redis-data
          mountPath: /bitnami/redis/data
  volumes:
    - name: a1ctf-data
      hostPath:
        type: Directory
        path: /var/lib/a1ctf/data
    - name: a1ctf-config
      hostPath:
        type: File
        path: /var/lib/a1ctf/config.yaml
    - name: k8sconfig
      hostPath:
        type: File
        path: /var/lib/a1ctf/kubeconfig.yaml
    - name: postgres-data
      hostPath:
        type: Directory
        path: /var/lib/a1ctf/postgres
    - name: redis-data
      hostPath:
        type: Directory
        path: /var/lib/a1ctf/redis
EOF
```

#### 7. 修复 volume 权限

rootless Podman 中容器内 UID 映射到宿主的 subuid 范围，不是 `a1ctf` 用户本身。需要用 `podman unshare chown` 设置正确的映射 UID:

```sh
# A1CTF 数据目录 — 容器内 appuser (UID 1001)
sudo -u a1ctf podman unshare chown -R 1001:1001 /var/lib/a1ctf/data

# A1CTF 配置文件 — 容器内 appuser (UID 1001) 需要读取
sudo -u a1ctf podman unshare chown 1001:1001 /var/lib/a1ctf/config.yaml /var/lib/a1ctf/kubeconfig.yaml

# PostgreSQL 数据目录 — 容器内 postgres 用户 (UID 70)
sudo -u a1ctf podman unshare chown -R 70:70 /var/lib/a1ctf/postgres

# Redis 数据目录 — 容器内 redis 用户 (UID 1001)
sudo -u a1ctf podman unshare chown -R 1001:1001 /var/lib/a1ctf/redis
```

**注意**: A1CTF 镜像以 `appuser` (UID 1001) 运行，**不是 root**。所以 data 目录和配置文件都需要 chown 给 UID 1001，不是 0。

#### 8. 启动 Pod

```sh
sudo -u a1ctf podman kube play /var/lib/a1ctf/a1ctf-pod.yaml
```

等待镜像拉取完成，检查状态:

```sh
sudo -u a1ctf podman ps --pod
```

三个容器 (a1ctf-container, postgres-container, redis-container) 都应 Running。
如果 a1ctf 没有起来很可能是因为 PG 需要时间进行初始化，导致 a1ctf 找不到 PG 依赖。

#### 9. 生成 systemd user unit

```sh
# 切换到 a1ctf 用户
sudo -u a1ctf bash

# 生成 unit 文件
mkdir -p ~/.config/systemd/user && cd ~/.config/systemd/user
podman generate systemd --files --name a1ctf-pod

# 停止 pod（接下来由 systemd 管理）
podman pod stop a1ctf-pod

# 启用并启动
export XDG_RUNTIME_DIR=/run/user/$(id -u)
systemctl --user daemon-reload
systemctl --user enable --now pod-a1ctf-pod.service
```

退出 a1ctf 用户后，验证:

```sh
sudo -u a1ctf podman ps --pod
```

#### 10. a1ctf 配置

配置文件在 `/var/lib/a1ctf/data/system_settings.json`;

第一个注册的用户将获得管理员权限，务必先把 smtp 和模板配置好。

## 附录

### 构建+推送镜像

```sh
podman build -t my-challenge .
podman tag my-challenge $REG_DOMAIN/my-challenge:latest
podman push $REG_DOMAIN/my-challenge:latest
```

### 创建题目

后台可以创建题目，资源限制别搞太小，不然会 OOM 等，导致重启和失败。

`/app/entrypoint.sh` 要注意 `\r\n` 换行符问题，这会导致 shebang 识别出错。（可以 strip 或者强制制定 sh 运行）

### podman 日志排查

如果后台日志信息不足可以 ssh 上去排查

```
podman ps -a
podman logs --tail 50 container_tag
```

### k3s 题目容器排查

题目容器由 k3s 管理，`podman ps` 看不到，需要 `kubectl`。

```sh
sudo kubectl get pods -n a1ctf-challenges -o wide  # 状态和所在节点
sudo kubectl get svc -n a1ctf-challenges            # NodePort 映射
sudo kubectl logs <pod-name> -n a1ctf-challenges    # 容器日志
sudo kubectl describe pod <pod-name> -n a1ctf-challenges  # Events 段看调度/启动事件
```

A1CTF 平台日志在 `/var/lib/a1ctf/data/logs/`，JSON 格式。

## 最后

祝，玩得开心。
