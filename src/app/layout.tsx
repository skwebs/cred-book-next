import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cred Book',
  description: 'Private credit card and transaction manager.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Cred Book',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Cred Book' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#09090b',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`html:not([data-theme]) body { visibility: hidden; }`}</style>
        <script
          id="cred-book-theme-bootstrap"
          dangerouslySetInnerHTML={{
            __html: `try {
              var savedTheme = window.localStorage.getItem('ccm-theme');
              var resolvedTheme = savedTheme === 'light' || savedTheme === 'dark'
                ? savedTheme
                : savedTheme === 'system'
                  ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                  : 'dark';
              var root = document.documentElement;
              root.dataset.theme = resolvedTheme;
              root.style.colorScheme = resolvedTheme;
              var themeColor = document.querySelector('meta[name="theme-color"]');
              if (themeColor) themeColor.setAttribute('content', resolvedTheme === 'dark' ? '#09090b' : '#f8fafc');
            } catch (error) {
              document.documentElement.dataset.theme = 'dark';
              document.documentElement.style.colorScheme = 'dark';
            }`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
