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
    url: env.openVpnProvisioningRelayUrl,
    workloadIdentityAudience: env.gcpProvisioningWorkloadIdentityAudience,
    serviceAccountEmail: env.gcpProvisioningServiceAccountEmail
  };
}

export type { OpenVpnProvisioningStatus };

export function getOpenVpnProvisioningStatus(
  oidcToken: string,
  options: OpenVpnClientOptions = {}
): Promise<OpenVpnProvisioningStatus> {
  return getOpenVpnProvisioningStatusFor(config(), oidcToken, options);
}

export function generateOpenVpnProfile(
  request: OpenVpnProfileRequest,
  oidcToken: string,
  idempotencyKey: string,
  options: OpenVpnClientOptions = {}
) {
  return generateOpenVpnProfileFor(config(), request, oidcToken, idempotencyKey, options);
}
