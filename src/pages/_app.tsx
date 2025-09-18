// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import '../styles/globals.css';

// Importamos AuthProvider dinámicamente sin SSR
const AuthProviderNoSSR = dynamic(
  () => import('../context/AuthContext').then(mod => ({ default: mod.AuthProvider })),
  { ssr: false }
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProviderNoSSR>
      <Component {...pageProps} />
    </AuthProviderNoSSR>
  );
}