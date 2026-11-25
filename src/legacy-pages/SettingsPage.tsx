import { Navigate, useLocation } from 'react-router-dom';
import { useAppRouteContext, type AppRouteContext } from '../routes/route-context';

/** Route-aware Settings page outlet. Each URL renders a dedicated page component. */
export default function SettingsPage() {
  const { pages } = useAppRouteContext<AppRouteContext>();
  const pathname = useLocation().pathname.replace(/\/$/, '') || '/settings';
  switch (pathname) {
    case '/settings': return <>{pages.settings}</>;
    case '/settings/financial': return <>{pages.settingsFinancial}</>;
    case '/settings/experience': return <>{pages.settingsExperience}</>;
    case '/settings/storage': return <>{pages.settingsStorage}</>;
    case '/settings/account': return <>{pages.settingsAccount}</>;
    case '/settings/about': return <>{pages.settingsAbout}</>;
    default: return <Navigate to="/settings" replace />;
  }
}
