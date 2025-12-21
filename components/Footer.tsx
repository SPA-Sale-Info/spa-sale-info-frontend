/**
 * Footer.tsx - 사이트 하단 푸터 컴포넌트 (TypeScript 버전)
 */

import Link from 'next/link';
import styles from '../styles/Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* 메인 푸터 콘텐츠 */}
        <div className={styles.main}>
          {/* 브랜드 섹션 */}
          <div className={styles.section}>
            <h3 className={styles.brand}>맛 프로젝트</h3>
            <p className={styles.description}>
              합리적인 가격으로 즐기는
              <br />
              프리미엄 스타일 큐레이션
            </p>
          </div>

          {/* 서비스 링크 */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>서비스</h4>
            <nav className={styles.nav}>
              <Link href="/" className={styles.link}>
                세일 상품
              </Link>
              <Link href="/style-guide" className={styles.link}>
                스타일 가이드
              </Link>
              <Link href="/favorites" className={styles.link}>
                즐겨찾기
              </Link>
            </nav>
          </div>

          {/* 정보 링크 */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>정보</h4>
            <nav className={styles.nav}>
              <Link href="/about" className={styles.link}>
                서비스 소개
              </Link>
              <Link href="/contact" className={styles.link}>
                문의하기
              </Link>
            </nav>
          </div>

          {/* 약관 링크 */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>약관</h4>
            <nav className={styles.nav}>
              <Link href="/privacy" className={styles.link}>
                개인정보처리방침
              </Link>
              <Link href="/terms" className={styles.link}>
                이용약관
              </Link>
            </nav>
          </div>
        </div>

        {/* 소셜 미디어 (준비 중) */}
        <div className={styles.social}>
          <p className={styles.socialText}>소셜 미디어 준비 중입니다 🎉</p>
        </div>

        {/* 하단 정보 */}
        <div className={styles.bottom}>
          <div className={styles.info}>
            <p className={styles.infoText}>
              <strong>운영</strong>: 개인 프로젝트
            </p>
            <p className={styles.infoText}>
              <strong>문의</strong>:{' '}
              <a href="mailto:support@salearchive.com" className={styles.emailLink}>
                support@salearchive.com
              </a>
            </p>
            <p className={styles.infoText}>
              <strong>호스팅</strong>: Vercel
            </p>
          </div>

          {/* 저작권 */}
          <div className={styles.copyright}>
            <p>© {currentYear} 맛 프로젝트 (Sale Archive). All rights reserved.</p>
          </div>

          {/* 면책 조항 */}
          <div className={styles.disclaimer}>
            <p>
              본 서비스는 정보 제공 목적으로 운영되며, 실제 구매는 각 브랜드 공식 사이트에서 이루어집니다. 상품
              정보는 실시간으로 업데이트되지만, 최종 가격과 재고는 공식 사이트를 확인해주세요.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
