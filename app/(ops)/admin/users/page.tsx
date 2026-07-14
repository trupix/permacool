import { SectionCard } from '@/components/section-card';
import { getUsers } from '@/server/repositories/users';

export default async function UsersAdminPage() {
  const users = await getUsers();
  return (
    <main className="page-stack">
      <header>
        <p className="eyebrow">Admin</p>
        <h1>Users and roles</h1>
      </header>

      <SectionCard title="Access model" eyebrow="Placeholder auth shell">
        <div className="table-like">
          {users.map((user) => (
            <div key={user.id} className="table-row">
              <span>{user.name}</span>
              <span>{user.email}</span>
              <span>{user.role}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}
