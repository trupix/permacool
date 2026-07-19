import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { parseLogicDefinitionInput } from '@/server/logic-definition-input';
import { updateLogicDefinition } from '@/server/repositories/logic-definitions';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ definitionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const input = parseLogicDefinitionInput(await request.json().catch(() => null));
  if (!input) return NextResponse.json({ error: 'Invalid logic definition.' }, { status: 400 });

  const { definitionId } = await params;
  const definition = await updateLogicDefinition(definitionId, input, user);
  if (!definition) return NextResponse.json({ error: 'Logic definition not found or storage unavailable.' }, { status: 404 });
  return NextResponse.json({ definition });
}
