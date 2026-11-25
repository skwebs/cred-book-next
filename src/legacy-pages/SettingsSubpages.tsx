import SettingsView from './views/SettingsView';

type SettingsPageProps = any;

export function SettingsOverviewPage(props: SettingsPageProps) {
  return <SettingsView {...props} page="overview" />;
}

export function FinancialSettingsPage(props: SettingsPageProps) {
  return <SettingsView {...props} page="financial" />;
}

export function DisplaySettingsPage(props: SettingsPageProps) {
  return <SettingsView {...props} page="experience" />;
}

export function StorageSettingsPage(props: SettingsPageProps) {
  return <SettingsView {...props} page="storage" />;
}

export function AccountSettingsPage(props: SettingsPageProps) {
  return <SettingsView {...props} page="account" />;
}

export function AboutSettingsPage(props: SettingsPageProps) {
  return <SettingsView {...props} page="about" />;
}
