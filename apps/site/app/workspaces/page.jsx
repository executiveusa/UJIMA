import { ujimaClients, ujimaProduct } from '../../lib/ujima';

export const metadata = {
  title: 'Workspaces — Ujima OS',
  description: 'Choose the organization or internal workspace you want to work in.',
};

export default function WorkspacesPage() {
  return (
    <main style={{minHeight:'100vh',background:'#f2efe7',color:'#161616',padding:'40px 24px 72px'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <header style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'center',borderBottom:'1px solid #c8c2b6',paddingBottom:20}}>
          <a href="/" style={{color:'inherit',textDecoration:'none',fontWeight:800,letterSpacing:'.08em'}}>UJIMA</a>
          <a href="/ops" style={{color:'inherit'}}>Internal operations</a>
        </header>

        <section style={{padding:'72px 0 48px'}}>
          <p style={{letterSpacing:'.12em',textTransform:'uppercase',fontSize:12}}>Signed-in workspace</p>
          <h1 style={{fontSize:'clamp(48px,8vw,112px)',lineHeight:.9,margin:'14px 0 24px'}}>Where are we working?</h1>
          <p style={{fontSize:'clamp(18px,2vw,25px)',lineHeight:1.45,maxWidth:760}}>{ujimaProduct.description}</p>
        </section>

        <section aria-labelledby="clients-heading">
          <h2 id="clients-heading" style={{fontSize:14,letterSpacing:'.12em',textTransform:'uppercase',marginBottom:18}}>Client workspaces</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
            {ujimaClients.map((client) => (
              <a key={client.id} href={client.workspaceHref} style={{display:'block',color:'inherit',textDecoration:'none',border:'1px solid #90897c',padding:28,minHeight:220,background:'#fff'}}>
                <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}>
                  <span style={{fontSize:12,letterSpacing:'.1em',textTransform:'uppercase'}}>Client 01</span>
                  <span style={{fontSize:12,textTransform:'uppercase'}}>{client.status}</span>
                </div>
                <h3 style={{fontSize:42,margin:'42px 0 12px'}}>{client.name}</h3>
                <p style={{lineHeight:1.5,margin:0}}>{client.summary}</p>
                <p style={{margin:'22px 0 0',fontWeight:700}}>Open workspace →</p>
              </a>
            ))}
          </div>
        </section>

        <section style={{marginTop:52,paddingTop:24,borderTop:'1px solid #c8c2b6'}}>
          <h2 style={{fontSize:14,letterSpacing:'.12em',textTransform:'uppercase'}}>Ujima internal</h2>
          <p style={{maxWidth:680,lineHeight:1.55}}>Product administration, runtime health, approvals, tenant provisioning, and platform operations stay separate from client work.</p>
          <a href="/ops" style={{color:'inherit',fontWeight:700}}>Open internal operations →</a>
        </section>
      </div>
    </main>
  );
}
