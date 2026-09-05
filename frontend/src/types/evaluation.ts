export interface PerformanceEvaluation {
  id: number;
  employee: {
    id: number;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
    employee_id: string;
    department: string;
    position: string;
  };
  evaluator: {
    id: number;
    first_name: string;
    last_name: string;
  };
  evaluation_period_start: string;
  evaluation_period_end: string;
  overall_rating: 1 | 2 | 3 | 4 | 5;
  goals: string;
  achievements: string;
  areas_for_improvement: string;
  manager_comments: string;
  employee_comments?: string;
  status: 'draft' | 'submitted' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CreateEvaluationRequest {
  employee_id: number;
  evaluation_period_start: string;
  evaluation_period_end: string;
  overall_rating: number;
  goals: string;
  achievements: string;
  areas_for_improvement: string;
  manager_comments: string;
}

export interface UpdateEvaluationRequest extends Partial<CreateEvaluationRequest> {
  id: number;
  employee_comments?: string;
  status?: 'draft' | 'submitted' | 'completed';
}