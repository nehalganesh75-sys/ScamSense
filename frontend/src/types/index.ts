export type AssessmentType = 'low_risk' | 'caution_advised' | 'high_suspicion';
export type SeverityType = 'low' | 'medium' | 'high' | 'critical';

export interface Indicator {
  code: string;
  title: string;
  severity: SeverityType;
  evidence: string | null;
  explanation: string;
  recommendation: string;
}

export interface URLInspection {
  id?: number;
  raw_url: string;
  normalized_domain: string;
  risk_score: number;
  assessment: AssessmentType;
  structural_flags: string[];
  reputation_status: string;
  reputation_provider: string;
  details: {
    scheme?: string;
    host?: string;
    path?: string;
    tld?: string;
    flag_explanations?: Array<{ flag: string; severity: string; desc: string }>;
    recommendation?: string;
    error?: string;
  };
  created_at?: string;
}

export interface AnalysisResult {
  id?: number;
  assessment: AssessmentType;
  risk_score: number;
  summary: string;
  analysis_type: string;
  content_preview?: string;
  indicators: Indicator[];
  url_inspection?: URLInspection | null;
  recommendations: string[];
  limitations: string[];
  created_at?: string;
}

export interface ScenarioOption {
  id: string;
  text: string;
  is_safest: boolean;
  explanation: string;
}

export interface Scenario {
  id: string;
  category: string;
  difficulty: string;
  title: string;
  fictional_sender: string;
  fictional_message: string;
  options: ScenarioOption[];
  learning_takeaway: string;
}

export interface ScenarioAttemptResult {
  scenario_id: string;
  selected_option_id: string;
  is_correct: boolean;
  score: number;
  explanation: string;
  learning_takeaway: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  group?: string;
  risk_level?: AssessmentType;
  details: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  relationship: string;
}

export interface PatternGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface DashboardSummary {
  total_analyses: number;
  risk_distribution: {
    high_suspicion: number;
    caution_advised: number;
    low_risk: number;
  };
  type_distribution: Record<string, number>;
  top_indicators: Array<{
    code: string;
    title: string;
    severity: string;
    count: number;
  }>;
  total_url_inspections: number;
  simulator_stats: {
    total_attempts: number;
    average_score: number;
    scenarios_completed: number;
  };
  is_demo_data: boolean;
}

export interface TrendPoint {
  date: string;
  total: number;
  high_suspicion: number;
  caution_advised: number;
  low_risk: number;
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  consent_store_content: boolean;
  created_at: string;
}
