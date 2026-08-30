'use client';

import { createContext, useContext, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export type ActiveSiteContextValue = {
  siteId: string;
  siteName: string;
};

export const ActiveSiteContext = createContext<
  Dispatch<SetStateAction<ActiveSiteContextValue | null>> | null
>(null);

export function ActiveSiteAnnouncer({ siteId, siteName }: ActiveSiteContextValue) {
  const setActiveSite = useContext(ActiveSiteContext);

  useEffect(() => {
    setActiveSite?.({ siteId, siteName });
  }, [setActiveSite, siteId, siteName]);

  return null;
}
