# UJIMA Agent Plugin

This package lets Claude Code, Codex-compatible Agent Plugins clients, and other MCP-capable assistants call UJIMA without reimplementing UJIMA's orchestration.

## What it exposes

- authenticated workspace context;
- conversations;
- governed chat requests;
- Groundwork;
- approvals/rejections;
- evidence/artifact state through conversation reads;
- portable conversation export.

The MCP server calls the same tenant-scoped UJIMA client-chat API used by the web application.

## Configuration

Set these in the environment of the client launching the plugin:

- `UJIMA_API_URL` — Mission API base URL, for example `https://api.example.org`.
- `UJIMA_MISSION_TOKEN` — an existing tenant-scoped UJIMA mission session token.

Do not put the mission token into `plugin.json`, `mcp.json`, source control, prompts, screenshots, or shared files.

The normal web login exchanges a verified Supabase session for this mission token. Future remote OAuth can replace manual token configuration without changing the tool contract.

## Portable layout

- `plugin.json` — Agent Plugins 1.0 manifest.
- `mcp.json` — portable stdio MCP configuration.
- `skills/` — UJIMA and Groundwork behavior.
- `.claude-plugin/plugin.json` + `.mcp.json` — Claude Code compatibility.
- `.codex-plugin/plugin.json` — Codex compatibility metadata.
- `server.mjs` — dependency-free MCP bridge.

## Governance

External assistants do not receive elevated authority. Tenant identity comes from the mission token. Consequential actions still require UJIMA approval.
