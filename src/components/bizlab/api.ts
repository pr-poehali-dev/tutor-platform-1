/** Структура разбора «советом директоров». Считается локально в localBoard.ts. */

export interface BoardMember {
  role: string;
  emoji: string;
  verdict: string;
  points: string[];
  action: string;
}

export interface Killer {
  title: string;
  why: string;
  fix: string;
}

export interface DemandPlan {
  title: string;
  budget: string;
  steps: string[];
  success_metric: string;
  fail_metric: string;
}

export interface Period {
  period: string;
  focus: string;
  tasks: string[];
  metric: string;
}

export interface BoardReview {
  headline: string;
  reality_check: string;
  board: BoardMember[];
  killers: Killer[];
  demand_plan: DemandPlan;
  before_launch: string[];
  first_90_days: Period[];
  money_advice: string;
  verdict_short: string;
}
