export type OptionValue = string;

export interface ChecklistOption {
  label: string;
  value: OptionValue;
  score: number;
}

export interface ChecklistItem {
  id: string;
  question: string;
  options: ChecklistOption[];
  education: string;
  riskNote?: string;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  icon: string;
  items: ChecklistItem[];
}

export type RiskLevel = "low" | "medium" | "high";

export interface DailyCheckResult {
  riskLevel: RiskLevel;
  totalScore: number;
  maxScore: number;
  triggers: string[];
  answers: Record<string, OptionValue>;
}
