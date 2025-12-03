/**
 * about.js - 서비스 소개 페이지
 */

import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Legal.module.css'

export default function About() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Sale Archive 소개 - SPA 세일 큐레이션</title>
        <meta
          name="description"
          content="Sale Archive의 서비스 목적, 운영 원칙, 데이터 수집·검증 방식, 광고 고지 및 연락처를 확인하세요."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://mion-spa-info.vercel.app/about" />
      </Head>

      <div className={styles.content}>
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>
            ← 홈으로 돌아가기
          </Link>
          <h1 className={styles.title}>Sale Archive 소개</h1>
          <p className={styles.subtitle}>최종 업데이트: 2024년 12월 16일</p>
        </header>

        <main className={styles.main}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>서비스 미션</h2>
            <p className={styles.text}>
              Sale Archive는 H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 등 주요 SPA 브랜드의 할인 상품을
              한곳에서 비교할 수 있게 설계된 큐레이션 서비스입니다. 단순 나열이 아닌, 시즌별 스타일링 팁과
              소재·체형·예산을 고려한 추천을 제공해 사용자가 빠르게 “지금 사도 되는 상품”을 찾도록 돕습니다.
            </p>
            <p className={styles.text}>
              매일 2회 이상 데이터를 갱신하며, 가격·할인율·이미지 오류가 확인되면 비노출 처리 후 대체 상품을 제안합니다.
              광고나 제휴 여부와 관계없이 동일한 노출 기준을 적용하고, 광고 위치는 라벨을 붙여 명확히 구분합니다.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>운영 및 연락처</h2>
            <ul className={styles.list}>
              <li>운영: 개인 프로젝트(패션·UX 리서처 출신), 비회원제 공개 서비스</li>
              <li>문의: contact@salearchive.com (오류 제보, 제휴/광고, 피드백)</li>
              <li>응답 목표: 영업일 기준 48시간 이내 1차 회신</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>데이터 수집·검증 과정</h2>
            <ol className={styles.numberedList}>
              <li>공식 스토어 페이지를 기준으로 가격, 할인율, 이미지, 카테고리 메타데이터 수집</li>
              <li>원가 대비 할인율을 재계산해 표기 불일치 여부를 확인, 오류 시 숨김 처리</li>
              <li>카테고리/성별/브랜드 태그 매핑 및 노출 우선순위(재고·할인율·신상품 여부) 산정</li>
              <li>매일 2회 이상 배치 실행 후 실패 로그 수동 점검, 중복 상품 정리</li>
            </ol>
            <p className={styles.text}>
              수집된 데이터는 사용자 로컬 저장소(찜 기능)와 읽기 전용 DB에만 저장되며, 별도의 회원 정보를 요구하지 않습니다.
              가격 변동과 품절이 감지되면 즉시 목록에서 제외하고, 대체 가능한 유사 아이템을 추천 리스트에 연결합니다.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>에디토리얼 가이드</h2>
            <ul className={styles.list}>
              <li>트렌드와 실사용을 모두 고려한 스타일링 노트 제공(컬러/소재/체형별 추천)</li>
              <li>광고·제휴 여부와 상관없이 동일한 품질 기준 적용, 리뷰는 대가성 없이 작성</li>
              <li>중복·낮은 해상도 이미지, 가격 정보가 불명확한 상품은 노출에서 제외</li>
              <li>모바일 사용성을 우선으로 한 카드 디자인과 접근성 기준 준수</li>
            </ul>
            <p className={styles.text}>
              모든 코멘트는 내부 에디토리얼 체크리스트(출처 명시, 시즌성, 착용 맥락, 관리 팁) 기반으로 작성됩니다.
              AI 자동 생성 문구는 사용하지 않으며, 검수된 문장만 게재합니다.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>광고·수익 고지</h2>
            <p className={styles.text}>
              Sale Archive의 수익 모델은 디스플레이 광고(AdSense)와 향후 제휴 링크로 구성될 수 있습니다.
              광고 영역은 “스폰서드” 라벨로 명확히 구분하며, 제휴 여부와 상관없이 동일한 상품 노출·필터 기준을 적용합니다.
              사용자가 광고를 클릭하더라도 추가 비용이 발생하지 않으며, 서비스 품질에 영향을 주지 않습니다.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>피드백 요청</h2>
            <p className={styles.text}>
              누락된 브랜드, 잘못된 정보, 접근성 개선 제안 등 언제든 의견을 보내주세요.
              확인 즉시 수정하고, 중요 변경 사항은 공지 섹션과 SNS에 함께 안내하겠습니다.
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}
