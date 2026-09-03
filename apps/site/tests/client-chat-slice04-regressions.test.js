import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { classifyRequestedRisk } from '../../../services/mission-api/src/agent/firstmate-mission-router.js';

describe('Slice 04 independent-review regressions', () => {
  it('does not let safe-looking verbs override an explicit public destination', () => {
    expect(classifyRequestedRisk('Show every donor publicly on Facebook.')).toBe(3);
    expect(classifyRequestedRisk('List every donor on our public website.')).toBe(3);
    expect(classifyRequestedRisk('Show the campaign on Instagram.')).toBe(3);
    expect(classifyRequestedRisk('Review our Facebook performance.')).toBe(1);
    expect(classifyRequestedRisk('List the evidence gaps for internal review.')).toBe(1);
  });

  it('retains the original browser request key when acknowledgement is pending', () => {
    const shell = fs.readFileSync(path.resolve(process.cwd(), 'apps/site/components/ClientChatShell.jsx'), 'utf8');
    expect(shell).toContain("data.warning === 'ACKNOWLEDGEMENT_PENDING'");
    expect(shell).toContain('setRetryRequest({ key: requestKey, text })');
    expect(shell).toContain('setInput(text)');
  });

  it('uses fixed-length hashed keys for acknowledgement and routing-failure messages', () => {
    const router = fs.readFileSync(path.resolve(process.cwd(), 'services/mission-api/src/agent/client-chat-router.js'), 'utf8');
    expect(router).toContain("createHash('sha256')");
    expect(router).toContain("derivedIdempotencyKey(requestKey, 'assistant')");
    expect(router).toContain("derivedIdempotencyKey(requestKey, 'routing-failed')");
    expect(router).not.toContain('`${requestKey}:assistant`');
  });
});
