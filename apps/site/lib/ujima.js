export const ujimaProduct = {
  id: 'ujima',
  name: 'Ujima OS',
  shortName: 'UJIMA',
  description: 'An in-house agentic operating system for international nonprofit, volunteer, community, and social-purpose teams.',
  promise: 'Collective work. Shared responsibility.',
  audience: 'International nonprofit, volunteer, community, NGO, and social-purpose teams',
};

export const ujimaClients = [
  {
    id: 'asc3nd',
    name: 'ASC3ND',
    status: 'active',
    relationship: 'client',
    tenantId: 'asc3nd',
    region: 'Seattle, Washington, USA',
    summary: 'Youth, mentorship, community programs, fundraising, communications, and social operations.',
    workspaceHref: '/app?client=asc3nd',
  },
];

export function getClient(clientId) {
  return ujimaClients.find((client) => client.id === clientId) || null;
}
