import { LogicDefinitionWorkspace } from '@/components/logic-definition-workspace';
import { requireUser } from '@/lib/auth';
import { getLogicDefinitions } from '@/server/repositories/logic-definitions';

export default async function LogicPage() {
  const user = await requireUser();
  const catalog = await getLogicDefinitions();

  return (
    <main className="page-stack logic-page">
      <header className="logic-page__heading">
        <p className="eyebrow">Operational source of truth</p>
        <h1>Logic and definitions</h1>
        <p className="page-copy">
          PLC signal meanings, equipment-state rules, event triggers, alarm behavior, storage, and display conventions in one maintained workspace.
        </p>
      </header>

      <LogicDefinitionWorkspace
        initialDefinitions={catalog.definitions}
        persistenceReady={catalog.persistenceReady}
        currentUserName={user.name}
      />
    </main>
  );
}
