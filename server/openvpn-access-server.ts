import { env } from '@/lib/env';
import {
  generateOpenVpnProfileFor,
  getOpenVpnProvisioningStatusFor,
  type OpenVpnClientOptions,
  type OpenVpnProfileRequest,
  type OpenVpnProvisioningStatus
} from './openvpn-access-server-client';

function config() {
  return {
    url: env.openVpnAccessServerUrl,
    username: env.openVpnAccessServerUsername,
    password: env.openVpnAccessServerPassword
  };
}

export type { OpenVpnProvisioningStatus };

export function getOpenVpnProvisioningStatus(
  options: OpenVpnClientOptions = {}
): Promise<OpenVpnProvisioningStatus> {
  return getOpenVpnProvisioningStatusFor(config(), options);
}

export function generateOpenVpnProfile(
  request: OpenVpnProfileRequest,
  options: OpenVpnClientOptions = {}
) {
  return generateOpenVpnProfileFor(config(), request, options);
}
