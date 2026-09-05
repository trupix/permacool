'use client';

import { createContext, useContext, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { ConnectionStage } from '@/lib/equipment/controller-connection-path';

export type ConnectionHealthSnapshot = { siteId: string; stages: ConnectionStage[] };
export const ConnectionHealthContext = createContext<Dispatch<SetStateAction<ConnectionHealthSnapshot | null>> | null>(null);

export function ConnectionHealthAnnouncer({ siteId, stages }: ConnectionHealthSnapshot) {
  const publish = useContext(ConnectionHealthContext);
  const serialized = JSON.stringify(stages);
  useEffect(() => {
    publish?.({ siteId, stages: JSON.parse(serialized) });
  }, [publish, siteId, serialized]);
  useEffect(() => () => { publish?.(null); }, [publish, siteId]);
  return null;
}
