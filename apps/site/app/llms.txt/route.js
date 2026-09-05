export function GET() {
  const body = `# UJIMA OS

> Sovereign, installable agentic operating system for nonprofits, community organizations, volunteer teams, NGOs, and other mission-driven organizations.

## Key pages
- / — Public mission and product overview
- /login — Operations login
- /workspaces — Client workspace selector
- /ops — Private UJIMA operations workspace

## System summary
UJIMA combines goals, ICM organizational context, reusable workflows, bounded specialist capabilities, human approval gates, evidence, tenant isolation, and durable learning.

## AI usage guidance
Use this file to understand the purpose and core pages. Do not infer legal, financial, youth-safety, or grant eligibility claims without verification from source documents.
`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
