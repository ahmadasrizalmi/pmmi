#!/bin/bash
set -e
# G5: install ops-monitor + backup systemd units on pmmiserver
export DEBIAN_FRONTEND=noninteractive

# 1. service account pmmi (juga untuk G4 Hermes)
if ! id pmmi >/dev/null 2>&1; then
  useradd -r -s /usr/sbin/nologin -d /srv/pmmi pmmi
  echo "user pmmi created"
else
  echo "user pmmi exists"
fi

# 2. host tools: postgresql-client + minio client mc
command -v pg_dump >/dev/null || apt-get install -y -qq postgresql-client >/dev/null 2>&1
command -v pg_dump >/dev/null && echo "pg_dump: $(pg_dump --version)" || echo "pg_dump INSTALL FAILED"
if ! command -v mc >/dev/null; then
  curl -sSL -o /usr/local/bin/mc https://dl.min.io/client/mc/release/linux-amd64/mc
  chmod +x /usr/local/bin/mc
fi
mc --version 2>/dev/null | head -1 || echo "mc INSTALL FAILED"

# 3. backup root on /data (HDD terpisah)
mkdir -p /data/pmmi-backups
chown pmmi:pmmi /data/pmmi-backups
chmod 750 /data/pmmi-backups

# 4. install systemd units (path aktual dari repo)
cp /home/pmmiserver/pmmi/current/infra/systemd/pmmi-ops-monitor.service /etc/systemd/system/
cp /home/pmmiserver/pmmi/current/infra/systemd/pmmi-ops-monitor.timer /etc/systemd/system/
cp /home/pmmiserver/pmmi/current/infra/systemd/pmmi-backup.service /etc/systemd/system/
cp /home/pmmiserver/pmmi/current/infra/systemd/pmmi-backup.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now pmmi-ops-monitor.timer
systemctl enable --now pmmi-backup.timer
echo "=== timers ==="
systemctl list-timers pmmi-* --no-pager
echo "=== env file readable by pmmi? ==="
su -s /bin/bash pmmi -c 'test -r /home/pmmiserver/pmmi/.env && echo "env readable"' || echo "env NOT readable"
echo DONE
