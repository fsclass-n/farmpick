// Unsplash License 무료 이미지 (상업적 이용 가능, 출처 표기 권장) — public/images 에 최적화(WebP) 저장
const u = (id) => `https://unsplash.com/photos/${id}`;

export const PHOTOS = {
  heroLeaf: { src: '/images/hero-leaf.webp', alt: '구멍이 뚫린 잎 클로즈업', author: 'Daniel de Paola', link: u('yIQeKvmAbZI') },
  tomato: { src: '/images/login-tomato.webp', alt: '줄기에 달린 미숙 토마토', author: 'Sophie Dale', link: u('OD3U5vOD4Qs') },
  leafSpot: { src: '/images/leaf-spot.webp', alt: '반점 병징이 퍼진 잎맥', author: 'Wolfgang Hasselmann', link: u('mMUfGkRtW_Y') },
  strawberry: { src: '/images/strawberry.webp', alt: '잎 아래 익어가는 딸기', author: 'Jason Leung', link: u('DsWRZz6CcNI') },
  pepper: { src: '/images/pepper.webp', alt: '시든 잎이 섞인 고추 포기', author: 'T (tanyabarrow)', link: u('4xYX1le59S0') },
  farmerHand: { src: '/images/farmer-hand.webp', alt: '작물을 살피는 농부의 손', author: 'Jonathan Kemper', link: u('oHCalaoeD0Q') },
  fieldRows: { src: '/images/field-rows.webp', alt: '이랑이 이어진 초록 들판', author: 'Kasia Derenda', link: u('QljHJAPo5dQ') },
  greenhouse: { src: '/images/greenhouse.webp', alt: '유리 온실 내부', author: 'Peter Neumann', link: u('7rbO90c-0lY') },
};

export const PHOTO_CREDITS = Object.values(PHOTOS);
