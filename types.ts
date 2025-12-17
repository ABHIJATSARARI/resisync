export interface Trip {
  id: string;
  country: string;
  countryCode?: string; // ISO 2-letter code
  startDate: string; // ISO Date string YYYY-MM-DD
  endDate: string;   // ISO Date string YYYY-MM-DD
  isSchengen: boolean;
  isSimulation?: boolean; // New flag for hypothetical trips
  notes?: string;
  document?: { name: string; file: File };
}

export interface UserProfile {
  nationality: string;
  currentLocation: string;
  travelGoals: string[];
}

export enum RiskLevel {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  DANGER = 'DANGER'
}

export interface ComplianceStatus {
  schengenDaysUsed: number;
  schengenDaysRemaining: number;
  riskLevel: RiskLevel;
  taxResidencyRisk: {
    country: string;
    daysSpent: number;
    threshold: number;
    risk: RiskLevel;
  }[];
  recommendation: string;
  resetDate?: string;
}

export interface AiAnalysisResponse {
  analysis: string;
  recommendations: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isLoading?: boolean;
  sources?: {
    title: string;
    uri: string;
  }[];
}