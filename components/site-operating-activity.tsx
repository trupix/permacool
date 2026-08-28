import { Activity, CircleHelp, Clock3, History, MoonStar } from 'lucide-react';
import { SITE_OPERATING_ACTIVITY_LABELS, type SiteOperatingActivity } from '@/lib/site-operating-activity';

const icons = {
  running_now: Activity,
  ran_within_12h: History,
  idle_12_to_24h: Clock3,
  idle_over_24h: MoonStar,
  never_observed: CircleHelp
};

export function SiteOperatingActivityIcon({ activity }: { activity: SiteOperatingActivity }) {
  const Icon = icons[activity.state];
  const label = SITE_OPERATING_ACTIVITY_LABELS[activity.state];
  return (
    <span
      className={`site-operating-activity site-operating-${activity.state}`}
      aria-label={`Equipment activity: ${label}`}
      title={`Equipment activity: ${label}`}
    >
      <Icon size={14} strokeWidth={2.4} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
