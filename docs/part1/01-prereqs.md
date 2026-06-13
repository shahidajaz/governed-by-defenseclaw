---
title: "Step 1 — Prerequisites"
---

# Step 1 — Prerequisites

## Node.js 22

*Note: Required by OpenClaw.*

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
```

```bash
sudo apt-get install -y nodejs
```

```bash
/usr/bin/node --version
```

??? note "Expected output"
    ```
    v22.x.x
    ```

---

## PATH setup

*Note: Adds `~/.local/bin` to PATH.*

```bash
grep -q '\.local/bin' ~/.bashrc || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
```

```bash
export PATH="$HOME/.local/bin:$PATH"
```

??? note "Expected output"
    (no output)

---

## Sudo PATH

*Note: So `sudo` can find `~/.local/bin`.*

```bash
echo "Defaults secure_path=\"/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$HOME/.local/bin\"" | sudo tee /etc/sudoers.d/dc-installer >/dev/null
```

```bash
sudo chmod 0440 /etc/sudoers.d/dc-installer
```

??? note "Expected output"
    (no output)

---

## Install Docker

*Note: Required by Splunk and the local model server.*

```bash
curl -fsSL https://get.docker.com | sudo bash
```

```bash
sudo usermod -aG docker $USER
```

```bash
newgrp docker
```

### Verify

```bash
docker --version
```

```bash
docker info | grep -E 'Server Version|Architecture' | head -2
```

??? note "Expected output"
    ```
    Docker version 29.2.1, build a5c7197
    Server Version: 29.2.1
    Architecture: aarch64
    ```

[Continue to Install OpenClaw + DefenseClaw →](02-install.md){ .md-button .md-button--primary }
