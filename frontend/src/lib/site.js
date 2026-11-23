export const NAV = [
  { to: '/diagnosis', label: 'AI 진단', icon: 'fa-camera' },
  { to: '/pests', label: '병해충 도감', icon: 'fa-book-open' },
  { to: '/trends', label: '발생 동향', icon: 'fa-chart-line' },
  { to: '/myfarm', label: '마이팜', icon: 'fa-warehouse' },
  { to: '/chat', label: 'AI 상담', icon: 'fa-comments' },
];

export const ROLE_BADGE = {
  farmer: ['농가', 'bg-forest-100 text-forest-700'],
  company: ['기업', 'bg-ink-100 text-ink-700'],
  admin: ['관리자', 'bg-forest-600 text-white'],
  admin_readonly: ['읽기 전용', 'bg-harvest text-white'],
};

// 24절기 (양력 근사일)
const TERMS = [
  [1, 5, '소한', '小寒'], [1, 20, '대한', '大寒'], [2, 4, '입춘', '立春'], [2, 19, '우수', '雨水'],
  [3, 5, '경칩', '驚蟄'], [3, 20, '춘분', '春分'], [4, 4, '청명', '淸明'], [4, 20, '곡우', '穀雨'],
  [5, 5, '입하', '立夏'], [5, 21, '소만', '小滿'], [6, 5, '망종', '芒種'], [6, 21, '하지', '夏至'],
  [7, 7, '소서', '小暑'], [7, 22, '대서', '大暑'], [8, 7, '입추', '立秋'], [8, 23, '처서', '處暑'],
  [9, 7, '백로', '白露'], [9, 23, '추분', '秋分'], [10, 8, '한로', '寒露'], [10, 23, '상강', '霜降'],
  [11, 7, '입동', '立冬'], [11, 22, '소설', '小雪'], [12, 7, '대설', '大雪'], [12, 21, '동지', '冬至'],
];

export function solarTerm(d = new Date()) {
  const m = d.getMonth() + 1, day = d.getDate();
  const past = TERMS.filter(([tm, td]) => tm < m || (tm === m && td <= day));
  const [, , ko, hanja] = past.at(-1) || TERMS.at(-1);
  return `${ko}(${hanja})`;
}

// 국가 위기경보 4단계 체계에 맞춘 병해충 위험지수
export function riskLevel(score) {
  if (score >= 85) return { label: '심각', color: '#b83f27' };
  if (score >= 65) return { label: '경계', color: '#d9622b' };
  if (score >= 40) return { label: '주의', color: '#c97a12' };
  return { label: '관심', color: '#3b8634' };
}

export const FAMILY_SITES = [
  ['농촌진흥청', 'https://www.rda.go.kr'],
  ['국가농작물병해충관리시스템', 'https://ncpms.rda.go.kr'],
  ['AI Hub', 'https://www.aihub.or.kr'],
  ['기상청 날씨누리', 'https://www.weather.go.kr'],
  ['공공데이터포털', 'https://www.data.go.kr'],
];
