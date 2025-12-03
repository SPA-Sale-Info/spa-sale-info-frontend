/**
 * style-guide.js - 스타일 가이드 페이지
 *
 * 구글 애드센스 승인을 위한 고유 콘텐츠 제공 페이지
 * 100개의 스타일 팁과 코디 제안을 체계적으로 제공합니다.
 */

import { useState, useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/StyleGuide.module.css'

/**
 * 100가지 스타일 가이드 데이터
 * 다양한 패션 스타일과 코디 팁을 제공합니다.
 */
const STYLE_GUIDES = [
  { id: 1, theme: '레이어드로 완성하는 가을 무드', tip: '긴 셔츠 위에 짧은 니트를 매치하세요', category: 'seasonal', difficulty: 'medium' },
  { id: 2, theme: '미니멀한 하루를 위한 베이직', tip: '화이트 티 · 데님 · 로퍼 조합', category: 'minimal', difficulty: 'easy' },
  { id: 3, theme: '캐주얼한 주말 스타일링', tip: '오버핏 후디와 슬랙스의 편안한 균형', category: 'casual', difficulty: 'easy' },
  { id: 4, theme: '오피스룩에 개성 더하기', tip: '정장 바지에 스니커즈를 매치해보세요', category: 'office', difficulty: 'easy' },
  { id: 5, theme: '톤온톤으로 세련되게', tip: '같은 계열 색상을 여러 레이어로 쌓기', category: 'advanced', difficulty: 'medium' },
  { id: 6, theme: '빈티지 무드 연출법', tip: '워싱 진 · 오버핏 셔츠 · 레더 슈즈', category: 'vintage', difficulty: 'medium' },
  { id: 7, theme: '모노크롬 스타일의 힘', tip: '흑백만으로도 충분히 멋진 룩 완성', category: 'minimal', difficulty: 'easy' },
  { id: 8, theme: '스트리트 감성 살리기', tip: '와이드 카고팬츠에 크롭 후디를 매치', category: 'street', difficulty: 'medium' },
  { id: 9, theme: '심플한 데이트 룩', tip: '슬림 진 · 니트 · 클린한 스니커즈', category: 'date', difficulty: 'easy' },
  { id: 10, theme: '비오는 날 스타일링', tip: '트렌치코트에 첼시부츠로 멋스럽게', category: 'seasonal', difficulty: 'easy' },
  { id: 11, theme: '출근길 세미캐주얼', tip: '블레이저 · 티셔츠 · 치노팬츠 조합', category: 'office', difficulty: 'easy' },
  { id: 12, theme: '주말 브런치 룩', tip: '린넨 셔츠에 반바지, 에스파드류를 더해', category: 'casual', difficulty: 'easy' },
  { id: 13, theme: '캠퍼스 스타일 연출', tip: '맨투맨 · 와이드 진 · 캔버스 백팩', category: 'casual', difficulty: 'easy' },
  { id: 14, theme: '저녁 약속 룩', tip: '블랙 터틀넥 · 슬랙스 · 로퍼로 세련되게', category: 'date', difficulty: 'easy' },
  { id: 15, theme: '올 블랙 스타일링', tip: '다양한 소재 믹스로 단조로움 탈출', category: 'minimal', difficulty: 'medium' },
  { id: 16, theme: '프렌치 시크 따라하기', tip: '스트라이프 티 · 베이지 팬츠 · 로퍼', category: 'international', difficulty: 'easy' },
  { id: 17, theme: '노멀코어의 정석', tip: '심플한 아이템만으로 완성하는 스타일', category: 'minimal', difficulty: 'easy' },
  { id: 18, theme: '레트로 감성 코디', tip: '플레어 팬츠 · 크롭 니트 · 플랫폼 슈즈', category: 'vintage', difficulty: 'hard' },
  { id: 19, theme: '스포티 캐주얼', tip: '트랙 재킷에 조거팬츠, 러닝화 매치', category: 'sporty', difficulty: 'easy' },
  { id: 20, theme: '비즈니스 캐주얼 완성', tip: '니트 카디건 · 셔츠 · 치노팬츠', category: 'office', difficulty: 'easy' },
  { id: 21, theme: '아메카지 스타일', tip: '체크 셔츠 · 데님 · 워크부츠 조합', category: 'vintage', difficulty: 'medium' },
  { id: 22, theme: '올화이트 룩', tip: '다양한 화이트 톤으로 깊이감 연출', category: 'advanced', difficulty: 'hard' },
  { id: 23, theme: '컬러 포인트 활용법', tip: '베이직한 룩에 밝은 색 아이템 하나만', category: 'casual', difficulty: 'easy' },
  { id: 24, theme: '레이어링의 기본', tip: '긴팔 티 위에 반팔 티를 겹쳐 입기', category: 'advanced', difficulty: 'medium' },
  { id: 25, theme: '패턴 믹스 매치', tip: '스트라이프와 체크를 조화롭게', category: 'advanced', difficulty: 'hard' },
  { id: 26, theme: '데님 온 데님', tip: '다른 워싱의 데님을 매치해 자연스럽게', category: 'casual', difficulty: 'medium' },
  { id: 27, theme: '오버사이즈 핏 활용', tip: '큰 상의에는 슬림한 하의로 밸런스', category: 'street', difficulty: 'easy' },
  { id: 28, theme: '액세서리로 포인트', tip: '심플한 코디에 시계 하나만으로 완성', category: 'minimal', difficulty: 'easy' },
  { id: 29, theme: '계절 전환기 룩', tip: '가벼운 아우터를 허리에 둘러 연출', category: 'seasonal', difficulty: 'easy' },
  { id: 30, theme: '컬러 블로킹 시도', tip: '대비되는 두 가지 색상으로 강렬하게', category: 'advanced', difficulty: 'hard' },
  { id: 31, theme: '시티보이 감성', tip: '코치 재킷 · 슬랙스 · 클래식 스니커즈', category: 'street', difficulty: 'easy' },
  { id: 32, theme: '이지 웨어 스타일', tip: '편한 옷도 핏과 소재로 고급스럽게', category: 'minimal', difficulty: 'medium' },
  { id: 33, theme: '어센틱 룩 완성', tip: '빈티지 가죽 재킷 · 워싱 진 · 부츠', category: 'vintage', difficulty: 'medium' },
  { id: 34, theme: '클린 미니멀', tip: '장식 없는 깔끔한 라인만으로 승부', category: 'minimal', difficulty: 'easy' },
  { id: 35, theme: '스마트 캐주얼', tip: '니트 · 셔츠 · 슬랙스로 품격있게', category: 'office', difficulty: 'easy' },
  { id: 36, theme: '힙한 거리 패션', tip: '그래픽 티 · 카고팬츠 · 하이탑 스니커즈', category: 'street', difficulty: 'easy' },
  { id: 37, theme: '젠더리스 스타일', tip: '성별 구분 없는 유니섹스 아이템 활용', category: 'advanced', difficulty: 'medium' },
  { id: 38, theme: '모던 클래식', tip: '전통적인 아이템을 현대적으로 해석', category: 'office', difficulty: 'medium' },
  { id: 39, theme: '테일러드 룩', tip: '잘 맞는 재킷과 팬츠로 완벽한 실루엣', category: 'office', difficulty: 'hard' },
  { id: 40, theme: '아웃도어 무드', tip: '플리스 · 하이킹 팬츠 · 트레일 슈즈', category: 'outdoor', difficulty: 'easy' },
  { id: 41, theme: '네오 프레피', tip: '폴로 셔츠 · 치노 쇼츠 · 보트슈즈', category: 'casual', difficulty: 'easy' },
  { id: 42, theme: '얼리지 룩', tip: '스타디움 점퍼 · 스웨트팬츠 · 스니커즈', category: 'sporty', difficulty: 'easy' },
  { id: 43, theme: '아티스트 감성', tip: '오버핏 셔츠 · 와이드 팬츠 · 슬립온', category: 'casual', difficulty: 'medium' },
  { id: 44, theme: '리조트 웨어', tip: '린넨 셔츠 · 쇼츠 · 샌들로 여유롭게', category: 'seasonal', difficulty: 'easy' },
  { id: 45, theme: '어반 테크', tip: '기능성 재킷 · 테이퍼드 팬츠 · 러닝화', category: 'sporty', difficulty: 'medium' },
  { id: 46, theme: '핸섬 무드', tip: '셔츠 · 베스트 · 슬랙스로 단정하게', category: 'office', difficulty: 'medium' },
  { id: 47, theme: '소프트 그런지', tip: '오버사이즈 니트 · 스키니 진 · 첼시부츠', category: 'vintage', difficulty: 'medium' },
  { id: 48, theme: '뉴트로 감성', tip: '90년대 스타일을 현대적으로 재해석', category: 'vintage', difficulty: 'medium' },
  { id: 49, theme: '에슬레저 룩', tip: '스포츠웨어를 일상에 자연스럽게', category: 'sporty', difficulty: 'easy' },
  { id: 50, theme: '스칸디나비안 스타일', tip: '미니멀하고 기능적인 북유럽 감성', category: 'international', difficulty: 'easy' },
  { id: 51, theme: '브리티시 클래식', tip: '트렌치 · 울팬츠 · 옥스포드 슈즈', category: 'international', difficulty: 'medium' },
  { id: 52, theme: '이탈리안 스프레차투라', tip: '무심한 듯 세련된 이탈리아 스타일', category: 'international', difficulty: 'hard' },
  { id: 53, theme: '재팬 캐주얼', tip: '심플하고 고품질의 일본 감성', category: 'international', difficulty: 'easy' },
  { id: 54, theme: 'LA 캐주얼', tip: '편안하고 여유로운 서부 해안 스타일', category: 'international', difficulty: 'easy' },
  { id: 55, theme: '뉴요커 스타일', tip: '올블랙 · 레이어드 · 미니멀', category: 'international', difficulty: 'medium' },
  { id: 56, theme: '파리지앵 시크', tip: '자연스러운 멋과 고급스러움의 조화', category: 'international', difficulty: 'hard' },
  { id: 57, theme: '밀리터리 믹스', tip: 'MA-1 · 카고팬츠 · 컴뱃부츠', category: 'street', difficulty: 'easy' },
  { id: 58, theme: '워크웨어 트렌드', tip: '작업복에서 영감받은 실용적 스타일', category: 'vintage', difficulty: 'medium' },
  { id: 59, theme: '테크웨어 입문', tip: '기능성과 미래지향적 디자인의 만남', category: 'advanced', difficulty: 'hard' },
  { id: 60, theme: '노르딕 미니멀', tip: '단순함 속의 따뜻함과 아늑함', category: 'minimal', difficulty: 'easy' },
  { id: 61, theme: '모드 스트리트', tip: '하이패션을 스트리트에 녹여내기', category: 'advanced', difficulty: 'hard' },
  { id: 62, theme: '캠핑 코어', tip: '아웃도어 무드를 도시에서 즐기기', category: 'outdoor', difficulty: 'easy' },
  { id: 63, theme: '고프코어 스타일', tip: '기능성 아웃도어를 일상복으로', category: 'outdoor', difficulty: 'easy' },
  { id: 64, theme: '블루칼라 시크', tip: '작업복의 실용성을 패셔너블하게', category: 'vintage', difficulty: 'medium' },
  { id: 65, theme: '아이비 룩', tip: '대학 캠퍼스 느낌의 프레피 스타일', category: 'casual', difficulty: 'easy' },
  { id: 66, theme: '소호 아티스트', tip: '창의적이고 자유로운 예술가 룩', category: 'casual', difficulty: 'medium' },
  { id: 67, theme: '코지 웨어', tip: '포근하고 편안한 집콕 스타일', category: 'casual', difficulty: 'easy' },
  { id: 68, theme: '울트라 미니멀', tip: '극도로 절제된 색상과 형태', category: 'minimal', difficulty: 'hard' },
  { id: 69, theme: '네오 클래식', tip: '클래식을 젊고 신선하게', category: 'office', difficulty: 'medium' },
  { id: 70, theme: '컨템포러리 룩', tip: '현대적이고 진보적인 스타일링', category: 'advanced', difficulty: 'hard' },
  { id: 71, theme: '보헤미안 시크', tip: '자유로운 영혼의 예술적 표현', category: 'casual', difficulty: 'medium' },
  { id: 72, theme: '오렌지 무드', tip: '따뜻한 오렌지 톤으로 활기차게', category: 'advanced', difficulty: 'medium' },
  { id: 73, theme: '올 네이비 룩', tip: '네이비 계열로 통일감 있게', category: 'minimal', difficulty: 'easy' },
  { id: 74, theme: '베이지 워싱', tip: '베이지 · 크림 · 카키의 편안한 조화', category: 'minimal', difficulty: 'easy' },
  { id: 75, theme: '시크릿 럭셔리', tip: '겉으로 드러나지 않는 고급스러움', category: 'advanced', difficulty: 'hard' },
  { id: 76, theme: '라이트 레이어드', tip: '얇은 레이어를 여러 겹 쌓기', category: 'advanced', difficulty: 'medium' },
  { id: 77, theme: '매치 세트 활용', tip: '상하의 세트로 손쉽게 멋내기', category: 'casual', difficulty: 'easy' },
  { id: 78, theme: '믹스 앤 매치', tip: '서로 다른 스타일을 과감하게 조합', category: 'advanced', difficulty: 'hard' },
  { id: 79, theme: '베스트 활용법', tip: '베스트 하나로 정돈된 느낌', category: 'office', difficulty: 'easy' },
  { id: 80, theme: '니트 온 니트', tip: '니트를 레이어드로 포근하게', category: 'seasonal', difficulty: 'medium' },
  { id: 81, theme: '데일리 슬리퍼', tip: '슬리퍼를 외출복에 매치', category: 'casual', difficulty: 'easy' },
  { id: 82, theme: '슬림 실루엣', tip: '전체적으로 슬림한 라인 강조', category: 'minimal', difficulty: 'easy' },
  { id: 83, theme: '와이드 실루엣', tip: '여유로운 와이드 핏의 편안함', category: 'street', difficulty: 'easy' },
  { id: 84, theme: 'Y 실루엣', tip: '상체는 크게, 하체는 슬림하게', category: 'advanced', difficulty: 'medium' },
  { id: 85, theme: 'A 실루엣', tip: '상체는 슬림, 하체는 볼륨있게', category: 'advanced', difficulty: 'medium' },
  { id: 86, theme: 'I 실루엣', tip: '수직 라인을 강조한 일자 핏', category: 'minimal', difficulty: 'easy' },
  { id: 87, theme: '셔츠 아웃 스타일', tip: '셔츠를 바지 밖으로 여유롭게', category: 'casual', difficulty: 'easy' },
  { id: 88, theme: '터크인 기법', tip: '앞만 살짝 넣어 다리 길어 보이기', category: 'casual', difficulty: 'easy' },
  { id: 89, theme: '하프 터크인', tip: '한쪽만 넣어 자연스럽게', category: 'casual', difficulty: 'easy' },
  { id: 90, theme: '소매 걷기 테크닉', tip: '소매를 걷어 캐주얼하게', category: 'casual', difficulty: 'easy' },
  { id: 91, theme: '목도리 활용법', tip: '목도리 하나로 포인트 주기', category: 'seasonal', difficulty: 'easy' },
  { id: 92, theme: '모자 스타일링', tip: '베레모, 버킷햇, 캡 등 활용', category: 'casual', difficulty: 'easy' },
  { id: 93, theme: '백팩 vs 토트백', tip: '상황에 맞는 가방 선택', category: 'casual', difficulty: 'easy' },
  { id: 94, theme: '시계 매치 법칙', tip: '옷 분위기에 맞는 시계 선택', category: 'advanced', difficulty: 'medium' },
  { id: 95, theme: '선글라스 활용', tip: '얼굴형에 맞는 선글라스 스타일', category: 'casual', difficulty: 'easy' },
  { id: 96, theme: '양말 스타일링', tip: '양말로 포인트 주기', category: 'casual', difficulty: 'easy' },
  { id: 97, theme: '벨트 디테일', tip: '벨트 하나로 달라지는 실루엣', category: 'casual', difficulty: 'easy' },
  { id: 98, theme: '스카프 활용', tip: '스카프로 세련미 더하기', category: 'advanced', difficulty: 'medium' },
  { id: 99, theme: '귀걸이 포인트', tip: '유니섹스 귀걸이로 개성 표현', category: 'advanced', difficulty: 'medium' },
  { id: 100, theme: '반지 레이어링', tip: '여러 개의 반지로 멋 더하기', category: 'advanced', difficulty: 'medium' },
]

/**
 * 카테고리 정보
 */
const CATEGORIES = {
  all: { label: '전체', emoji: '🎨' },
  minimal: { label: '미니멀', emoji: '⚪' },
  casual: { label: '캐주얼', emoji: '👕' },
  office: { label: '오피스', emoji: '💼' },
  street: { label: '스트리트', emoji: '🛹' },
  vintage: { label: '빈티지', emoji: '📻' },
  sporty: { label: '스포티', emoji: '⚽' },
  international: { label: '월드와이드', emoji: '🌍' },
  outdoor: { label: '아웃도어', emoji: '🏕️' },
  seasonal: { label: '시즌별', emoji: '🍂' },
  date: { label: '데이트', emoji: '💕' },
  advanced: { label: '고급 기법', emoji: '🎯' },
}

/**
 * 난이도 정보
 */
const DIFFICULTY_INFO = {
  all: { label: '전체', color: '#94a3b8' },
  easy: { label: '쉬움', color: '#10b981' },
  medium: { label: '보통', color: '#f59e0b' },
  hard: { label: '어려움', color: '#ef4444' },
}

export default function StyleGuide() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  /**
   * 필터링된 스타일 가이드
   */
  const filteredGuides = useMemo(() => {
    return STYLE_GUIDES.filter(guide => {
      const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === 'all' || guide.difficulty === selectedDifficulty
      const matchesSearch = searchQuery === '' ||
        guide.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.tip.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesCategory && matchesDifficulty && matchesSearch
    })
  }, [selectedCategory, selectedDifficulty, searchQuery])

  return (
    <div className={styles.container}>
      <Head>
        <title>스타일 가이드 - 100가지 코디 팁 | Sale Archive</title>
        <meta name="description" content="맛 프로젝트의 스타일 가이드. 미니멀, 캐주얼, 스트리트, 오피스 등 다양한 스타일의 100가지 코디 팁과 패션 노하우를 제공합니다." />
        <meta name="keywords" content="스타일 가이드, 코디 팁, 패션, 미니멀, 캐주얼, 스트리트 패션, 오피스룩, 빈티지 스타일" />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className={styles.content}>
        {/* 헤더 */}
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>
            ← 홈으로 돌아가기
          </Link>
          <h1 className={styles.title}>스타일 가이드</h1>
          <p className={styles.subtitle}>
            100가지 스타일 팁으로 나만의 패션을 완성하세요
          </p>
        </header>

        {/* 소개 섹션 */}
        <section className={styles.intro}>
          <p className={styles.introText}>
            맛 프로젝트가 제공하는 스타일 가이드는 다양한 패션 스타일과 코디 노하우를 담고 있습니다.
            미니멀부터 스트리트까지, 초보자도 쉽게 따라할 수 있는 팁부터 고급 기법까지
            모든 것을 한 곳에서 만나보세요.
          </p>
        </section>

        {/* 검색 바 */}
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="스타일 검색... (예: 미니멀, 데이트, 레이어드)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* 필터 섹션 */}
        <div className={styles.filters}>
          {/* 카테고리 필터 */}
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>카테고리</h3>
            <div className={styles.filterButtons}>
              {Object.entries(CATEGORIES).map(([key, { label, emoji }]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`${styles.filterButton} ${selectedCategory === key ? styles.active : ''}`}
                >
                  <span className={styles.emoji}>{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 난이도 필터 */}
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>난이도</h3>
            <div className={styles.filterButtons}>
              {Object.entries(DIFFICULTY_INFO).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDifficulty(key)}
                  className={`${styles.filterButton} ${selectedDifficulty === key ? styles.active : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 결과 카운트 */}
        <div className={styles.resultCount}>
          {filteredGuides.length}개의 스타일 가이드
        </div>

        {/* 스타일 가이드 그리드 */}
        <div className={styles.grid}>
          {filteredGuides.map(guide => (
            <div key={guide.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardNumber}>#{guide.id}</span>
                <span
                  className={styles.difficultyBadge}
                  style={{ backgroundColor: DIFFICULTY_INFO[guide.difficulty].color }}
                >
                  {DIFFICULTY_INFO[guide.difficulty].label}
                </span>
              </div>
              <h3 className={styles.cardTheme}>{guide.theme}</h3>
              <p className={styles.cardTip}>{guide.tip}</p>
              <div className={styles.cardFooter}>
                <span className={styles.categoryTag}>
                  {CATEGORIES[guide.category].emoji} {CATEGORIES[guide.category].label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 결과 없음 */}
        {filteredGuides.length === 0 && (
          <div className={styles.noResults}>
            <p>검색 결과가 없습니다.</p>
            <p>다른 키워드로 검색해보세요.</p>
          </div>
        )}

        {/* 하단 CTA */}
        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>마음에 드는 스타일을 찾으셨나요?</h2>
          <p className={styles.ctaText}>
            맛 프로젝트에서 합리적인 가격의 상품을 찾아보세요.
          </p>
          <Link href="/" className={styles.ctaButton}>
            세일 상품 보러가기
          </Link>
        </section>
      </div>
    </div>
  )
}
