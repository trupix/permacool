import { SectionCard } from '@/components/section-card';
import { requireStaff } from '@/lib/auth';
import { getUsers } from '@/server/repositories/users';
import { getOrganizations } from '@/server/repositories/organizations';
import { getDevices } from '@/server/repositories/devices';
import { approveUser, reactivateUser, rejectUser, suspendUser } from './actions';

export default async function UsersAdminPage() {
  const admin = await requireStaff(['staff_admin']);

  const [users, organizations, devices] = await Promise.all([
    getUsers(admin),
    getOrganizations(admin),
    getDevices(admin)
  ]);
  const pendingUsers = users.filter((user) => user.status === 'pending');
  return (
    <main className="page-stack">
      <header>
        <p className="eyebrow">Admin</p>
        <h1>Users and roles</h1>
      </header>

      <SectionCard title="Pending access requests" eyebrow={`${pendingUsers.length} awaiting review`}>
        <div className="list-stack">
          {pendingUsers.length ? pendingUsers.map((user) => (
            <form key={user.id} action={approveUser} className="auth-form panel">
              <input type="hidden" name="userId" value={user.id} />
              <div>
                <strong>{user.name}</strong>
                <p>{user.email} · {user.companyName}</p>
                {user.accessNote ? <p>{user.accessNote}</p> : null}
              </div>
              <label>
                Organization
                <select name="organizationId" required>
                  {organizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>{organization.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Customer role
                <select name="membershipRole" defaultValue="viewer">
                  <option value="customer_admin">Customer admin</option>
                  <option value="operator">Operator</option>
                  <option value="viewer">Viewer</option>
                </select>
              </label>
              <label>
                Equipment access
                <select name="accessMode" defaultValue="all">
                  <option value="all">All equipment in organization</option>
                  <option value="assigned">Only selected equipment</option>
                </select>
              </label>
              <fieldset>
                <legend>Selected equipment (used for restricted access)</legend>
                {devices.map((device) => (
                  <label key={device.id}>
                    <input type="checkbox" name="deviceIds" value={device.id} /> {device.name}
                  </label>
                ))}
              </fieldset>
              <div className="button-row">
                <button className="button-primary" type="submit">Approve access</button>
                <button className="button-secondary" formAction={rejectUser} type="submit">Reject</button>
              </div>
            </form>
          )) : <p className="empty-state">No pending customer requests.</p>}
        </div>
      </SectionCard>

      <SectionCard title="Users and access" eyebrow="Approved and inactive accounts">
        <div className="table-like">
          {users.map((user) => (
            <div key={user.id} className="table-row">
              <span>{user.name}</span>
              <span>{user.email}</span>
              <span>{user.platformRole}</span>
              <span>{user.status}</span>
              {user.status === 'approved' && user.platformRole === 'customer' ? (
                <form action={suspendUser}>
                  <input type="hidden" name="userId" value={user.id} />
                  <button className="button-secondary" type="submit">Suspend</button>
                </form>
              ) : user.status === 'suspended' && user.platformRole === 'customer' ? (
                <form action={reactivateUser}>
                  <input type="hidden" name="userId" value={user.id} />
                  <button className="button-secondary" type="submit">Reactivate</button>
                </form>
              ) : <span />}
            </div>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}
