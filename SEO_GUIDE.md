# SEO 최적화 가이드

이 프로젝트에 적용된 SEO 최적화 내역과 추가 작업 가이드입니다.

## ✅ 완료된 작업

### 1. Meta Tags 최적화 (`pages/_document.js`)
- **기본 메타 태그**: charset, viewport, description, keywords, author
- **Open Graph 태그**: SNS 공유 시 표시될 정보 (Facebook, LinkedIn 등)
- **Twitter Card 태그**: 트위터 공유 시 표시될 정보
- **검색엔진 크롤링 설정**: robots, googlebot 태그

### 2. robots.txt (`public/robots.txt`)
- 모든 검색엔진 크롤러 허용
- API 및 Next.js 내부 경로는 크롤링 제외
- Sitemap 위치 명시

### 3. sitemap.xml (`public/sitemap.xml`)
- 메인 페이지 URL 등록
- 업데이트 주기 및 우선순위 설정
- **중요**: 실제 배포 시 도메인 변경 필요

### 4. 구조화된 데이터 (JSON-LD) (`pages/index.js`)
- **WebSite 스키마**: 사이트 정보 및 검색 기능
- **ItemList 스키마**: 상품 목록 정보
- **Product 스키마**: 개별 상품 정보 (가격, 브랜드 포함)

### 5. 페이지별 메타 태그 개선
- 검색엔진 친화적인 title 태그
- 명확한 description
- 키워드 최적화

## 🚀 배포 전 필수 작업

### 1. 도메인 변경
다음 파일들에서 `https://yourdomain.com`을 실제 도메인으로 변경:
- `pages/_document.js` (line 69)
- `public/robots.txt` (line 10)
- `public/sitemap.xml` (line 11, 12)
- `pages/index.js` (line 627, 630)

### 2. Open Graph 이미지 추가
```javascript
// pages/_document.js에 추가
<meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

추천 사이즈: 1200x630px

### 3. favicon 최적화
다양한 디바이스를 위한 아이콘 추가:
```javascript
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

## 📊 검색엔진 등록

### Google Search Console
1. https://search.google.com/search-console 접속
2. 속성 추가로 도메인 등록
3. sitemap.xml 제출: `https://yourdomain.com/sitemap.xml`
4. URL 검사로 색인 생성 요청

### Naver Search Advisor
1. https://searchadvisor.naver.com 접속
2. 웹마스터 도구에서 사이트 등록
3. 사이트 소유 확인
4. 사이트맵 제출

## 🔍 추가 최적화 권장사항

### 1. 성능 최적화
- 이미지 lazy loading (Next.js Image 컴포넌트 사용 중 ✅)
- 코드 스플리팅 (Next.js 자동 처리 ✅)
- CDN 사용 (Vercel 배포 시 자동 ✅)

### 2. 콘텐츠 최적화
- 상품명에 브랜드명 포함
- 할인율 정보 명시
- 카테고리별 필터링 기능 제공 ✅

### 3. 기술적 SEO
- HTTPS 사용 (필수)
- 모바일 반응형 디자인 ✅
- 빠른 페이지 로딩 속도
- 구조화된 URL (Next.js 라우팅 ✅)

### 4. 소셜 미디어 최적화
- Facebook 픽셀 추가 (선택)
- Google Analytics 추가 (추천)
- 소셜 공유 버튼 추가 (선택)

## 📈 SEO 모니터링

### 주기적으로 확인할 사항
1. **Google Search Console**
   - 검색 노출 수 및 클릭 수
   - 크롤링 오류
   - 색인 생성 상태

2. **페이지 속도**
   - Google PageSpeed Insights
   - GTmetrix

3. **모바일 친화성**
   - Google Mobile-Friendly Test

## 🛠️ SEO 검증 도구

- [Google Rich Results Test](https://search.google.com/test/rich-results) - 구조화된 데이터 검증
- [Meta Tags Preview](https://metatags.io/) - SNS 공유 미리보기
- [Schema Markup Validator](https://validator.schema.org/) - JSON-LD 검증

## 📝 추가 개선 아이디어

1. **블로그 섹션 추가**: 패션 트렌드, 스타일링 팁 등
2. **상품 상세 페이지**: 각 상품별 전용 페이지 생성
3. **사용자 리뷰**: UGC(User Generated Content)로 SEO 강화
4. **브랜드별 페이지**: 브랜드별 전용 랜딩 페이지
5. **카테고리별 페이지**: TOP, BOTTOM 등 카테고리별 페이지

## 🔗 참고 자료

- [Next.js SEO 가이드](https://nextjs.org/learn/seo/introduction-to-seo)
- [Google SEO 초보자 가이드](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Schema.org 문서](https://schema.org/)
