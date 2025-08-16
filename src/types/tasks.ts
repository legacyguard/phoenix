/**
 * Task types for the MicroTaskEngine
 * Following WARP.md principles: no gamification, respectful UX
 */

export interface MicroTask {
  id: string;
  title: string; // e.g., "Nájdite číslo účtu"
  description: string; // Clear, empathetic instructions
  estimatedTime: number; // in minutes (1-5)
  component: 'Input' | 'Textarea' | 'FileUpload' | 'Confirmation' | 'Select';
  placeholder?: string; // Minimal, neutral text as per WARP.md
  required?: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    message?: string;
  };
  // For reassuring progress (not gamified)
  completionMessage?: string; // Explains future benefit of this action
  whyImportant?: string; // Context for the task's importance
}

export interface TaskSequence {
  id: string;
  title: string; // e.g., "Zabezpečenie prístupu k bankovému účtu"
  category: 'financial' | 'legal' | 'medical' | 'digital' | 'personal';
  icon?: string; // Lucide icon name
  totalEstimatedTime: number; // Sum of all tasks
  tasks: MicroTask[];
  // Life area connection (from Dashboard LifeArea interface)
  lifeAreaId?: string;
  scenario?: string; // "What if something happens to you tomorrow?"
  whyImportant: string; // Overall importance explanation
  completionBenefit: string; // What this protects for loved ones
}

export interface TaskProgress {
  sequenceId: string;
  currentTaskIndex: number;
  completedTasks: string[];
  data: Record<string, any>; // Collected data from tasks
  startedAt: string;
  lastUpdatedAt: string;
  completedAt?: string;
}

export interface MicroTaskResponse {
  taskId: string;
  value: any;
  timestamp: string;
}
