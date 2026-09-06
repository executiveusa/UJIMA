import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cyxdevcjycmffhmwxojh.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 12000;

const UJIMA_DEVELOPER_PROMPT = `You are UJIMA, a sovereign operating agent for mission-driven organizations.
Work from the user's requested outcome. Be concise, concrete, and useful.
Do not invent organizational facts, evidence, approvals, or completed actions.
Separate what is known from what still needs verification.
When consequential action or external side effects are required, prepare the work and make the approval point explicit.
Prefer the smallest next step that advances the goal.`;

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

function normalizeMessages(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((message) => ['user', 'assistant'].includes(message?.role) && typeof message?.content === 'string')
    .slice(-MAX_MESSAGES)
    .map((message) => ({ role: message.role, content: message.content.slice(0, MAX_MESSAGE_CHARS) }));
}

function openAiChatUrl(baseUrl) {
  const base = baseUrl.replace(/\/$/, '');
  return `${base}${base.endsWith('/v1') ? '' : '/v1'}/chat/completions`;
}

function resolveGateway() {
  const explicitUrl = process.env.MODEL_GATEWAY_BASE_URL || '';
  const explicitKey = process.env.MODEL_GATEWAY_API_KEY || '';
  if (explicitUrl && explicitKey) {
    return {
      key: explicitKey,
      url: `${explicitUrl.replace(/\/$/, '')}/chat/completions`,
      provider: 'custom',
    };
  }

  const openAiUrl = process.env.OPENAI_BASE_URL || '';
  const openAiKey = process.env.OPENAI_API_KEY || '';
  if (openAiUrl && openAiKey) {
    return {
      key: openAiKey,
      url: openAiChatUrl(openAiUrl),
      provider: 'netlify-ai-gateway',
    };
  }

  const gatewayUrl = process.env.NETLIFY_AI_GATEWAY_BASE_URL || '';
  const gatewayKey = process.env.NETLIFY_AI_GATEWAY_KEY || '';
  if (gatewayUrl && gatewayKey) {
    return {
      key: gatewayKey,
      url: openAiChatUrl(gatewayUrl),
      provider: 'netlify-ai-gateway',
    };
  }

  return null;
}

function demoReply(text) {
  const lower = text.toLowerCase();
  if (lower.includes('grant')) return 'I can turn this into a funding goal, identify the evidence we need, and route discovery through UJIMA Grants. The live model route is not available in this runtime yet, but this conversation is authenticated and persisted in Supabase.';
  if (lower.includes('goal')) return 'I would start by turning that into one clear goal with a success condition, constraints, and an approval rule. This conversation is already saving to Supabase.';
  return 'I received that inside the authenticated UJIMA workspace. The Supabase session and conversation layer are live. This runtime is using the deterministic fallback because no model gateway is available.';
}

export async function GET() {
  const gateway = resolveGateway();
  return NextResponse.json({
    ok: true,
    providerConfigured: Boolean(gateway),
    provider: gateway?.provider || 'demo',
    model: process.env.MODEL_GATEWAY_MODEL || 'gpt-5.6-luna',
    auth: SUPABASE_KEY ? 'supabase' : 'missing',
  });
}

export async function POST(request) {
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const messages = normalizeMessages(body.messages);
  const last = [...messages].reverse().find((message) => message.role === 'user');
  if (!last) return NextResponse.json({ error: 'A user message is required.' }, { status: 400 });

  const gateway = resolveGateway();
  const model = process.env.MODEL_GATEWAY_MODEL || 'gpt-5.6-luna';

  if (gateway) {
    const response = await fetch(gateway.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${gateway.key}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'developer', content: UJIMA_DEVELOPER_PROMPT }, ...messages],
      }),
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json({
        error: data?.error?.message || 'Model gateway failed.',
        route: 'model_gateway_error',
        provider: gateway.provider,
        model,
      }, { status: 502 });
    }
    const text = data?.choices?.[0]?.message?.content || '';
    if (!text) return NextResponse.json({ error: 'Model gateway returned no text.', route: 'model_gateway_error', provider: gateway.provider, model }, { status: 502 });
    return NextResponse.json({
      text,
      route: 'model_gateway',
      provider: gateway.provider,
      model,
    });
  }

  return NextResponse.json({ text: demoReply(last.content), route: 'demo', provider: 'local', model: 'deterministic-demo' });
}
