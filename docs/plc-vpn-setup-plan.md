# PLC VPN Setup Plan

## Goal

Create a secure VPN path so a remote groov EPIC / PAC Control PLC site can connect outbound to a VPN server, and Jose can connect from another location to manage groov Manage, Node-RED, and read-only telemetry setup.

## Target Architecture

```text
Jose laptop/admin machine
        |
        | OpenVPN client
        v
Google Cloud VM with OpenVPN server
        ^
        | OpenVPN client, outbound from site
        |
groov EPIC / PAC Control site
```

The PLC/groov EPIC should not expose groov Manage, Node-RED, PAC Control, SSH, or PLC services directly to the public internet.

## Recommended Approach

Use a Google Cloud Compute Engine VM running OpenVPN Access Server.

Why:

- Google Cloud is a normal place to host the VPN server.
- OpenVPN Access Server provides a web admin UI.
- It can generate downloadable `.ovpn` client profiles.
- groov EPIC supports OpenVPN client configuration through groov Manage.

## Prerequisites

- Google Cloud account with billing enabled.
- A Google Cloud project for PermaCool infrastructure.
- Permission to create Compute Engine VMs and firewall rules.
- groov EPIC admin access through groov Manage.
- Someone on-site or an existing remote path to import the groov EPIC `.ovpn` profile.
- A strong naming convention for sites/devices.

Suggested names:

```text
VPN server: permacool-plc-vpn-01
Admin VPN user: jose-admin
PLC VPN user: salinas-groov-epic-01
Gateway ID: groov-epic-01
Site ID: site-salinas
Device ID: epic-mvp-01
```

## Phase 1: Create Google Cloud VPN Server

1. Create or select a Google Cloud project.
2. Enable Compute Engine.
3. Reserve a static external IP address.
4. Create a small Ubuntu VM.
   - Ubuntu 22.04 or 24.04 LTS
   - e2-micro or e2-small to start
   - attach the reserved static IP
5. Add firewall rules.
   - Allow OpenVPN UDP `1194` from the internet.
   - Allow admin UI/SSH only from trusted admin IPs when possible.
   - Do not expose any PLC/groov ports publicly.
6. Install OpenVPN Access Server.
7. Log into the OpenVPN admin UI.
8. Confirm the server hostname/public IP is correct.

## Phase 2: Create VPN Client Profiles

Create separate users/profiles:

```text
jose-admin
salinas-groov-epic-01
```

Rules:

- One VPN profile per physical device/person.
- Do not reuse the admin profile on the PLC.
- Use strong passwords or certificate-only auth if configured.
- Store generated profiles securely.

Download:

```text
jose-admin.ovpn
salinas-groov-epic-01.ovpn
```

## Phase 3: Test Admin Laptop First

1. Install OpenVPN client on Jose's laptop.
2. Import `jose-admin.ovpn`.
3. Connect to the VPN.
4. Confirm the laptop receives a VPN IP.
5. Confirm OpenVPN Access Server shows `jose-admin` connected.

Do not move to PLC setup until this works.

## Phase 4: Configure groov EPIC OpenVPN Client

This step requires either on-site access or an existing remote path into groov Manage.

1. Log into groov Manage as an admin.
2. Go to the VPN/OpenVPN client configuration area.
3. Import `salinas-groov-epic-01.ovpn`.
4. Start/enable the OpenVPN client.
5. Confirm OpenVPN Access Server shows `salinas-groov-epic-01` connected.
6. Record the assigned VPN IP.

Example record:

```text
Site: Salinas
Device: groov EPIC
VPN user: salinas-groov-epic-01
VPN IP: 10.8.0.10
```

## Phase 5: Remote Access Test

From Jose's laptop while connected to VPN:

1. Open groov Manage using the EPIC VPN IP.
2. Confirm Node-RED is reachable over VPN.
3. Confirm PAC Control/groov services needed for read-only telemetry are reachable.
4. Do not enable write/control paths yet.

Expected first target:

```text
https://<groov-epic-vpn-ip>
```

## Phase 6: Import Telemetry Flow

After VPN access works:

1. Open Node-RED on the groov EPIC.
2. Import `gateway/flows.json`.
3. Configure:
   - `TELEMETRY_INGEST_TOKEN`
   - `PERMACOOL_GATEWAY_ID`
   - `PERMACOOL_SITE_ID`
   - `PERMACOOL_DEVICE_ID`
4. Replace simulated values with PAC Control read nodes.
5. Deploy the flow.
6. Confirm POSTs to:

```text
https://www.perma.cool/api/ingest/telemetry
```

## Security Guardrails

- No public port forwarding to groov Manage, Node-RED, PAC Control, SSH, or PLC services.
- VPN server is the only public ingress.
- Use unique VPN profiles per device/user.
- Revoke lost or unused profiles.
- Keep telemetry token secret.
- Start with read-only telemetry only.
- Do not write to PAC Control variables remotely without a separate safety plan.
- Back up the PAC Control strategy and Node-RED flows before making changes.

## Open Questions For Setup Session

- Which Google Cloud project should host the VPN VM?
- Does Jose already have a Google Cloud billing account ready?
- Will the site provide someone on-site to import the `.ovpn` file?
- Which groov EPIC firmware version is installed?
- Is Node-RED already enabled on the EPIC?
- Are PAC Control strategy tag names available?
- Should the EPIC receive a static VPN IP?
- Should the VPN server be OpenVPN Access Server or community OpenVPN?

## Done Criteria

- Google Cloud VM is running OpenVPN.
- `jose-admin` can connect from laptop.
- groov EPIC can connect outbound as its own VPN client.
- Jose can reach groov Manage over the VPN IP.
- Node-RED is reachable over VPN.
- Telemetry flow is imported and sending read-only data to PermaCool Ops.
- No PLC/groov services are exposed directly to the public internet.
