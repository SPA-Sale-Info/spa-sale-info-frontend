# 👔 맛 프로젝트 - SPA 브랜드 가격 인하 정보

> 감성은 같지만 가격은 합리적인 옷을 찾아보세요

## 📋 프로젝트 소개

"맛 프로젝트"는 고가 브랜드의 감성을 닮은 합리적인 가격대의 SPA 브랜드 상품을 찾아주는 패션 큐레이션 서비스입니다.

### 주요 기능

- 🔍 **브랜드별 필터링**: H&M, ZARA, UNIQLO, MUJI 등 인기 SPA 브랜드별 상품 조회
- 💰 **가격 인하 정보**: 할인 중인 상품을 한눈에 확인
- 🎨 **감성 태그**: "AURALEE 맛", "THE ROW 맛" 등 고가 브랜드와 유사한 감성 표시
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기에서 최적화된 경험

## 🛠 기술 스택

- **프레임워크**: [Next.js](https://nextjs.org/) 14
- **언어**: JavaScript (ES6+)
- **스타일링**: CSS Modules
- **배포**: [Vercel](https://vercel.com/)

## 📁 프로젝트 구조

```
spa-sale-info-frontend/
├── pages/                    # 페이지 컴포넌트
│   ├── _app.js              # 전역 설정 (모든 페이지에 공통 적용)
│   ├── _document.js         # HTML 문서 구조 커스터마이징
│   └── index.js             # 홈페이지 (메인 페이지)
│
├── components/              # 재사용 가능한 컴포넌트
│   ├── BrandFilter.js       # 브랜드 필터 컴포넌트
│   └── ProductCard.js       # 상품 카드 컴포넌트
│
├── styles/                  # 스타일 파일
│   ├── globals.css          # 전역 스타일
│   ├── Home.module.css      # 홈페이지 스타일
│   ├── BrandFilter.module.css
│   └── ProductCard.module.css
│
├── utils/                   # 유틸리티 함수
│   └── api.js              # API 통신 함수 모음
│
├── public/                  # 정적 파일 (이미지, 파비콘 등)
│   └── favicon.ico
│
├── next.config.js          # Next.js 설정
├── package.json            # 프로젝트 의존성 관리
├── vercel.json            # Vercel 배포 설정
└── README.md              # 프로젝트 설명서
```

## 🚀 시작하기

### 1. 필수 요구사항

- [Node.js](https://nodejs.org/) 16.x 이상
- npm 또는 yarn 패키지 매니저

### 2. 설치

```bash
# 프로젝트 클론 (또는 다운로드)
cd spa-sale-info-frontend

# 의존성 패키지 설치
npm install
# 또는
yarn install
```

### 3. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env.local` 파일을 만들고 설정합니다:

```bash
cp .env.example .env.local
```

`.env.local` 파일 내용:
```
# API 엔드포인트 주소 (백엔드 서버 주소)
API_URL=http://localhost:8000

# 또는 실제 배포된 API 주소
# API_URL=https://your-api-server.com
```

### 4. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 5. 프로덕션 빌드

```bash
# 빌드
npm run build

# 빌드된 앱 실행
npm start
```

## 📦 배포하기 (Vercel)

### 방법 1: Vercel CLI 사용

```bash
# Vercel CLI 설치 (처음 한 번만)
npm install -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 방법 2: GitHub 연동

1. [Vercel](https://vercel.com/)에 가입/로그인
2. "New Project" 클릭
3. GitHub 저장소 연결
4. 프로젝트 선택 및 배포

**환경 변수 설정** (Vercel 대시보드):
- Settings → Environment Variables
- `API_URL` 추가 (백엔드 API 주소)

## 📚 학습 가이드

이 프로젝트는 학습 목적으로 상세한 주석이 포함되어 있습니다.

### JavaScript 주요 개념

각 파일에서 다루는 개념들:

#### pages/index.js
- ✅ `useState` 훅 - 상태 관리
- ✅ `useEffect` 훅 - 생명주기 & 부수효과
- ✅ `async/await` - 비동기 처리
- ✅ `try-catch` - 에러 처리
- ✅ `fetch API` - HTTP 요청
- ✅ `map()` - 배열 렌더링
- ✅ `filter()` - 배열 필터링
- ✅ 조건부 렌더링
- ✅ Props 전달

#### components/BrandFilter.js
- ✅ 컴포넌트 개념
- ✅ Props (속성)
- ✅ 이벤트 핸들러
- ✅ 상태 끌어올리기 (Lifting State Up)
- ✅ 배열 메서드 (`map`, `find`)
- ✅ 옵셔널 체이닝 (`?.`)

#### components/ProductCard.js
- ✅ Next.js Image 최적화
- ✅ 유틸리티 함수
- ✅ 객체 구조 분해
- ✅ 동적 스타일링

#### utils/api.js
- ✅ API 통신
- ✅ Promise
- ✅ 환경 변수
- ✅ URLSearchParams
- ✅ 에러 처리 패턴

### CSS 주요 개념

#### styles/globals.css
- ✅ CSS 리셋
- ✅ 전역 스타일
- ✅ CSS 변수
- ✅ 시스템 폰트 스택

#### CSS Modules (*.module.css)
- ✅ 스코프 분리
- ✅ Flexbox 레이아웃
- ✅ CSS Grid
- ✅ 미디어 쿼리 (반응형)
- ✅ 호버 효과
- ✅ 트랜지션 & 애니메이션
- ✅ 접근성 (a11y)

## 🎯 다음 단계

현재는 목업 데이터를 사용하고 있습니다. 실제 API를 연동하려면:

1. **pages/index.js**의 `fetchProducts()` 함수 주석 해제
2. **mockProducts** 부분 주석 처리
3. 백엔드 API 서버 실행
4. `.env.local`에서 `API_URL` 설정

### 추가 기능 아이디어

- [ ] 상품 검색 기능
- [ ] 정렬 옵션 (가격순, 할인율순)
- [ ] 찜하기 / 북마크 기능
- [ ] 페이지네이션
- [ ] 상품 상세 페이지
- [ ] 가격 알림 기능
- [ ] 다크 모드

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 💬 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 등록해주세요.

---

**만든 사람**: 맛 프로젝트 팀
**마지막 업데이트**: 2024년 11월
