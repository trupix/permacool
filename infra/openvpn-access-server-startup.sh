#!/usr/bin/env bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates wget net-tools gnupg
install -d -m 0755 /etc/apt/keyrings
wget -qO /etc/apt/keyrings/as-repository.asc https://packages.openvpn.net/as-repo-public.asc
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/as-repository.asc] http://packages.openvpn.net/as/debian noble main" > /etc/apt/sources.list.d/openvpn-as-repo.list
apt-get update
apt-get install -y openvpn-as
systemctl enable --now openvpnas

