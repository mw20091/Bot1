import './globals.css';
import { AuthProvider } from './auth-context';

export const metadata = {
  title: 'WhatsApp Bot Dashboard',
  description: 'Personal WhatsApp bot testing dashboard'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
