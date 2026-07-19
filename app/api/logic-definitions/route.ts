import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  createLogicDefinition,
  getLogicDefinitions
} from '@/server/repositories/logic-definitions';
import { parseLogicDefinitionInput } from '@/server/logic-definition-input';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const result = await getLogicDefinitions();
  return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const input = parseLogicDefinitionInput(await request.json().catch(() => null));
  if (!input) return NextResponse.json({ error: 'Invalid logic definition.' }, { status: 400 });

  const definition = await createLogicDefinition(input, user);
  if (!definition) return NextResponse.json({ error: 'Logic storage is unavailable.' }, { status: 503 });
  return NextResponse.json({ definition }, { status: 201 });
}
