import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClinicNav } from '../../components/shared/NavBar';
import api from '../../utils/api';

export default function ClinicBilling() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState('');
  const [params] = useSearchParams();

  useEffect(() => {
    api.get('/billing/status').then(r => { setStatus(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleUpgrade = async (plan) => {
    setUpgrading(plan);
    try {
      const { data } = await api.post('/billing/checkout', { plan });
      window.location.href = data.url;
    } catch (err) {
      alert(err.response?.data?.error || 'Billing error. Please try again.');
      setUpgrading('');
    }
  };

  const handleManage = async () => {
    try {
      const { data } = await api.post('/billing/portal');
      window.location.href = data.url;
    } catch (err) {
      alert('Could not open billing portal. Please try again.');
    }
  };

  if (loading) return <><ClinicNav /><div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><span className="spinner" /></div></>;

  const { subscription, plans } = status || {};
  const isActive = ['active', 'trialing'].includes(subscription?.status);

  return (
    <div className="page">
      <ClinicNav />
      <main className="container" style={{ padding: '32px 20px', maxWidth: '760px' }}>

        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '1.5rem', marginBottom: '24px' }}>Billing & subscription</h1>

        {params.get('success') && (
          <div className="alert alert-success">🎉 Subscription activated! You now have full access to DentaVision.</div>
        )}
        {params.get('canceled') && (
          <div className="alert alert-info">Checkout was canceled. Your current plan is unchanged.</div>
        )}

        {/* Current plan */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '1rem' }}>Current plan</h3>
            <span className={`badge badge-${isActive ? 'healthy' : 'urgent'}`}>
              {subscription?.status}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)', marginBottom: '4px' }}>Plan</p>
              <p style={{ fontWeight: '600', fontSize: '1.25rem', textTransform: 'capitalize' }}>{subscription?.plan}</p>
            </div>
            {subscription?.currentPeriodEnd && (
              <div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)', marginBottom: '4px' }}>
                  {subscription.status === 'trialing' ? 'Trial ends' : 'Next billing date'}
                </p>
                <p style={{ fontWeight: '500' }}>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
              </div>
            )}
          </div>
          {subscription?.stripeSubscriptionId && (
            <button className="btn btn-ghost btn-sm" onClick={handleManage}>
              Manage payment method / cancel →
            </button>
          )}
        </div>

        {/* Plan options */}
        <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: '14px' }}>
          {subscription?.plan === 'trial' || subscription?.plan === 'trialing' ? 'Choose a plan' : 'Change plan'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
          {Object.entries(plans || {}).map(([key, plan]) => {
            const isCurrent = subscription?.plan === key;
            return (
              <div key={key} className="card" style={{ border: isCurrent ? '2px solid var(--teal)' : key === 'growth' ? '2px solid var(--teal-mid)' : undefined }}>
                {key === 'growth' && !isCurrent && (
                  <div className="badge badge-teal" style={{ marginBottom: '10px' }}>Most popular</div>
                )}
                {isCurrent && (
                  <div className="badge badge-healthy" style={{ marginBottom: '10px' }}>Current plan</div>
                )}
                <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '1.125rem', marginBottom: '4px' }}>{plan.name}</h3>
                <p style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '14px' }}>
                  ${plan.price}<span style={{ fontSize: '0.9rem', fontWeight: '400', color: 'var(--ink-tertiary)' }}>/mo</span>
                </p>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--teal)', flexShrink: 0 }}>✓</span>
                    <span style={{ color: 'var(--ink-secondary)' }}>{f}</span>
                  </div>
                ))}
                {!isCurrent && (
                  <button className={`btn btn-${key === 'growth' ? 'primary' : 'secondary'}`}
                    style={{ width: '100%', marginTop: '14px' }}
                    onClick={() => handleUpgrade(key)}
                    disabled={!!upgrading}>
                    {upgrading === key ? <><span className="spinner" style={{ width: '14px', height: '14px' }} /> Redirecting…</> : `Switch to ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Enterprise CTA */}
        <div style={{ background: 'var(--surface-3)', borderRadius: 'var(--r-lg)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>Enterprise / DSO</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)' }}>Multi-location, white-label, EHR integration, custom pricing</p>
          </div>
          <a href="mailto:hello@dentavision.io?subject=Enterprise inquiry" className="btn btn-ghost btn-sm">Contact us</a>
        </div>
      </main>
    </div>
  );
}
