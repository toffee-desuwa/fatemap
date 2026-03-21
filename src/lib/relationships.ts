import type { Relationship } from './types';

/** Helper to build a relationship with auto-generated ID. */
function r(
  from: string,
  to: string,
  type: Relationship['type'],
  strength: Relationship['strength'],
): Relationship {
  return { id: `${from}-${to}-${type}`, from, to, type, strength };
}

/**
 * 142 bilateral relationships forming the geopolitical network.
 * Six types: trade, military_alliance, energy_dependency,
 * supply_chain, political, geographic_proximity.
 * Strength 1 (weak) – 5 (critical).
 */
export const RELATIONSHIPS: Relationship[] = [
  // ═══════════════════════════════════════════════════════════════
  // TRADE (30)
  // ═══════════════════════════════════════════════════════════════
  r('USA', 'CHN', 'trade', 5),
  r('USA', 'CAN', 'trade', 5),
  r('USA', 'MEX', 'trade', 5),
  r('USA', 'JPN', 'trade', 4),
  r('USA', 'DEU', 'trade', 4),
  r('USA', 'GBR', 'trade', 4),
  r('USA', 'KOR', 'trade', 4),
  r('USA', 'IND', 'trade', 3),
  r('USA', 'TWN', 'trade', 4),
  r('CHN', 'JPN', 'trade', 4),
  r('CHN', 'KOR', 'trade', 4),
  r('CHN', 'AUS', 'trade', 4),
  r('CHN', 'DEU', 'trade', 4),
  r('CHN', 'BRA', 'trade', 3),
  r('CHN', 'SGP', 'trade', 4),
  r('CHN', 'VNM', 'trade', 3),
  r('CHN', 'MYS', 'trade', 3),
  r('DEU', 'FRA', 'trade', 4),
  r('DEU', 'NLD', 'trade', 4),
  r('DEU', 'ITA', 'trade', 3),
  r('DEU', 'GBR', 'trade', 4),
  r('DEU', 'CHE', 'trade', 3),
  r('JPN', 'AUS', 'trade', 3),
  r('JPN', 'SGP', 'trade', 3),
  r('IND', 'ARE', 'trade', 3),
  r('SGP', 'MYS', 'trade', 4),
  r('SGP', 'IDN', 'trade', 3),
  r('AUS', 'NZL', 'trade', 4),
  r('BRA', 'ARG', 'trade', 3),
  r('GBR', 'FRA', 'trade', 3),

  // ═══════════════════════════════════════════════════════════════
  // MILITARY ALLIANCE (25)
  // ═══════════════════════════════════════════════════════════════
  r('USA', 'GBR', 'military_alliance', 5),
  r('USA', 'FRA', 'military_alliance', 4),
  r('USA', 'DEU', 'military_alliance', 4),
  r('USA', 'CAN', 'military_alliance', 5),
  r('USA', 'TUR', 'military_alliance', 3),
  r('USA', 'NOR', 'military_alliance', 3),
  r('USA', 'POL', 'military_alliance', 3),
  r('USA', 'JPN', 'military_alliance', 5),
  r('USA', 'KOR', 'military_alliance', 5),
  r('USA', 'AUS', 'military_alliance', 4),
  r('USA', 'ISR', 'military_alliance', 5),
  r('GBR', 'FRA', 'military_alliance', 4),
  r('FRA', 'DEU', 'military_alliance', 4),
  r('CHN', 'RUS', 'military_alliance', 4),
  r('CHN', 'PRK', 'military_alliance', 4),
  r('RUS', 'IRN', 'military_alliance', 3),
  r('IND', 'RUS', 'military_alliance', 3),
  r('PAK', 'CHN', 'military_alliance', 3),
  r('SAU', 'ARE', 'military_alliance', 4),
  r('AUS', 'NZL', 'military_alliance', 4),
  r('USA', 'SGP', 'military_alliance', 3),
  r('GBR', 'AUS', 'military_alliance', 3),
  r('JPN', 'AUS', 'military_alliance', 3),
  r('USA', 'PHL', 'military_alliance', 3),
  r('FRA', 'GRC', 'military_alliance', 3),

  // ═══════════════════════════════════════════════════════════════
  // ENERGY DEPENDENCY (22)
  // ═══════════════════════════════════════════════════════════════
  r('DEU', 'RUS', 'energy_dependency', 4),
  r('CHN', 'SAU', 'energy_dependency', 4),
  r('CHN', 'IRN', 'energy_dependency', 3),
  r('CHN', 'RUS', 'energy_dependency', 4),
  r('JPN', 'SAU', 'energy_dependency', 4),
  r('JPN', 'ARE', 'energy_dependency', 3),
  r('KOR', 'SAU', 'energy_dependency', 3),
  r('IND', 'SAU', 'energy_dependency', 4),
  r('IND', 'IRN', 'energy_dependency', 3),
  r('USA', 'CAN', 'energy_dependency', 4),
  r('USA', 'SAU', 'energy_dependency', 3),
  r('EGY', 'SAU', 'energy_dependency', 3),
  r('TUR', 'RUS', 'energy_dependency', 4),
  r('UKR', 'RUS', 'energy_dependency', 4),
  r('POL', 'NOR', 'energy_dependency', 3),
  r('FRA', 'NOR', 'energy_dependency', 2),
  r('ITA', 'RUS', 'energy_dependency', 3),
  r('NLD', 'NOR', 'energy_dependency', 3),
  r('GBR', 'NOR', 'energy_dependency', 3),
  r('CHN', 'AUS', 'energy_dependency', 3),
  r('JPN', 'AUS', 'energy_dependency', 3),
  r('IND', 'IRQ', 'energy_dependency', 3),

  // ═══════════════════════════════════════════════════════════════
  // SUPPLY CHAIN (25)
  // ═══════════════════════════════════════════════════════════════
  r('USA', 'TWN', 'supply_chain', 5),  // semiconductors
  r('CHN', 'TWN', 'supply_chain', 5),  // semiconductors
  r('JPN', 'TWN', 'supply_chain', 4),  // semiconductors
  r('KOR', 'TWN', 'supply_chain', 4),  // semiconductors
  r('USA', 'CHN', 'supply_chain', 5),  // manufacturing
  r('USA', 'IND', 'supply_chain', 3),  // IT services
  r('USA', 'VNM', 'supply_chain', 3),  // manufacturing shift
  r('CHN', 'VNM', 'supply_chain', 4),  // manufacturing
  r('CHN', 'BGD', 'supply_chain', 3),  // textiles
  r('CHN', 'IDN', 'supply_chain', 3),  // manufacturing
  r('CHN', 'THA', 'supply_chain', 3),  // electronics
  r('CHN', 'MYS', 'supply_chain', 4),  // semiconductors
  r('JPN', 'THA', 'supply_chain', 4),  // auto manufacturing
  r('DEU', 'MEX', 'supply_chain', 3),  // auto manufacturing
  r('IND', 'BGD', 'supply_chain', 3),  // textiles & pharma
  r('JPN', 'CHN', 'supply_chain', 4),  // electronics
  r('KOR', 'CHN', 'supply_chain', 4),  // electronics
  r('KOR', 'VNM', 'supply_chain', 3),  // electronics assembly
  r('USA', 'MEX', 'supply_chain', 4),  // nearshoring
  r('DEU', 'POL', 'supply_chain', 3),  // manufacturing
  r('CHN', 'KAZ', 'supply_chain', 3),  // rare earths & minerals
  r('JPN', 'IDN', 'supply_chain', 3),  // nickel & metals
  r('SGP', 'CHN', 'supply_chain', 3),  // trade hub
  r('DEU', 'CHN', 'supply_chain', 3),  // industrial machinery
  r('FRA', 'CHN', 'supply_chain', 3),  // luxury & aerospace

  // ═══════════════════════════════════════════════════════════════
  // POLITICAL (20)
  // ═══════════════════════════════════════════════════════════════
  r('USA', 'ISR', 'political', 5),
  r('USA', 'TWN', 'political', 5),
  r('CHN', 'TWN', 'political', 5),
  r('CHN', 'PRK', 'political', 4),
  r('RUS', 'UKR', 'political', 5),
  r('ISR', 'IRN', 'political', 5),
  r('SAU', 'IRN', 'political', 5),
  r('IND', 'PAK', 'political', 5),
  r('USA', 'SAU', 'political', 4),
  r('CHN', 'RUS', 'political', 4),
  r('USA', 'CHN', 'political', 5),
  r('GBR', 'USA', 'political', 4),
  r('FRA', 'DEU', 'political', 4),
  r('KOR', 'PRK', 'political', 5),
  r('ISR', 'EGY', 'political', 3),
  r('TUR', 'GRC', 'political', 4),
  r('CHN', 'JPN', 'political', 4),
  r('CHN', 'IND', 'political', 4),
  r('IRN', 'IRQ', 'political', 4),
  r('RUS', 'GBR', 'political', 3),

  // ═══════════════════════════════════════════════════════════════
  // GEOGRAPHIC PROXIMITY (20)
  // ═══════════════════════════════════════════════════════════════
  r('ISR', 'EGY', 'geographic_proximity', 4),
  r('TUR', 'IRQ', 'geographic_proximity', 4),
  r('IRN', 'IRQ', 'geographic_proximity', 5),
  r('SAU', 'IRQ', 'geographic_proximity', 4),
  r('IND', 'BGD', 'geographic_proximity', 5),
  r('THA', 'MYS', 'geographic_proximity', 5),
  r('IDN', 'MYS', 'geographic_proximity', 5),
  r('KOR', 'PRK', 'geographic_proximity', 5),
  r('RUS', 'UKR', 'geographic_proximity', 5),
  r('CHN', 'VNM', 'geographic_proximity', 5),
  r('CHN', 'PRK', 'geographic_proximity', 5),
  r('PAK', 'IRN', 'geographic_proximity', 4),
  r('PAK', 'IND', 'geographic_proximity', 5),
  r('SAU', 'ARE', 'geographic_proximity', 5),
  r('TUR', 'GRC', 'geographic_proximity', 5),
  r('NOR', 'SWE', 'geographic_proximity', 5),
  r('DEU', 'NLD', 'geographic_proximity', 5),
  r('DEU', 'POL', 'geographic_proximity', 5),
  r('SGP', 'MYS', 'geographic_proximity', 5),
  r('EGY', 'SAU', 'geographic_proximity', 4),
];
