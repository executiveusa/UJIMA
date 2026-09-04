import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.resolve(root, file), 'utf8');

describe('Slice 07 release gauntlet contract', () => {
  it('pins the existing Netlify site and keeps the public frontend frozen', () => {
    const loop = JSON.parse(read('control-plane/client-chat-execution-loop.json'));
    expect(loop.references.netlify_site_id).toBe('9ebe01e5-21cf-492d-a091-29dad057f91d');
    expect(loop.references.netlify_project).toBe('asc3nd-social-purpose-os');
    expect(loop.boundaries.client_surface).toBe('/app/*');
    expect(loop.boundaries.public_frontend.state).toBe('frozen');
    expect(loop.laws.no_direct_main).toBe(true);
    expect(loop.laws.builder_cannot_final_approve).toBe(true);
    expect(loop.slices.find((slice) => slice.id === '07')?.name).toBe('netlify-preview-and-full-gauntlet');
  });

  it('defines an explicit root-workspace Netlify build contract for the Next app', () => {
    const config = read('netlify.toml');
    expect(config).toContain('npm run build --workspace @asc3nd/site');
    expect(config).toContain('publish = "apps/site/.next"');
    expect(config).toContain('NODE_VERSION = "24"');
    expect(config).toContain('NEXT_PUBLIC_MISSION_API_URL = "https://api.asc3nd.org"');
    expect(config).toContain('NEXT_PUBLIC_MISSION_TENANT = "asc3nd"');
    expect(config).toContain('NEXT_PUBLIC_MISSION_PUBLIC_KEY = "pk_mission_YXNjM25kOjY0NWNlZmU3ZGU4NWNl"');
  });

  it('keeps the client shell mobile-first, keyboard-visible and reduced-motion safe', () => {
    const shellCss = read('apps/site/components/ClientChatShell.module.css');
    const globalCss = read('apps/site/app/globals.css');
    const evidenceCss = read('apps/site/components/MissionEvidencePanel.module.css');
    expect(shellCss).toContain('@media(max-width:840px)');
    expect(shellCss).toContain('.closeButton{display:block;min-width:44px;min-height:44px}');
    expect(shellCss).toContain('.menuButton{display:block;min-width:44px;min-height:44px}');
    expect(shellCss).toMatch(/\.composer button\{[^}]*width:44px;height:44px/);
    expect(shellCss).toContain('@media(prefers-reduced-motion:reduce)');
    expect(shellCss).toContain('.sidebar{transition:none!important}');
    expect(globalCss).toContain(':focus-visible');
    expect(evidenceCss).toMatch(/\.actions button,\.decisionActions button\{[^}]*min-height:44px/);
    expect(evidenceCss).toMatch(/@media\(max-width:700px\)[\s\S]*\.actions button,\.decisionActions button\{[^}]*min-height:44px/);
  });

  it('keeps evidence and approvals inspectable while explicitly separating approval from execution', () => {
    const panel = read('apps/site/components/MissionEvidencePanel.jsx');
    const shell = read('apps/site/components/ClientChatShell.jsx');
    expect(panel).toContain('Preview');
    expect(panel).toContain('Download');
    expect(panel).toContain('Approve');
    expect(panel).toContain('Reject');
    expect(panel).toContain('It does not publish, send, pay, submit, deploy, or execute the action by itself.');
    expect(shell).toContain('MissionEvidencePanel');
    expect(shell).toContain('handleAuthFailure');
  });

  it('points the browser client at the external mission API instead of silently owning mission truth in Netlify', () => {
    const api = read('apps/site/lib/api.js');
    expect(api).toContain('NEXT_PUBLIC_MISSION_API_URL');
    expect(api).toContain("'http://localhost:4000'");
    const loop = JSON.parse(read('control-plane/client-chat-execution-loop.json'));
    expect(loop.boundaries.icm_role).toBe('canonical_organizational_truth_and_recoverable_mission_memory');
  });
});
