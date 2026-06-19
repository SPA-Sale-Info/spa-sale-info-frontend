/**
 * privacy.tsx - 개인정보처리방침 페이지
 *
 * 정적인 정책 문서를 렌더링합니다.
 * Head 태그로 검색 엔진용 메타를 설정합니다.
 */

import Link from 'next/link'
import SEO from '../components/SEO'
import styles from '../styles/Legal.module.css'

export default function Privacy() {
  // 정적 콘텐츠이므로 별도 상태 없이 JSX만 반환
  return (
    <div className={styles.container}>
      <SEO
        title="개인정보처리방침 - ARCA"
        description="ARCA의 개인정보처리방침입니다."
        canonical="https://mion-spa-info.vercel.app/privacy"
      />

      <div className={styles.content}>
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>
            ← 홈으로 돌아가기
          </Link>
          <h1 className={styles.title}>개인정보처리방침</h1>
          <p className={styles.subtitle}>최종 수정일: 2024년 12월 14일</p>
        </header>

        <main className={styles.main}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. 개인정보의 처리 목적</h2>
            <p className={styles.text}>
              ARCA(이하 &quot;본 서비스&quot;)는 다음의 목적을 위하여 개인정보를 처리합니다.
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등
              필요한 조치를 이행할 예정입니다.
            </p>
            <ul className={styles.list}>
              <li>본 서비스는 현재 회원가입 기능을 제공하지 않으며, 개인정보를 수집하지 않습니다.</li>
              <li>서비스 이용 과정에서 IP 주소, 쿠키, 방문 일시 등의 정보가 자동으로 생성되어 수집될 수 있습니다.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. 개인정보의 처리 및 보유 기간</h2>
            <p className={styles.text}>
              본 서비스는 사용자의 개인정보를 수집하지 않습니다.
              다만, 서비스 제공 과정에서 자동으로 생성되는 정보는 다음과 같이 처리됩니다:
            </p>
            <ul className={styles.list}>
              <li>
                <strong>쿠키 및 접속 로그</strong>: 서비스 이용 기록은 통계 분석 및 서비스 개선 목적으로
                수집일로부터 최대 1년간 보관 후 파기됩니다.
              </li>
              <li>
                <strong>Google Analytics</strong>: 웹사이트 방문 통계 분석을 위해 Google Analytics를 사용하며,
                이는 Google의 개인정보처리방침을 따릅니다.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. 개인정보의 제3자 제공</h2>
            <p className={styles.text}>
              본 서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. 개인정보처리 위탁</h2>
            <p className={styles.text}>
              본 서비스는 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다:
            </p>
            <ul className={styles.list}>
              <li>
                <strong>Vercel</strong>: 웹사이트 호스팅 및 배포 서비스
              </li>
              <li>
                <strong>Google</strong>: 웹사이트 통계 분석 (Google Analytics), 광고 서비스 (Google AdSense)
              </li>
            </ul>
            <p className={styles.text}>
              위탁받은 업체는 개인정보를 위탁 계약 내용 이외의 용도로 사용할 수 없으며,
              관련 법령에 따라 안전하게 관리할 의무가 있습니다.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. 이용자의 권리·의무 및 그 행사방법</h2>
            <p className={styles.text}>
              본 서비스는 별도의 회원가입 절차가 없으며 개인정보를 수집하지 않습니다.
              다만, 쿠키 사용과 관련하여 다음의 권리를 가집니다:
            </p>
            <ul className={styles.list}>
              <li>브라우저 설정을 통해 쿠키 허용 여부를 선택할 수 있습니다.</li>
              <li>쿠키 설정 거부 시 서비스 이용에는 영향이 없으나, 일부 기능이 제한될 수 있습니다.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. 처리하는 개인정보의 항목</h2>
            <p className={styles.text}>
              본 서비스는 별도로 개인정보를 수집하지 않습니다.
              다만, 서비스 이용 과정에서 아래와 같은 정보가 자동으로 생성되어 수집될 수 있습니다:
            </p>
            <ul className={styles.list}>
              <li>접속 IP 정보</li>
              <li>쿠키</li>
              <li>접속 로그</li>
              <li>서비스 이용 기록</li>
              <li>방문 일시</li>
              <li>기기 정보 (브라우저 종류, OS 등)</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. 개인정보의 파기</h2>
            <p className={styles.text}>
              본 서비스는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
              지체없이 해당 개인정보를 파기합니다.
            </p>
            <p className={styles.text}>
              <strong>파기 절차 및 방법:</strong>
            </p>
            <ul className={styles.list}>
              <li>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
              <li>쿠키 및 로그 데이터는 보유기간 경과 후 자동으로 삭제됩니다.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. 개인정보 보호책임자</h2>
            <p className={styles.text}>
              본 서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고,
              개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여
              아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className={styles.contact}>
              <p><strong>개인정보 보호책임자</strong></p>
              <p>이메일: contact@salearchive.com</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>9. 개인정보의 안전성 확보 조치</h2>
            <p className={styles.text}>
              본 서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
            </p>
            <ul className={styles.list}>
              <li>
                <strong>관리적 조치</strong>: 내부관리계획 수립·시행, 정기적 직원 교육
              </li>
              <li>
                <strong>기술적 조치</strong>: 개인정보처리시스템 등의 접근권한 관리,
                접근통제시스템 설치, 보안프로그램 설치
              </li>
              <li>
                <strong>물리적 조치</strong>: 전산실, 자료보관실 등의 접근통제
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>10. 쿠키(Cookie)의 운용</h2>
            <p className={styles.text}>
              본 서비스는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고
              수시로 불러오는 &apos;쿠키(cookie)&apos;를 사용합니다.
            </p>
            <p className={styles.text}>
              <strong>쿠키의 사용 목적:</strong>
            </p>
            <ul className={styles.list}>
              <li>웹사이트 방문 및 이용 형태 파악</li>
              <li>서비스 개선 및 통계 분석</li>
              <li>광고 게재 및 효과 측정</li>
            </ul>
            <p className={styles.text}>
              <strong>쿠키 설정 거부 방법:</strong>
            </p>
            <p className={styles.text}>
              이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다.
              웹브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나,
              쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>11. 광고 서비스</h2>
            <p className={styles.text}>
              본 서비스는 Google AdSense를 통해 광고를 게재합니다.
              Google AdSense는 쿠키를 사용하여 사용자의 관심사에 맞는 광고를 표시합니다.
            </p>
            <p className={styles.text}>
              광고 쿠키 사용을 거부하려면{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Google 광고 설정 페이지
              </a>
              를 방문하시기 바랍니다.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>12. 개인정보처리방침 변경</h2>
            <p className={styles.text}>
              이 개인정보처리방침은 시행일로부터 적용되며,
              법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는
              변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>13. 정보주체의 권익침해에 대한 구제방법</h2>
            <p className={styles.text}>
              개인정보침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.
            </p>
            <ul className={styles.list}>
              <li>
                개인정보침해신고센터 (한국인터넷진흥원 운영)
                <br />
                - 소관업무: 개인정보 침해사실 신고, 상담 신청
                <br />
                - 홈페이지: privacy.kisa.or.kr
                <br />
                - 전화: (국번없이) 118
              </li>
              <li>
                개인정보 분쟁조정위원회
                <br />
                - 소관업무: 개인정보 분쟁조정신청, 집단분쟁조정 (민사적 해결)
                <br />
                - 홈페이지: www.kopico.go.kr
                <br />
                - 전화: (국번없이) 1833-6972
              </li>
              <li>
                대검찰청 사이버범죄수사단: 02-3480-3573 (www.spo.go.kr)
              </li>
              <li>
                경찰청 사이버안전국: 182 (http://cyberbureau.police.go.kr)
              </li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  )
}
