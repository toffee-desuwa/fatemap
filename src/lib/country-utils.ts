import { COUNTRIES } from './countries';
import { CITIES } from './cities';

/** ISO alpha-3 → alpha-2 for flag emoji (our 48 countries) */
const A3_TO_A2: Record<string, string> = {
  USA: 'US', CAN: 'CA', MEX: 'MX', BRA: 'BR', ARG: 'AR', CHL: 'CL', COL: 'CO', VEN: 'VE',
  GBR: 'GB', FRA: 'FR', DEU: 'DE', ITA: 'IT', ESP: 'ES', NLD: 'NL', POL: 'PL', UKR: 'UA', SWE: 'SE', NOR: 'NO', CHE: 'CH', GRC: 'GR',
  RUS: 'RU', TUR: 'TR', ISR: 'IL', SAU: 'SA', IRN: 'IR', IRQ: 'IQ', ARE: 'AE', QAT: 'QA', EGY: 'EG',
  CHN: 'CN', JPN: 'JP', KOR: 'KR', PRK: 'KP', TWN: 'TW',
  IND: 'IN', PAK: 'PK', BGD: 'BD',
  IDN: 'ID', VNM: 'VN', THA: 'TH', PHL: 'PH', MYS: 'MY', SGP: 'SG', MMR: 'MM',
  KAZ: 'KZ', UZB: 'UZ',
  NGA: 'NG', ZAF: 'ZA', KEN: 'KE', ETH: 'ET',
  AUS: 'AU', NZL: 'NZ',
};

/** Convert ISO alpha-3 country code to flag emoji */
export function countryFlag(alpha3: string): string {
  const alpha2 = A3_TO_A2[alpha3];
  if (!alpha2) return '';
  return String.fromCodePoint(
    ...alpha2.split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

/** Pre-built lookup maps for country/city by ID */
export const countryMap = new Map(COUNTRIES.map((c) => [c.id, c]));
export const cityMap = new Map(CITIES.map((c) => [c.id, c]));
