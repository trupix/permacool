# PermaCool VPN Operations Runbook

## Purpose

This runbook explains how agents should manage the PermaCool OpenVPN Access Server, client profiles, and VPN-related files.

## Current Environment

```text
Google Cloud project: project-10fbf5ae-d9d0-4052-ba0
VM: permacool-plc-vpn-01
Zone: us-east4-b
Public IP: 35.243.46.137
OpenVPN Admin UI: https://35.243.46.137:943/admin
OpenVPN Client UI: https://35.243.46.137:943/
groov EPIC VPN IP: 172.28.0.10
groov Manage: https://172.28.0.10/
```

OpenVPN client traffic normally uses UDP port `1194`, with TCP `443` included as a fallback in generated profiles.

## VPN Identities

Each person or device must have its own independently revocable identity.

```text
jose-admin              Jose's auto-login VPN client
salinas-groov-epic-01   Salinas groov EPIC; static VPN IP 172.28.0.10
david-dev               David's user-locked developer profile
openvpn                 OpenVPN Access Server web/CLI administrator
```

Despite its name, `jose-admin` is an auto-login VPN identity and is not the OpenVPN Access Server administrative account. VPN access, OpenVPN administration, Google Cloud access, and Linux SSH access are separate permission layers.

## Local File Handling

Client profiles are stored locally under:

```text
vpn-profiles/
```

This directory is ignored by Git. Never commit, paste into documentation, upload to an issue, or include an `.ovpn` profile in a general backup. User-locked and auto-login profiles contain private client key material and must be treated like passwords.

Rules:

- Never reuse one person's profile for another person.
- Never rename a copied profile and treat it as a new identity.
- Share a profile and its password through separate secure channels.
- Do not record plaintext VPN passwords in the repository, logs, memory files, or chat.
- Prefer a user-locked profile for people.
- Reserve auto-login profiles for unattended devices such as the groov EPIC.
- Delete temporary server-side profile exports after confirmed delivery when practical.
- Record only non-secret metadata and file hashes in documentation.

## Google Cloud CLI Access

The Google Cloud CLI is installed at:

```text
C:\Users\Bonny\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd
```

Confirm the active account and SSH access before making changes:

```powershell
$gcloud = 'C:\Users\Bonny\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd'

& $gcloud auth list --filter=status:ACTIVE --format='value(account)'

& $gcloud compute ssh permacool-plc-vpn-01 `
  --zone us-east4-b `
  --project project-10fbf5ae-d9d0-4052-ba0 `
  --command='whoami && hostname' `
  --quiet
```

Use the local CLI when possible. The Google Cloud browser SSH and Cloud Shell authorization handoff may open an empty popup or remain stuck on an OAuth `One moment please` page.

## Create a Human VPN User

Generate a strong password locally without printing it. Run these commands on the VPN VM through `gcloud compute ssh` or an interactive SSH session:

```bash
cd /usr/local/openvpn_as/scripts

sudo ./sacli \
  --user 'NEW-USERNAME' \
  --key 'type' \
  --value 'user_connect' \
  UserPropPut

sudo ./sacli \
  --user 'NEW-USERNAME' \
  --key 'user_auth_type' \
  --value 'local' \
  UserPropPut

sudo ./sacli \
  --user 'NEW-USERNAME' \
  --new_pass 'STRONG-TEMPORARY-PASSWORD' \
  SetLocalPassword

sudo ./sacli start

sudo ./sacli \
  --user 'NEW-USERNAME' \
  GetUserlogin > "$HOME/NEW-USERNAME.ovpn"

chmod 600 "$HOME/NEW-USERNAME.ovpn"
```

`GetUserlogin` creates a user-locked profile containing `auth-user-pass`. Do not enable `prop_autologin` for a human developer unless there is a documented operational need.

Download the profile:

```powershell
& $gcloud compute scp `
  'permacool-plc-vpn-01:/home/REMOTE-USER/NEW-USERNAME.ovpn' `
  'C:\Users\Bonny\.openclaw\workspace\PermaCool\vpn-profiles\NEW-USERNAME.ovpn' `
  --zone us-east4-b `
  --project project-10fbf5ae-d9d0-4052-ba0 `
  --quiet
```

The remote Linux username may differ between Google accounts. Confirm it with `whoami` rather than assuming it.

## Verify a New Profile

Verify without exposing embedded certificates or private keys:

```powershell
$profile = 'vpn-profiles\NEW-USERNAME.ovpn'

Get-Content -LiteralPath $profile |
  Where-Object {
    $_ -match '^(client|remote |auth-user-pass|dev |dev-type|remote-cert-tls)'
  }

Get-FileHash -Algorithm SHA256 -LiteralPath $profile
```

For a human user, confirm that `auth-user-pass` is present. On the server, inspect the user record:

```bash
cd /usr/local/openvpn_as/scripts
sudo ./sacli --user 'NEW-USERNAME' UserPropGet
```

Expected properties include:

```text
type: user_connect
user_auth_type: local
```

The user must not have `prop_superuser: true`. Avoid printing the full user database in shared logs because it can include password digests and other account metadata.

## Revoke Access

To immediately deny a user while preserving the record:

```bash
cd /usr/local/openvpn_as/scripts
sudo ./sacli --user 'USERNAME' --key 'prop_deny' --value 'true' UserPropPut
sudo ./sacli start
```

To delete all properties for an account:

```bash
cd /usr/local/openvpn_as/scripts
sudo ./sacli --user 'USERNAME' UserPropDelAll
sudo ./sacli start
```

Also remove any local copy of the revoked profile from `vpn-profiles/` using a recoverable deletion method when available. Do not delete the PLC account or its profile during human-user cleanup.

## Connectivity Checks

From a connected Windows client:

```powershell
Test-NetConnection 172.28.0.10 -Port 443
```

A successful test confirms network reachability to groov Manage. It does not prove that the user has groov Manage application credentials.

Do not expose groov Manage, Node-RED, PAC Control, SSH, or PLC services directly to the public internet. The VPN server remains the only public ingress path.

## License Constraint

The current OpenVPN Access Server free license permits two simultaneous VPN connections. The Salinas groov EPIC normally consumes one continuously, leaving one connection for either Jose or another developer.

Creating additional profiles is allowed, but a third simultaneous connection requires additional licensed capacity. Do not disconnect or modify the groov EPIC merely to make room for another user without coordinating the operational impact.

## Secret-Safety Checklist

Before finishing VPN work, confirm:

- The new user has a unique identity.
- Human profiles require a password unless explicitly justified otherwise.
- The user is not an OpenVPN administrator.
- The `.ovpn` file is under the ignored `vpn-profiles/` directory.
- No plaintext password appeared in files, terminal output, logs, documentation, or chat.
- The profile hash and non-secret directives were verified.
- Existing PLC connectivity was not interrupted.
- The recipient was warned about the two-connection limit.
