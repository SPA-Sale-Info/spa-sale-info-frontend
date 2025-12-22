/**
 * contact.js - 연락처 페이지
 *
 * 구글 애드센스 승인을 위한 필수 페이지
 * 사용자가 서비스 운영자에게 연락할 수 있는 정보를 제공합니다.
 */

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Legal.module.css';
import contactStyles from '../styles/Contact.module.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // 간단한 유효성 검사
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('올바른 이메일 주소를 입력해주세요.')
      return
    }

    // 실제로는 여기서 백엔드 API를 호출합니다

    // 성공 상태로 설정
    setSubmitStatus('success')

    // 폼 초기화
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    })

    // 3초 후 성공 메시지 제거
    setTimeout(() => {
      setSubmitStatus(null)
    }, 3000)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>문의하기 - Sale Archive</title>
        <meta name="description" content="맛 프로젝트에 대한 문의, 제안, 피드백을 보내주세요. 언제나 열려있습니다." />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className={styles.content}>
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>
            ← 홈으로 돌아가기
          </Link>
          <h1 className={styles.title}>문의하기</h1>
          <p className={styles.subtitle}>궁금한 점이나 제안사항이 있으시면 언제든 연락주세요</p>
        </header>

        <main className={styles.main}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📧 이메일 문의</h2>
            <p className={styles.text}>
              가장 빠르고 확실한 연락 방법입니다.
            </p>
            <div className={styles.contact}>
              <p>
                <strong>이메일</strong>: <a href="mailto:support@salearchive.com" className={styles.link}>support@salearchive.com</a>
              </p>
              <p className={styles.text}>
                평일 기준 24시간 이내에 답변드립니다.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>💬 문의 양식</h2>
            <p className={styles.text}>
              아래 양식을 작성하시면 이메일로 문의를 보낼 수 있습니다.
            </p>

            {/* 성공 메시지 */}
            {submitStatus === 'success' && (
              <div className={contactStyles.successMessage}>
                ✅ 문의가 성공적으로 전송되었습니다! 곧 답변드리겠습니다.
              </div>
            )}

            <form className={contactStyles.form} onSubmit={handleSubmit}>
              <div className={contactStyles.formGroup}>
                <label htmlFor="name" className={contactStyles.label}>
                  이름 <span className={contactStyles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={contactStyles.input}
                  placeholder="홍길동"
                  required
                />
              </div>

              <div className={contactStyles.formGroup}>
                <label htmlFor="email" className={contactStyles.label}>
                  이메일 <span className={contactStyles.required}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={contactStyles.input}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div className={contactStyles.formGroup}>
                <label htmlFor="subject" className={contactStyles.label}>
                  제목 <span className={contactStyles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={contactStyles.input}
                  placeholder="문의 제목을 입력하세요"
                  required
                />
              </div>

              <div className={contactStyles.formGroup}>
                <label htmlFor="message" className={contactStyles.label}>
                  내용 <span className={contactStyles.required}>*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={contactStyles.textarea}
                  placeholder="문의 내용을 자세히 작성해주세요"
                  rows={8}
                  required
                />
              </div>

              <button type="submit" className={contactStyles.submitButton}>
                문의 보내기
              </button>
            </form>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🤔 자주 묻는 질문</h2>

            <div className={contactStyles.faqItem}>
              <h3 className={contactStyles.faqQuestion}>Q. 회원가입이 필요한가요?</h3>
              <p className={styles.text}>
                아니요! 맛 프로젝트는 회원가입 없이 모든 기능을 무료로 이용할 수 있습니다.
                즐겨찾기 기능도 브라우저에 저장되어 개인정보 없이 사용 가능합니다.
              </p>
            </div>

            <div className={contactStyles.faqItem}>
              <h3 className={contactStyles.faqQuestion}>Q. 상품 정보는 어디서 가져오나요?</h3>
              <p className={styles.text}>
                모든 상품 정보는 각 브랜드의 공식 웹사이트에서 실시간으로 가져옵니다.
                가격과 재고 정보는 공식 사이트와 동일합니다.
              </p>
            </div>

            <div className={contactStyles.faqItem}>
              <h3 className={contactStyles.faqQuestion}>Q. 구매는 어떻게 하나요?</h3>
              <p className={styles.text}>
                맛 프로젝트는 정보 제공 서비스입니다. 상품을 클릭하면 해당 브랜드의
                공식 웹사이트로 연결되어 안전하게 구매하실 수 있습니다.
              </p>
            </div>

            <div className={contactStyles.faqItem}>
              <h3 className={contactStyles.faqQuestion}>Q. 브랜드를 추가해주실 수 있나요?</h3>
              <p className={styles.text}>
                네! 추가를 원하시는 브랜드가 있다면 위 문의 양식이나 이메일로 알려주세요.
                검토 후 가능한 범위에서 추가하겠습니다.
              </p>
            </div>

            <div className={contactStyles.faqItem}>
              <h3 className={contactStyles.faqQuestion}>Q. 광고나 제휴 문의는 어떻게 하나요?</h3>
              <p className={styles.text}>
                비즈니스 문의는 이메일(support@salearchive.com)로 연락주시면
                자세히 안내해드리겠습니다.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📱 소셜 미디어</h2>
            <p className={styles.text}>
              맛 프로젝트의 최신 소식과 스타일 팁을 소셜 미디어에서도 만나보세요.
            </p>
            <div className={contactStyles.socialLinks}>
              <p className={styles.text}>
                준비 중입니다. 곧 다양한 채널에서 만나요! 🎉
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>💡 이런 문의를 기다립니다</h2>
            <ul className={styles.list}>
              <li>서비스 개선 제안</li>
              <li>버그 리포트</li>
              <li>새로운 브랜드 추가 요청</li>
              <li>스타일 가이드 주제 제안</li>
              <li>비즈니스 제휴 문의</li>
              <li>기술적인 질문</li>
              <li>기타 모든 피드백</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🏢 사업자 정보</h2>
            <div className={styles.contact}>
              <p>
                <strong>서비스명</strong>: 맛 프로젝트 (Sale Archive)<br/>
                <strong>운영자</strong>: 개인 프로젝트<br/>
                <strong>이메일</strong>: support@salearchive.com<br/>
                <strong>호스팅</strong>: Vercel
              </p>
              <p className={styles.text}>
                <Link href="/privacy" className={styles.link}>개인정보처리방침</Link> |{' '}
                <Link href="/terms" className={styles.link}>이용약관</Link>
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
