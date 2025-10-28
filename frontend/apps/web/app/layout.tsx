import './globals.css';
import WalletProviders from './providers/WalletProviders';
import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProviders>
          {children}
          <Toaster richColors expand={true} position="top-center" />
        </WalletProviders>
      </body>
    </html>
  );
}

