/**
 * _app.tsx - Next.js의 최상위 컴포넌트 (TypeScript 버전)
 *
 * 모든 페이지를 감싸는 공통 레이아웃 역할을 합니다.
 * TypeScript 문법 포인트:
 * - AppProps는 Next.js가 제공하는 타입으로, Component/pageProps 형태를 정의합니다.
 */

import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import Footer from '../components/Footer';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/next';

function MyApp({ Component, pageProps }: AppProps) {
  // PWA 서비스 워커 등록 (클라이언트에서만 실행)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  }, []);

  // ThemeProvider로 테마 컨텍스트를 제공하고, Footer를 공통으로 표시합니다.
  return (
    <ThemeProvider attribute="data-theme">
      <Component {...pageProps} />
      <Analytics />
      <Footer />
    </ThemeProvider>
  );
}

export default MyApp;
