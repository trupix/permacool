import Link from 'next/link';
import {
  Activity,
  ExternalLink,
  FileText,
  LayoutDashboard,
  RadioTower,
  Wifi,
  Workflow
} from 'lucide-react';
import styles from './site-section-nav.module.css';

type SiteSection = 'overview' | 'connectivity' | 'specs' | 'events';

const sections = [
  { id: 'overview' as const, label: 'Live', suffix: '', icon: LayoutDashboard },
  { id: 'connectivity' as const, label: 'Connectivity', suffix: '/connectivity', icon: Wifi },
  { id: 'specs' as const, label: 'Location Specs', suffix: '/specs', icon: FileText },
  { id: 'events' as const, label: 'Events', suffix: '/events', icon: Activity }
];

export function SiteSectionNav({
  siteId,
  siteName,
  active,
  controllerManageUrl = null,
  nodeRedUrl = null
}: {
  siteId: string;
  siteName: string;
  active: SiteSection;
  controllerManageUrl?: string | null;
  nodeRedUrl?: string | null;
}) {
  return (
    <nav className="site-section-nav" aria-label={`${siteName} pages`}>
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = section.id === active;

        return (
          <Link
            key={section.id}
            href={`/sites/${siteId}${section.suffix}`}
            className={isActive ? 'is-active' : undefined}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={15} aria-hidden="true" />
            <span>{section.label}</span>
          </Link>
        );
      })}
      {controllerManageUrl ? (
        <a
          className="is-groov-manage"
          href={controllerManageUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${siteName} groov Manage over VPN`}
        >
          <RadioTower size={15} aria-hidden="true" />
          <span>groov Manage</span>
          <ExternalLink size={12} aria-hidden="true" />
        </a>
      ) : (
        <span
          className={styles.unconfigured}
          aria-label={`${siteName} groov Manage not configured`}
          aria-disabled="true"
        >
          <RadioTower size={15} aria-hidden="true" />
          <span>groov Manage</span>
          <small>Not configured</small>
        </span>
      )}
      {nodeRedUrl ? (
        <a
          className="is-node-red"
          href={nodeRedUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${siteName} Node-RED editor over VPN`}
        >
          <Workflow size={15} aria-hidden="true" />
          <span>Node-RED</span>
          <ExternalLink size={12} aria-hidden="true" />
        </a>
      ) : (
        <span
          className={styles.unconfigured}
          aria-label={`${siteName} Node-RED not configured`}
          aria-disabled="true"
        >
          <Workflow size={15} aria-hidden="true" />
          <span>Node-RED</span>
          <small>Not configured</small>
        </span>
      )}
    </nav>
  );
}
