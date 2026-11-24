'use client';

import dynamic from 'next/dynamic';
import { CreditCard, ShieldCheck } from 'lucide-react';

const ExistingApplication = dynamic(() => import('@/App'), {
  ssr: false,
  loading: () => (
    <main className="app-loading" role="status" aria-live="polite" aria-label="Loading Cred Book">
      <div className="app-loading__content">
        <div className="app-loading__brand">
          <div className="app-loading__logo" aria-hidden="true">
            <CreditCard size={29} strokeWidth={2.1} />
          </div>
          <div className="app-loading__brand-copy">
            <span className="app-loading__eyebrow">PERSONAL FINANCE</span>
            <strong>Cred Book</strong>
          </div>
        </div>

        <section className="app-loading__welcome" aria-hidden="true">
          <div className="app-loading__heading-line" />
          <h1>Getting things ready</h1>
          <p>Your financial workspace is loading.</p>
        </section>

        <div className="app-loading__skeleton-card" aria-hidden="true">
          <div className="app-loading__skeleton-heading">
            <span className="app-loading__shimmer app-loading__icon-placeholder" />
            <span className="app-loading__skeleton-copy">
              <i className="app-loading__shimmer app-loading__line app-loading__line--wide" />
              <i className="app-loading__shimmer app-loading__line app-loading__line--short" />
            </span>
          </div>
          <div className="app-loading__skeleton-stats">
            <span className="app-loading__shimmer app-loading__stat" />
            <span className="app-loading__shimmer app-loading__stat" />
          </div>
          <span className="app-loading__shimmer app-loading__skeleton-action" />
        </div>

        <div className="app-loading__footer">
          <span className="app-loading__spinner" aria-hidden="true" />
          <span>Loading your cards and transactions…</span>
        </div>
        <div className="app-loading__privacy">
          <ShieldCheck size={14} strokeWidth={2} />
          <span>Your finance workspace</span>
        </div>
      </div>
    </main>
  ),
});

export default function AppClient() {
  return <ExistingApplication />;
}
