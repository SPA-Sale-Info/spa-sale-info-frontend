/**
 * terms.tsx - 이용약관 페이지
 *
 * 서비스 이용약관을 정적 문서 형태로 제공합니다.
 */

import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Legal.module.css'

export default function Terms() {
  // 별도 로직 없이 콘텐츠만 렌더링
  return (
    <div className={styles.container}>
      <Head>
        <title>이용약관 - Sale Archive</title>
        <meta name="description" content="Sale Archive의 이용약관입니다." />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className={styles.content}>
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>
            ← 홈으로 돌아가기
          </Link>
          <h1 className={styles.title}>이용약관</h1>
          <p className={styles.subtitle}>최종 수정일: 2024년 12월 14일</p>
        </header>

        <main className={styles.main}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>제1조 (목적)</h2>
            <p className={styles.text}>
              본 약관은 Sale Archive(이하 "서비스")가 제공하는 SPA 브랜드 할인 정보 큐레이션 서비스의
              이용과 관련하여 서비스와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>제2조 (정의)</h2>
            <p className={styles.text}>본 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
            <ul className={styles.list}>
              <li>
                <strong>"서비스"</strong>란 Sale Archive가 운영하는 웹사이트를 통해 제공하는
                SPA 브랜드 할인 정보 큐레이션 및 관련 부가 서비스를 의미합니다.
              </li>
              <li>
                <strong>"이용자"</strong>란 본 서비스에 접속하여 본 약관에 따라
                서비스를 이용하는 모든 사용자를 말합니다.
              </li>
              <li>
                <strong>"큐레이션 정보"</strong>란 서비스가 각 브랜드의 공식 웹사이트에서 수집한
                할인 상품 정보를 가공하여 제공하는 콘텐츠를 의미합니다.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>제3조 (약관의 효력 및 변경)</h2>
            <ol className={styles.numberedList}>
              <li>
                본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.
              </li>
              <li>
                본 약관의 내용은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지하고,
                이에 동의한 이용자가 서비스에 가입함으로써 효력이 발생합니다.
              </li>
              <li>
                서비스는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며,
                약관이 변경되는 경우 지체 없이 이를 공지합니다.
              </li>
              <li>
                이용자가 변경된 약관에 동의하지 않는 경우, 서비스 이용을 중단하고
                이용 계약을 해지할 수 있습니다.
              </li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>제4조 (서비스의 제공)</h2>
            <ol className={styles.numberedList}>
              <li>
                서비스는 다음과 같은 업무를 수행합니다:
                <ul className={styles.list}>
                  <li>H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 등 SPA 브랜드의 할인 상품 정보 수집 및 제공</li>
                  <li>브랜드별, 카테고리별, 성별 필터링 기능 제공</li>
                  <li>상품 검색 기능 제공</li>
                  <li>할인율 및 가격 정보 제공</li>
                  <li>매일 업데이트되는 스타일링 제안</li>
                  <li>기타 서비스가 정하는 업무</li>
                </ul>
              </li>
              <li>
                서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.
                다만, 시스템 정기점검, 증설 및 교체를 위해 서비스가 정한 날이나 시간에
                서비스를 일시 중단할 수 있으며, 예정된 작업으로 인한 서비스 일시 중단은
                사전에 공지합니다.
              </li>
              <li>
                서비스는 긴급한 시스템 점검, 증설 및 교체 등 부득이한 사유로 인하여
                사전 공지 없이 일시적으로 서비스를 중단할 수 있으며,
                새로운 서비스로의 교체 등 서비스가 적절하다고 판단하는 사유에 의하여
                현재 제공되는 서비스를 완전히 중단할 수 있습니다.
              </li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>제5조 (서비스 이용)</h2>
            <ol className={styles.numberedList}>
              <li>
                본 서비스는 별도의 회원가입 없이 누구나 자유롭게 이용할 수 있습니다.
              </li>
              <li>
                이용자는 서비스를 이용함으로써 본 약관에 동의한 것으로 간주됩니다.
              </li>
              <li>
                서비스 이용 시간은 서비스의 업무상 또는 기술상 특별한 지장이 없는 한
                연중무휴, 1일 24시간을 원칙으로 합니다.
              </li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>제6조 (서비스의 변경 및 중지)</h2>
            <ol className={styles.numberedList}>
              <li>
                서비스는 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를
                변경할 수 있습니다.
              </li>
              <li>
                서비스는 다음 각 호에 해당하는 경우 서비스의 전부 또는 일부를
                제한하거나 중지할 수 있습니다:
                <ul className={styles.list}>
                  <li>서비스용 설비의 보수 등 공사로 인한 부득이한 경우</li>
                  <li>이용자가 서비스의 운영을 고의 또는 과실로 방해하는 경우</li>
                  <li>정전, 제반 설비의 장애 또는 이용량의 폭주 등으로 정상적인 서비스 이용에 지장이 있는 경우</li>
                  <li>서비스 제휴업체와의 계약 종료 등과 같은 서비스 운영상 필요한 경우</li>
                  <li>기타 천재지변, 국가비상사태 등 불가항력적 사유가 있는 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>제7조 (정보의 제공)</h2>
            <ol className={styles.numberedList}>
              <li>
                서비스는 각 브랜드의 공식 온라인 스토어에서 공개적으로 제공하는
                상품 정보를 수집하여 이용자에게 제공합니다.
              </li>
              <li>
                서비스가 제공하는 정보는 참고용이며, 실제 가격, 재고 상황, 할인율 등은
                각 브랜드의 공식 웹사이트에서 최종 확인해야 합니다.
              </li>
              <li>
                서비스는 제공되는 정보의 정확성, 완전성, 신뢰성을 보장하지 않으며,
                정보의 오류나 누락으로 인한 손해에 대해 책임을 지지 않습니다.
              </li>
              <li>
                이용자가 서비스에 게재된 정보를 신뢰하여 취한 모든 행위의 결과에 대한
                책임은 전적으로 이용자에게 있습니다.
              </li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>제8조 (저작권 및 지적재산권)</h2>
            <ol className={styles.numberedList}>
              <li>
                서비스가 작성한 저작물에 대한 저작권 및 기타 지적재산권은 서비스에 귀속합니다.
              </li>
              <li>
                이용자는 서비스를 이용함으로써 얻은 정보를 서비스의 사전 승낙 없이
                복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리 목적으로 이용하거나
                제3자에게 이용하게 하여서는 안됩니다.
              </li>
              <li>
                서비스에 게재된 각 브랜드의 상품 이미지, 설명 등의 지적재산권은
                해당 브랜드에 귀속되며, 서비스는 정보 제공 목적으로만 이를 사용합니다.
              </li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>제9조 (광고게재 및 광고주와의 거래)</h2>
            <ol className={styles.numberedList}>
              <li>
                서비스는 서비스 운영과 관련하여 서비스 화면, 홈페이지 등에
                광고를 게재할 수 있습니다.
              </li>
              <li>
                서비스는 Google AdSense 등 제3자 광고 서비스를 사용할 수 있으며,
                이러한 광고 서비스는 쿠키를 사용하여 맞춤 광고를 제공할 수 있습니다.
              </li>
              <li>
                이용자가 서비스에 게재된 광고를 통해 광고주와 거래를 하는 것은
                전적으로 이용자와 광고주 간의 문제이며, 서비스는 이와 관련하여
                어떠한 책임도 지지 않습니다.
              </li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>제10조 (면책조항)</h2>
            <ol className={styles.numberedList}>
              <li>
                서비스는 천재지변 또는 이에 준하는 불가항력으로 인하여
                서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
              </li>
              <li>
                서비스는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여
                책임을 지지 않습니다.
              </li>
              <li>
                서비스는 이용자가 서비스를 통해 얻은 정보로 인한 손해에 대해서
                책임을 지지 않습니다.
              </li>
              <li>
                서비스는 이용자가 각 브랜드의 공식 웹사이트에서 상품을 구매하는 과정에서
                발생하는 문제에 대해 책임을 지지 않습니다.
              </li>
              <li>
                서비스는 각 브랜드가 제공하는 상품의 품질, 가격, 배송 등에 대해
                책임을 지지 않습니다.
              </li>
              <li>
                서비스에 표시된 할인 정보는 수집 시점 기준이며, 실시간으로 변경될 수 있습니다.
                최종 가격 및 할인율은 각 브랜드의 공식 웹사이트에서 확인해야 합니다.
              </li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>제11조 (이용자의 의무)</h2>
            <ol className={styles.numberedList}>
              <li>
                이용자는 다음 행위를 하여서는 안됩니다:
                <ul className={styles.list}>
                  <li>허위 내용의 등록</li>
                  <li>타인의 정보 도용</li>
                  <li>서비스에 게시된 정보의 변경</li>
                  <li>서비스가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 송신 또는 게시</li>
                  <li>서비스 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>서비스 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>외설 또는 폭력적인 메시지, 화상, 음성 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                  <li>서비스의 동의 없이 영리를 목적으로 서비스를 사용하는 행위</li>
                  <li>기타 관련 법령에 위배되는 행위</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>제12조 (연결사이트와의 관계)</h2>
            <ol className={styles.numberedList}>
              <li>
                서비스는 이용자에게 다른 웹사이트(각 브랜드의 공식 웹사이트 등)로의
                링크를 제공할 수 있습니다.
              </li>
              <li>
                연결된 웹사이트에서 제공하는 상품, 서비스, 정보 등에 대해서는
                서비스가 책임을 지지 않습니다.
              </li>
              <li>
                이용자가 연결된 웹사이트에서 상품을 구매하거나 서비스를 이용할 때 발생하는
                모든 문제는 해당 웹사이트와 이용자 간의 문제입니다.
              </li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>제13조 (분쟁의 해결)</h2>
            <ol className={styles.numberedList}>
              <li>
                서비스는 이용자로부터 제출되는 불만사항 및 의견을 우선적으로 처리합니다.
                다만, 신속한 처리가 곤란한 경우에는 이용자에게 그 사유와 처리일정을 즉시 통보합니다.
              </li>
              <li>
                서비스와 이용자 간에 발생한 분쟁은 전자거래기본법 제28조 및
                동 시행령 제15조에 의하여 설치된 전자거래분쟁조정위원회의 조정에 따를 수 있습니다.
              </li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>제14조 (재판권 및 준거법)</h2>
            <ol className={styles.numberedList}>
              <li>
                본 약관은 대한민국 법령에 의하여 규정되고 이행됩니다.
              </li>
              <li>
                서비스와 이용자 간에 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제소합니다.
              </li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>제15조 (고지 의무)</h2>
            <p className={styles.text}>
              서비스는 본 약관과 관련하여 이용자에게 통지할 사항이 있을 경우
              서비스 내 공지사항을 통해 고지합니다.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>부칙</h2>
            <p className={styles.text}>본 약관은 2024년 12월 14일부터 시행됩니다.</p>
          </section>

          <div className={styles.contact}>
            <h3>문의사항</h3>
            <p>본 약관에 대한 문의사항이 있으시면 아래 연락처로 문의해 주시기 바랍니다.</p>
            <p>이메일: contact@salearchive.com</p>
          </div>
        </main>
      </div>
    </div>
  )
}
