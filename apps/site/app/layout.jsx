import './globals.css';

export const metadata = {
  title: 'Ujima OS — Collective work. Shared responsibility.',
  description: 'An agentic operating system for volunteers, nonprofits, community groups, and social-purpose teams.',
  metadataBase: new URL(process.env.PUBLIC_SITE_URL || 'http://localhost:3000')
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
