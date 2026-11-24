import AppClient from '@/components/app-client';

/**
 * Keep the existing browser-only React Router app client-rendered during the
 * framework migration. This avoids invoking BrowserRouter during SSR and
 * preserves its URL, history, modal and shared-state behaviour.
 */
export const dynamic = 'force-dynamic';

export default function ApplicationPage() {
  return <AppClient />;
}
