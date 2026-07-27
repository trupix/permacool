import Link from 'next/link';
import { Activity, FileText, LayoutDashboard, Wifi } from 'lucide-react';

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
  active
}: {
  siteId: string;
  siteName: string;
  active: SiteSection;
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
    </nav>
  );
}
