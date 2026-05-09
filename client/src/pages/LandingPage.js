import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--surface)' }}>
      {/* Nav */}
      <nav style={{ padding:'0 40px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#0F7B6C"/>
            <path d="M16 6C11.5 6 8 9.5 8 14C8 17 9.5 19.5 12 21L11 26H21L20 21C22.5 19.5 24 17 24 14C24 9.5 20.5 6 16 6Z" fill="white" opacity="0.9"/>
          </svg>
          <span style={{ fontFamily:'var(--font-serif)', fontSize:'1.4rem' }}>DentaVision</span>
        </div>
        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/register/clinic" className="btn btn-primary btn-sm">Start free trial</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth:'900px', margin:'0 auto', padding:'80px 20px 60px', textAlign:'center' }}>
        <div className="badge badge-teal" style={{ marginBottom:'20px', fontSize:'0.8125rem' }}>
          For dental clinics & their patients
        </div>
        <h1 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', lineHeight:'1.15', marginBottom:'20px', color:'var(--ink)' }}>
          Turn treatment plans into<br/>
          <em style={{ color:'var(--teal)', fontStyle:'italic' }}>something patients understand</em>
        </h1>
        <p style={{ fontSize:'1.125rem', color:'var(--ink-secondary)', maxWidth:'560px', margin:'0 auto 36px', lineHeight:'1.7' }}>
          DentaVision scans printed treatment plans and instantly creates visual, plain-language tooth charts for patients — increasing case acceptance and reducing chair time spent explaining.
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/register/clinic" className="btn btn-primary btn-lg">
            Start 14-day free trial →
          </Link>
          <Link to="/register/patient" className="btn btn-ghost btn-lg">
            I'm a patient
          </Link>
        </div>
        <p style={{ fontSize:'0.8125rem', color:'var(--ink-tertiary)', marginTop:'14px' }}>No credit card required. 14-day free trial.</p>
      </section>

      {/* Features */}
      <section style={{ background:'var(--surface-2)', padding:'60px 20px' }}>
        <div style={{ maxWidth:'960px', margin:'0 auto' }}>
          <h2 style={{ textAlign:'center', marginBottom:'40px', fontSize:'2rem' }}>Everything in one platform</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:'20px' }}>
            {[
              { icon:'🔍', title:'AI plan scanning', desc:'Photograph or upload any printed treatment plan. Our AI reads CDT codes and maps findings to a visual tooth chart in seconds.' },
              { icon:'🦷', title:'3-angle tooth chart', desc:'Arch, front, and side views of all 32 teeth, color-coded by urgency. Patients instantly see what needs attention and why.' },
              { icon:'🎓', title:'Patient education AI', desc:'Patients ask questions in plain language and get warm, clear answers about their procedures — reducing anxiety and improving acceptance.' },
              { icon:'📊', title:'Clinic analytics', desc:'Track treatment acceptance rates, patient engagement, and revenue from accepted plans — all in your clinic dashboard.' },
              { icon:'🔗', title:'Clinic registration codes', desc:'Give patients your unique code. They sign up, link to your clinic, and see their charts on any device.' },
              { icon:'💳', title:'Simple subscription billing', desc:'Starter at $79/mo or Growth at $199/mo. Cancel any time. Scale as your clinic grows.' },
            ].map(f => (
              <div key={f.title} className="card">
                <div style={{ fontSize:'1.75rem', marginBottom:'10px' }}>{f.icon}</div>
                <h3 style={{ fontFamily:'var(--font-sans)', fontWeight:'600', fontSize:'1rem', marginBottom:'8px' }}>{f.title}</h3>
                <p style={{ fontSize:'0.875rem', color:'var(--ink-secondary)', lineHeight:'1.6' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding:'60px 20px', maxWidth:'700px', margin:'0 auto' }}>
        <h2 style={{ textAlign:'center', marginBottom:'8px' }}>Simple pricing</h2>
        <p style={{ textAlign:'center', color:'var(--ink-secondary)', marginBottom:'36px' }}>All plans include a 14-day free trial</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          {[
            { plan:'Starter', price:79, features:['Up to 50 patients/mo','AI plan scanning','Patient education','Email support'] },
            { plan:'Growth', price:199, features:['Unlimited patients','Analytics dashboard','Treatment tracking','Custom branding','Priority support'], featured:true },
          ].map(p => (
            <div key={p.plan} className="card" style={{ border: p.featured ? '2px solid var(--teal)' : undefined }}>
              {p.featured && <div className="badge badge-teal" style={{ marginBottom:'10px' }}>Most popular</div>}
              <h3 style={{ fontFamily:'var(--font-sans)', fontWeight:'600', fontSize:'1.125rem' }}>{p.plan}</h3>
              <p style={{ fontSize:'2rem', fontWeight:'700', margin:'8px 0 16px', color:'var(--ink)' }}>
                ${p.price}<span style={{ fontSize:'1rem', fontWeight:'400', color:'var(--ink-tertiary)' }}>/mo</span>
              </p>
              {p.features.map(f => (
                <div key={f} style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom:'8px', fontSize:'0.875rem' }}>
                  <span style={{ color:'var(--teal)', fontWeight:'600', flexShrink:0 }}>✓</span>
                  <span style={{ color:'var(--ink-secondary)' }}>{f}</span>
                </div>
              ))}
              <Link to="/register/clinic" className={`btn btn-${p.featured ? 'primary' : 'secondary'}`} style={{ width:'100%', marginTop:'16px', display:'block', textAlign:'center' }}>
                Start free trial
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'30px 20px', textAlign:'center' }}>
        <p style={{ fontSize:'0.875rem', color:'var(--ink-tertiary)' }}>
          © {new Date().getFullYear()} DentaVision · Built for dental professionals and their patients
        </p>
      </footer>
    </div>
  );
}
