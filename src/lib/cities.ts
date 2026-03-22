import type { City } from './types';

/**
 * 84 geopolitically significant cities for FateMap simulation.
 * Each city references a country by ISO alpha-3 id and has a
 * functional type (financial, port, tech, political, energy,
 * manufacturing, logistics) and importance rank 1-5.
 */
export const CITIES: City[] = [
  // ── United States (USA) ────────────────────────────────────
  { id: 'new-york', name: 'New York', nameCn: '纽约', coordinates: [-74.01, 40.71], countryId: 'USA', type: 'financial', importance: 5 },
  { id: 'washington-dc', name: 'Washington D.C.', nameCn: '华盛顿', coordinates: [-77.04, 38.90], countryId: 'USA', type: 'political', importance: 5 },
  { id: 'san-francisco', name: 'San Francisco', nameCn: '旧金山', coordinates: [-122.42, 37.77], countryId: 'USA', type: 'tech', importance: 4 },
  { id: 'houston', name: 'Houston', nameCn: '休斯顿', coordinates: [-95.37, 29.76], countryId: 'USA', type: 'energy', importance: 4 },
  { id: 'los-angeles', name: 'Los Angeles', nameCn: '洛杉矶', coordinates: [-118.24, 34.05], countryId: 'USA', type: 'port', importance: 4 },

  // ── Canada (CAN) ───────────────────────────────────────────
  { id: 'toronto', name: 'Toronto', nameCn: '多伦多', coordinates: [-79.38, 43.65], countryId: 'CAN', type: 'financial', importance: 3 },
  { id: 'vancouver', name: 'Vancouver', nameCn: '温哥华', coordinates: [-123.12, 49.28], countryId: 'CAN', type: 'port', importance: 3 },

  // ── Mexico (MEX) ───────────────────────────────────────────
  { id: 'mexico-city', name: 'Mexico City', nameCn: '墨西哥城', coordinates: [-99.13, 19.43], countryId: 'MEX', type: 'political', importance: 3 },

  // ── Brazil (BRA) ───────────────────────────────────────────
  { id: 'sao-paulo', name: 'São Paulo', nameCn: '圣保罗', coordinates: [-46.63, -23.55], countryId: 'BRA', type: 'financial', importance: 4 },
  { id: 'rio-de-janeiro', name: 'Rio de Janeiro', nameCn: '里约热内卢', coordinates: [-43.17, -22.91], countryId: 'BRA', type: 'port', importance: 3 },

  // ── Argentina (ARG) ────────────────────────────────────────
  { id: 'buenos-aires', name: 'Buenos Aires', nameCn: '布宜诺斯艾利斯', coordinates: [-58.38, -34.60], countryId: 'ARG', type: 'financial', importance: 3 },

  // ── Chile (CHL) ────────────────────────────────────────────
  { id: 'santiago', name: 'Santiago', nameCn: '圣地亚哥', coordinates: [-70.65, -33.45], countryId: 'CHL', type: 'financial', importance: 2 },

  // ── Colombia (COL) ─────────────────────────────────────────
  { id: 'bogota', name: 'Bogotá', nameCn: '波哥大', coordinates: [-74.07, 4.71], countryId: 'COL', type: 'political', importance: 2 },

  // ── United Kingdom (GBR) ───────────────────────────────────
  { id: 'london', name: 'London', nameCn: '伦敦', coordinates: [-0.13, 51.51], countryId: 'GBR', type: 'financial', importance: 5 },

  // ── France (FRA) ───────────────────────────────────────────
  { id: 'paris', name: 'Paris', nameCn: '巴黎', coordinates: [2.35, 48.86], countryId: 'FRA', type: 'political', importance: 4 },
  { id: 'marseille', name: 'Marseille', nameCn: '马赛', coordinates: [5.37, 43.30], countryId: 'FRA', type: 'port', importance: 2 },

  // ── Germany (DEU) ──────────────────────────────────────────
  { id: 'frankfurt', name: 'Frankfurt', nameCn: '法兰克福', coordinates: [8.68, 50.11], countryId: 'DEU', type: 'financial', importance: 4 },
  { id: 'berlin', name: 'Berlin', nameCn: '柏林', coordinates: [13.40, 52.52], countryId: 'DEU', type: 'political', importance: 3 },
  { id: 'hamburg', name: 'Hamburg', nameCn: '汉堡', coordinates: [9.99, 53.55], countryId: 'DEU', type: 'port', importance: 3 },

  // ── Italy (ITA) ────────────────────────────────────────────
  { id: 'rome', name: 'Rome', nameCn: '罗马', coordinates: [12.50, 41.90], countryId: 'ITA', type: 'political', importance: 3 },
  { id: 'milan', name: 'Milan', nameCn: '米兰', coordinates: [9.19, 45.46], countryId: 'ITA', type: 'financial', importance: 3 },

  // ── Spain (ESP) ────────────────────────────────────────────
  { id: 'madrid', name: 'Madrid', nameCn: '马德里', coordinates: [-3.70, 40.42], countryId: 'ESP', type: 'political', importance: 3 },

  // ── Netherlands (NLD) ──────────────────────────────────────
  { id: 'rotterdam', name: 'Rotterdam', nameCn: '鹿特丹', coordinates: [4.48, 51.92], countryId: 'NLD', type: 'port', importance: 4 },
  { id: 'amsterdam', name: 'Amsterdam', nameCn: '阿姆斯特丹', coordinates: [4.90, 52.37], countryId: 'NLD', type: 'financial', importance: 3 },

  // ── Poland (POL) ───────────────────────────────────────────
  { id: 'warsaw', name: 'Warsaw', nameCn: '华沙', coordinates: [21.01, 52.23], countryId: 'POL', type: 'political', importance: 2 },

  // ── Ukraine (UKR) ──────────────────────────────────────────
  { id: 'kyiv', name: 'Kyiv', nameCn: '基辅', coordinates: [30.52, 50.45], countryId: 'UKR', type: 'political', importance: 3 },
  { id: 'odesa', name: 'Odesa', nameCn: '敖德萨', coordinates: [30.73, 46.48], countryId: 'UKR', type: 'port', importance: 3 },

  // ── Turkey (TUR) ───────────────────────────────────────────
  { id: 'istanbul', name: 'Istanbul', nameCn: '伊斯坦布尔', coordinates: [28.98, 41.01], countryId: 'TUR', type: 'logistics', importance: 4 },
  { id: 'ankara', name: 'Ankara', nameCn: '安卡拉', coordinates: [32.87, 39.93], countryId: 'TUR', type: 'political', importance: 3 },

  // ── Switzerland (CHE) ──────────────────────────────────────
  { id: 'zurich', name: 'Zurich', nameCn: '苏黎世', coordinates: [8.54, 47.38], countryId: 'CHE', type: 'financial', importance: 4 },

  // ── Greece (GRC) ───────────────────────────────────────────
  { id: 'athens', name: 'Athens', nameCn: '雅典', coordinates: [23.73, 37.98], countryId: 'GRC', type: 'port', importance: 2 },

  // ── China (CHN) ────────────────────────────────────────────
  { id: 'beijing', name: 'Beijing', nameCn: '北京', coordinates: [116.41, 39.90], countryId: 'CHN', type: 'political', importance: 5 },
  { id: 'shanghai', name: 'Shanghai', nameCn: '上海', coordinates: [121.47, 31.23], countryId: 'CHN', type: 'financial', importance: 5 },
  { id: 'shenzhen', name: 'Shenzhen', nameCn: '深圳', coordinates: [114.07, 22.54], countryId: 'CHN', type: 'tech', importance: 4 },
  { id: 'guangzhou', name: 'Guangzhou', nameCn: '广州', coordinates: [113.26, 23.13], countryId: 'CHN', type: 'manufacturing', importance: 4 },
  { id: 'hong-kong', name: 'Hong Kong', nameCn: '香港', coordinates: [114.17, 22.32], countryId: 'CHN', type: 'financial', importance: 5 },
  { id: 'chongqing', name: 'Chongqing', nameCn: '重庆', coordinates: [106.55, 29.56], countryId: 'CHN', type: 'manufacturing', importance: 3 },

  // ── Japan (JPN) ────────────────────────────────────────────
  { id: 'tokyo', name: 'Tokyo', nameCn: '东京', coordinates: [139.69, 35.69], countryId: 'JPN', type: 'financial', importance: 5 },
  { id: 'osaka', name: 'Osaka', nameCn: '大阪', coordinates: [135.50, 34.69], countryId: 'JPN', type: 'manufacturing', importance: 3 },
  { id: 'yokohama', name: 'Yokohama', nameCn: '横滨', coordinates: [139.64, 35.44], countryId: 'JPN', type: 'port', importance: 3 },

  // ── South Korea (KOR) ──────────────────────────────────────
  { id: 'seoul', name: 'Seoul', nameCn: '首尔', coordinates: [126.98, 37.57], countryId: 'KOR', type: 'tech', importance: 4 },
  { id: 'busan', name: 'Busan', nameCn: '釜山', coordinates: [129.08, 35.18], countryId: 'KOR', type: 'port', importance: 3 },

  // ── Taiwan, China (TWN) ────────────────────────────────────
  { id: 'taipei', name: 'Taipei', nameCn: '台北', coordinates: [121.57, 25.03], countryId: 'TWN', type: 'tech', importance: 4 },
  { id: 'kaohsiung', name: 'Kaohsiung', nameCn: '高雄', coordinates: [120.31, 22.62], countryId: 'TWN', type: 'port', importance: 3 },

  // ── Singapore (SGP) ────────────────────────────────────────
  { id: 'singapore', name: 'Singapore', nameCn: '新加坡', coordinates: [103.82, 1.35], countryId: 'SGP', type: 'financial', importance: 5 },

  // ── Vietnam (VNM) ──────────────────────────────────────────
  { id: 'ho-chi-minh', name: 'Ho Chi Minh City', nameCn: '胡志明市', coordinates: [106.63, 10.82], countryId: 'VNM', type: 'manufacturing', importance: 3 },

  // ── Thailand (THA) ─────────────────────────────────────────
  { id: 'bangkok', name: 'Bangkok', nameCn: '曼谷', coordinates: [100.50, 13.76], countryId: 'THA', type: 'logistics', importance: 3 },

  // ── Indonesia (IDN) ────────────────────────────────────────
  { id: 'jakarta', name: 'Jakarta', nameCn: '雅加达', coordinates: [106.85, -6.21], countryId: 'IDN', type: 'political', importance: 3 },

  // ── Philippines (PHL) ──────────────────────────────────────
  { id: 'manila', name: 'Manila', nameCn: '马尼拉', coordinates: [120.98, 14.60], countryId: 'PHL', type: 'port', importance: 3 },

  // ── Malaysia (MYS) ─────────────────────────────────────────
  { id: 'kuala-lumpur', name: 'Kuala Lumpur', nameCn: '吉隆坡', coordinates: [101.69, 3.14], countryId: 'MYS', type: 'financial', importance: 3 },

  // ── India (IND) ────────────────────────────────────────────
  { id: 'mumbai', name: 'Mumbai', nameCn: '孟买', coordinates: [72.88, 19.08], countryId: 'IND', type: 'financial', importance: 4 },
  { id: 'new-delhi', name: 'New Delhi', nameCn: '新德里', coordinates: [77.21, 28.61], countryId: 'IND', type: 'political', importance: 4 },
  { id: 'bangalore', name: 'Bangalore', nameCn: '班加罗尔', coordinates: [77.59, 12.97], countryId: 'IND', type: 'tech', importance: 3 },
  { id: 'chennai', name: 'Chennai', nameCn: '金奈', coordinates: [80.27, 13.08], countryId: 'IND', type: 'manufacturing', importance: 3 },

  // ── Pakistan (PAK) ─────────────────────────────────────────
  { id: 'karachi', name: 'Karachi', nameCn: '卡拉奇', coordinates: [67.01, 24.86], countryId: 'PAK', type: 'port', importance: 3 },
  { id: 'islamabad', name: 'Islamabad', nameCn: '伊斯兰堡', coordinates: [73.05, 33.69], countryId: 'PAK', type: 'political', importance: 2 },

  // ── Bangladesh (BGD) ───────────────────────────────────────
  { id: 'dhaka', name: 'Dhaka', nameCn: '达卡', coordinates: [90.41, 23.81], countryId: 'BGD', type: 'manufacturing', importance: 3 },

  // ── Russia (RUS) ───────────────────────────────────────────
  { id: 'moscow', name: 'Moscow', nameCn: '莫斯科', coordinates: [37.62, 55.76], countryId: 'RUS', type: 'political', importance: 5 },
  { id: 'saint-petersburg', name: 'Saint Petersburg', nameCn: '圣彼得堡', coordinates: [30.32, 59.93], countryId: 'RUS', type: 'port', importance: 3 },
  { id: 'vladivostok', name: 'Vladivostok', nameCn: '海参崴', coordinates: [131.89, 43.12], countryId: 'RUS', type: 'port', importance: 2 },

  // ── Kazakhstan (KAZ) ───────────────────────────────────────
  { id: 'astana', name: 'Astana', nameCn: '阿斯塔纳', coordinates: [71.47, 51.17], countryId: 'KAZ', type: 'energy', importance: 2 },

  // ── Saudi Arabia (SAU) ─────────────────────────────────────
  { id: 'riyadh', name: 'Riyadh', nameCn: '利雅得', coordinates: [46.68, 24.71], countryId: 'SAU', type: 'political', importance: 4 },
  { id: 'jeddah', name: 'Jeddah', nameCn: '吉达', coordinates: [39.17, 21.49], countryId: 'SAU', type: 'port', importance: 3 },

  // ── Iran (IRN) ─────────────────────────────────────────────
  { id: 'tehran', name: 'Tehran', nameCn: '德黑兰', coordinates: [51.39, 35.69], countryId: 'IRN', type: 'political', importance: 4 },
  { id: 'bandar-abbas', name: 'Bandar Abbas', nameCn: '阿巴斯港', coordinates: [56.27, 27.18], countryId: 'IRN', type: 'port', importance: 3 },

  // ── Iraq (IRQ) ─────────────────────────────────────────────
  { id: 'baghdad', name: 'Baghdad', nameCn: '巴格达', coordinates: [44.37, 33.31], countryId: 'IRQ', type: 'political', importance: 3 },
  { id: 'basra', name: 'Basra', nameCn: '巴士拉', coordinates: [47.78, 30.51], countryId: 'IRQ', type: 'energy', importance: 3 },

  // ── Israel (ISR) ───────────────────────────────────────────
  { id: 'tel-aviv', name: 'Tel Aviv', nameCn: '特拉维夫', coordinates: [34.78, 32.08], countryId: 'ISR', type: 'tech', importance: 4 },
  { id: 'jerusalem', name: 'Jerusalem', nameCn: '耶路撒冷', coordinates: [35.22, 31.77], countryId: 'ISR', type: 'political', importance: 4 },

  // ── UAE (ARE) ──────────────────────────────────────────────
  { id: 'dubai', name: 'Dubai', nameCn: '迪拜', coordinates: [55.27, 25.20], countryId: 'ARE', type: 'logistics', importance: 5 },
  { id: 'abu-dhabi', name: 'Abu Dhabi', nameCn: '阿布扎比', coordinates: [54.37, 24.45], countryId: 'ARE', type: 'energy', importance: 4 },

  // ── Egypt (EGY) ────────────────────────────────────────────
  { id: 'cairo', name: 'Cairo', nameCn: '开罗', coordinates: [31.24, 30.04], countryId: 'EGY', type: 'political', importance: 3 },
  { id: 'suez', name: 'Suez', nameCn: '苏伊士', coordinates: [32.55, 29.97], countryId: 'EGY', type: 'logistics', importance: 4 },

  // ── Nigeria (NGA) ──────────────────────────────────────────
  { id: 'lagos', name: 'Lagos', nameCn: '拉各斯', coordinates: [3.39, 6.45], countryId: 'NGA', type: 'financial', importance: 3 },
  { id: 'abuja', name: 'Abuja', nameCn: '阿布贾', coordinates: [7.49, 9.06], countryId: 'NGA', type: 'political', importance: 2 },

  // ── South Africa (ZAF) ─────────────────────────────────────
  { id: 'johannesburg', name: 'Johannesburg', nameCn: '约翰内斯堡', coordinates: [28.05, -26.20], countryId: 'ZAF', type: 'financial', importance: 3 },
  { id: 'cape-town', name: 'Cape Town', nameCn: '开普敦', coordinates: [18.42, -33.93], countryId: 'ZAF', type: 'port', importance: 2 },

  // ── Ethiopia (ETH) ─────────────────────────────────────────
  { id: 'addis-ababa', name: 'Addis Ababa', nameCn: '亚的斯亚贝巴', coordinates: [38.75, 9.02], countryId: 'ETH', type: 'political', importance: 2 },

  // ── Australia (AUS) ────────────────────────────────────────
  { id: 'sydney', name: 'Sydney', nameCn: '悉尼', coordinates: [151.21, -33.87], countryId: 'AUS', type: 'financial', importance: 4 },
  { id: 'melbourne', name: 'Melbourne', nameCn: '墨尔本', coordinates: [144.96, -37.81], countryId: 'AUS', type: 'port', importance: 3 },

  // ── New Zealand (NZL) ──────────────────────────────────────
  { id: 'auckland', name: 'Auckland', nameCn: '奥克兰', coordinates: [174.76, -36.85], countryId: 'NZL', type: 'port', importance: 2 },

  // ── North Korea (PRK) ──────────────────────────────────────
  { id: 'pyongyang', name: 'Pyongyang', nameCn: '平壤', coordinates: [125.75, 39.02], countryId: 'PRK', type: 'political', importance: 3 },

  // ── Sweden (SWE) ───────────────────────────────────────────
  { id: 'stockholm', name: 'Stockholm', nameCn: '斯德哥尔摩', coordinates: [18.07, 59.33], countryId: 'SWE', type: 'tech', importance: 3 },

  // ── Norway (NOR) ───────────────────────────────────────────
  { id: 'oslo', name: 'Oslo', nameCn: '奥斯陆', coordinates: [10.75, 59.91], countryId: 'NOR', type: 'energy', importance: 3 },
];
