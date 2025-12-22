/**
 * _app.tsx - Next.js의 최상위 컴포넌트 (TypeScript 버전)
 */

import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import Footer from '../components/Footer';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  // PWA 서비스 워커 등록
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  }, []);

  return (
    <ThemeProvider attribute="data-theme">
      <Component {...pageProps} />
      <Footer />
    </ThemeProvider>
  );
}

export default MyApp;
