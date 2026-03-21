export interface Country {
  id: string;
  name: string;
  nameCn: string;
  center: [number, number]; // [lng, lat]
  capital: [number, number];
  region: string;
}

export interface City {
  id: string;
  name: string;
  nameCn: string;
  coordinates: [number, number];
  countryId: string;
  type:
    | 'financial'
    | 'port'
    | 'tech'
    | 'political'
    | 'energy'
    | 'manufacturing'
    | 'logistics';
  importance: 1 | 2 | 3 | 4 | 5;
}

export interface Relationship {
  id: string; // e.g. "USA-CHN-trade"
  from: string;
  to: string;
  type:
    | 'trade'
    | 'military_alliance'
    | 'energy_dependency'
    | 'supply_chain'
    | 'political'
    | 'geographic_proximity';
  strength: 1 | 2 | 3 | 4 | 5;
}

export interface CountryImpact {
  countryId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  direction: 'negative' | 'positive' | 'mixed';
  impactPercent: number; // -50 to +50
  reason: string;
  reasonZh: string;
}

export interface CityImpact {
  cityId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  direction: 'negative' | 'positive' | 'mixed';
  impactType:
    | 'trade_disruption'
    | 'market_crash'
    | 'military_threat'
    | 'supply_shortage'
    | 'refugee_crisis'
    | 'energy_crisis'
    | 'infrastructure_damage'
    | 'opportunity'
    | 'other';
}

export interface SimulationResult {
  event: string;
  timestamp: string;
  epicenter: {
    countryId: string;
    coordinates: [number, number];
  };
  countryImpacts: CountryImpact[];
  cityImpacts: CityImpact[];
  activatedRelationships: string[];
  summary: string;
  summaryZh: string;
}

export interface PresetScenario {
  id: string;
  name: string;
  nameCn: string;
  category:
    | 'military'
    | 'economic'
    | 'climate'
    | 'health'
    | 'political'
    | 'trade'
    | 'energy'
    | 'technology';
  description: string;
  descriptionZh: string;
  eventText: string;
  keywords: string[];
  result: SimulationResult;
}

export interface LlmProvider {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  format: 'openai' | 'anthropic';
  buildHeaders: (apiKey: string) => Record<string, string>;
}

export type AnimationPhase = 'idle' | 'ripple' | 'network' | 'persistent';
