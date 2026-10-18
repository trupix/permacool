export default function DashboardLoading() {
  return (
    <main className="page-stack" aria-busy="true">
      <header>
        <p className="eyebrow">Customer portal</p>
        <h1>Loading dashboard</h1>
        <p className="page-copy" role="status">Loading your sites, controllers, and alerts…</p>
      </header>
    </main>
  );
}
