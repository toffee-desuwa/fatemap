import type { Country } from './types';

/**
 * 48 geopolitically significant countries for FateMap simulation.
 * Each entry: ISO 3166-1 alpha-3 id, English/Chinese names,
 * geographic center [lng, lat], capital [lng, lat], and region.
 */
export const COUNTRIES: Country[] = [
  // ── North America ──────────────────────────────────────────
  { id: 'USA', name: 'United States', nameCn: '美国', center: [-98.58, 39.83], capital: [-77.04, 38.90], region: 'North America' },
  { id: 'CAN', name: 'Canada', nameCn: '加拿大', center: [-106.35, 56.13], capital: [-75.70, 45.42], region: 'North America' },
  { id: 'MEX', name: 'Mexico', nameCn: '墨西哥', center: [-102.55, 23.63], capital: [-99.13, 19.43], region: 'North America' },

  // ── South America ──────────────────────────────────────────
  { id: 'BRA', name: 'Brazil', nameCn: '巴西', center: [-51.93, -14.24], capital: [-47.88, -15.79], region: 'South America' },
  { id: 'ARG', name: 'Argentina', nameCn: '阿根廷', center: [-63.62, -38.42], capital: [-58.38, -34.60], region: 'South America' },
  { id: 'CHL', name: 'Chile', nameCn: '智利', center: [-71.54, -35.68], capital: [-70.65, -33.45], region: 'South America' },
  { id: 'COL', name: 'Colombia', nameCn: '哥伦比亚', center: [-74.30, 4.57], capital: [-74.07, 4.71], region: 'South America' },
  { id: 'VEN', name: 'Venezuela', nameCn: '委内瑞拉', center: [-66.59, 6.42], capital: [-66.90, 10.49], region: 'South America' },

  // ── Europe ─────────────────────────────────────────────────
  { id: 'GBR', name: 'United Kingdom', nameCn: '英国', center: [-3.44, 55.38], capital: [-0.13, 51.51], region: 'Europe' },
  { id: 'FRA', name: 'France', nameCn: '法国', center: [2.21, 46.23], capital: [2.35, 48.86], region: 'Europe' },
  { id: 'DEU', name: 'Germany', nameCn: '德国', center: [10.45, 51.17], capital: [13.40, 52.52], region: 'Europe' },
  { id: 'ITA', name: 'Italy', nameCn: '意大利', center: [12.57, 41.87], capital: [12.50, 41.90], region: 'Europe' },
  { id: 'ESP', name: 'Spain', nameCn: '西班牙', center: [-3.75, 40.46], capital: [-3.70, 40.42], region: 'Europe' },
  { id: 'NLD', name: 'Netherlands', nameCn: '荷兰', center: [5.29, 52.13], capital: [4.90, 52.37], region: 'Europe' },
  { id: 'POL', name: 'Poland', nameCn: '波兰', center: [19.15, 51.92], capital: [21.01, 52.23], region: 'Europe' },
  { id: 'UKR', name: 'Ukraine', nameCn: '乌克兰', center: [31.17, 48.38], capital: [30.52, 50.45], region: 'Europe' },
  { id: 'SWE', name: 'Sweden', nameCn: '瑞典', center: [18.64, 60.13], capital: [18.07, 59.33], region: 'Europe' },
  { id: 'NOR', name: 'Norway', nameCn: '挪威', center: [8.47, 60.47], capital: [10.75, 59.91], region: 'Europe' },
  { id: 'CHE', name: 'Switzerland', nameCn: '瑞士', center: [8.23, 46.82], capital: [7.45, 46.95], region: 'Europe' },
  { id: 'TUR', name: 'Turkey', nameCn: '土耳其', center: [35.24, 38.96], capital: [32.87, 39.93], region: 'Europe' },
  { id: 'GRC', name: 'Greece', nameCn: '希腊', center: [21.82, 39.07], capital: [23.73, 37.98], region: 'Europe' },

  // ── East Asia ──────────────────────────────────────────────
  { id: 'CHN', name: 'China', nameCn: '中国', center: [104.20, 35.86], capital: [116.41, 39.90], region: 'East Asia' },
  { id: 'JPN', name: 'Japan', nameCn: '日本', center: [138.25, 36.20], capital: [139.69, 35.69], region: 'East Asia' },
  { id: 'KOR', name: 'South Korea', nameCn: '韩国', center: [127.77, 35.91], capital: [126.98, 37.57], region: 'East Asia' },
  { id: 'PRK', name: 'North Korea', nameCn: '朝鲜', center: [127.51, 40.34], capital: [125.75, 39.02], region: 'East Asia' },
  { id: 'TWN', name: 'Taiwan', nameCn: '台湾', center: [120.96, 23.70], capital: [121.57, 25.03], region: 'East Asia' },

  // ── Southeast Asia ─────────────────────────────────────────
  { id: 'SGP', name: 'Singapore', nameCn: '新加坡', center: [103.82, 1.35], capital: [103.82, 1.35], region: 'Southeast Asia' },
  { id: 'VNM', name: 'Vietnam', nameCn: '越南', center: [108.28, 14.06], capital: [105.83, 21.03], region: 'Southeast Asia' },
  { id: 'THA', name: 'Thailand', nameCn: '泰国', center: [100.99, 15.87], capital: [100.50, 13.76], region: 'Southeast Asia' },
  { id: 'IDN', name: 'Indonesia', nameCn: '印度尼西亚', center: [113.92, -0.79], capital: [106.85, -6.21], region: 'Southeast Asia' },
  { id: 'PHL', name: 'Philippines', nameCn: '菲律宾', center: [121.77, 12.88], capital: [120.98, 14.60], region: 'Southeast Asia' },
  { id: 'MYS', name: 'Malaysia', nameCn: '马来西亚', center: [101.98, 4.21], capital: [101.69, 3.14], region: 'Southeast Asia' },

  // ── South Asia ─────────────────────────────────────────────
  { id: 'IND', name: 'India', nameCn: '印度', center: [78.96, 20.59], capital: [77.21, 28.61], region: 'South Asia' },
  { id: 'PAK', name: 'Pakistan', nameCn: '巴基斯坦', center: [69.35, 30.38], capital: [73.05, 33.69], region: 'South Asia' },
  { id: 'BGD', name: 'Bangladesh', nameCn: '孟加拉国', center: [90.36, 23.68], capital: [90.41, 23.81], region: 'South Asia' },

  // ── Central Asia & Russia ──────────────────────────────────
  { id: 'RUS', name: 'Russia', nameCn: '俄罗斯', center: [105.32, 61.52], capital: [37.62, 55.76], region: 'Central Asia' },
  { id: 'KAZ', name: 'Kazakhstan', nameCn: '哈萨克斯坦', center: [66.92, 48.02], capital: [71.47, 51.17], region: 'Central Asia' },

  // ── Middle East ────────────────────────────────────────────
  { id: 'SAU', name: 'Saudi Arabia', nameCn: '沙特阿拉伯', center: [45.08, 23.89], capital: [46.68, 24.71], region: 'Middle East' },
  { id: 'IRN', name: 'Iran', nameCn: '伊朗', center: [53.69, 32.43], capital: [51.39, 35.69], region: 'Middle East' },
  { id: 'IRQ', name: 'Iraq', nameCn: '伊拉克', center: [43.68, 33.22], capital: [44.37, 33.31], region: 'Middle East' },
  { id: 'ISR', name: 'Israel', nameCn: '以色列', center: [34.85, 31.05], capital: [35.22, 31.77], region: 'Middle East' },
  { id: 'ARE', name: 'United Arab Emirates', nameCn: '阿联酋', center: [53.85, 23.42], capital: [54.37, 24.45], region: 'Middle East' },
  { id: 'EGY', name: 'Egypt', nameCn: '埃及', center: [30.80, 26.82], capital: [31.24, 30.04], region: 'Middle East' },

  // ── Africa ─────────────────────────────────────────────────
  { id: 'NGA', name: 'Nigeria', nameCn: '尼日利亚', center: [8.68, 9.08], capital: [7.49, 9.06], region: 'Africa' },
  { id: 'ZAF', name: 'South Africa', nameCn: '南非', center: [22.94, -30.56], capital: [28.19, -25.75], region: 'Africa' },
  { id: 'ETH', name: 'Ethiopia', nameCn: '埃塞俄比亚', center: [40.49, 9.15], capital: [38.75, 9.02], region: 'Africa' },

  // ── Oceania ────────────────────────────────────────────────
  { id: 'AUS', name: 'Australia', nameCn: '澳大利亚', center: [133.78, -25.27], capital: [149.13, -35.28], region: 'Oceania' },
  { id: 'NZL', name: 'New Zealand', nameCn: '新西兰', center: [174.89, -40.90], capital: [174.78, -41.29], region: 'Oceania' },
];
