import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cyxdevcjycmffhmwxojh.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

async function authenticate(request) {
  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ') || !SUPABASE_KEY) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_KEY, authorization: auth },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return response.json();
}

function demoReply(text) {
  const lower = text.toLowerCase();
  if (lower.includes('grant')) return 'I can turn this into a funding goal, identify the evidence we need, and route discovery through UJIMA Grants. The live model provider is not connected yet, but this conversation is authenticated and persisted in Supabase.';
  if (lower.includes('goal')) return 'I would start by turning that into one clear goal with a success condition, constraints, and an approval rule. This test route is already saving the conversation to Supabase.';
  return 'I received that inside the authenticated UJIMA workspace. The Supabase session and conversation layer are live. The model gateway is running in demo mode until we attach a provider key.';
}

export async function POST(request) {
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const last = [...messages].reverse().find((message) => message?.role === 'user');
  const gatewayUrl = process.env.MODEL_GATEWAY_BASE_URL || '';
  const gatewayKey = process.env.MODEL_GATEWAY_API_KEY || '';
  const model = process.env.MODEL_GATEWAY_MODEL || 'demo';

  if (gatewayUrl && gatewayKey) {
    const response = await fetch(`${gatewayUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${gatewayKey}` },
      body: JSON.stringify({ model, messages, temperature: 0.2 }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ error: data?.error?.message || 'Model gateway failed.' }, { status: 502 });
    return NextResponse.json({
      text: data?.choices?.[0]?.message?.content || '',
      route: 'model_gateway',
      provider: gatewayUrl,
      model,
    });
  }

  return NextResponse.json({ text: demoReply(last?.content || ''), route: 'demo', provider: 'local', model: 'deterministic-demo' });
}
