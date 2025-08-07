/**
 * Professional UI Components Library
 * Non-gamified, trustworthy components for family security planning
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText,
  Shield,
  Lock,
  Users,
  Home,
  ChevronRight,
  Info
} from 'lucide-react';

// ============================================================
// STATUS INDICATORS - No progress bars or percentages
// ============================================================

interface StatusBadgeProps {
  status: 'complete' | 'in_progress' | 'needs_review' | 'not_started';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusConfig = {
    complete: {
      label: 'Complete',
      icon: CheckCircle2,
      className: 'bg-prof-success/10 text-prof-success border-prof-success/20'
    },
    in_progress: {
      label: 'In Progress',
      icon: Clock,
      className: 'bg-prof-info/10 text-prof-info border-prof-info/20'
    },
    needs_review: {
      label: 'Needs Review',
      icon: AlertCircle,
      className: 'bg-prof-warning/10 text-prof-warning border-prof-warning/20'
    },
    not_started: {
      label: 'Not Started',
      icon: FileText,
      className: 'bg-prof-secondary-100 text-prof-secondary-500 border-prof-secondary-200'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
      config.className,
      className
    )}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// ============================================================
// PRIORITY INDICATORS
// ============================================================

interface PriorityIndicatorProps {
  priority: 'urgent' | 'high' | 'medium' | 'low';
  showLabel?: boolean;
  className?: string;
}

export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({ 
  priority, 
  showLabel = true,
  className 
}) => {
  const priorityConfig = {
    urgent: {
      label: 'Urgent',
      className: 'text-prof-urgent',
      dotClassName: 'bg-prof-urgent'
    },
    high: {
      label: 'High Priority',
      className: 'text-prof-high',
      dotClassName: 'bg-prof-high'
    },
    medium: {
      label: 'Medium Priority',
      className: 'text-prof-medium',
      dotClassName: 'bg-prof-medium'
    },
    low: {
      label: 'Low Priority',
      className: 'text-prof-low',
      dotClassName: 'bg-prof-low'
    }
  };

  const config = priorityConfig[priority];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('w-2 h-2 rounded-full', config.dotClassName)} />
      {showLabel && (
        <span className={cn('text-sm font-medium', config.className)}>
          {config.label}
        </span>
      )}
    </div>
  );
};

// ============================================================
// READINESS LEVEL INDICATOR
// ============================================================

interface ReadinessLevelProps {
  level: 'initial' | 'developing' | 'established' | 'comprehensive' | 'maintained';
  showDescription?: boolean;
  className?: string;
}

export const ReadinessLevel: React.FC<ReadinessLevelProps> = ({ 
  level, 
  showDescription = false,
  className 
}) => {
  const levelConfig = {
    initial: {
      label: 'Initial Setup',
      description: 'Getting started with family security',
      icon: FileText,
      className: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    developing: {
      label: 'Developing',
      description: 'Building essential security foundation',
      icon: Clock,
      className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    },
    established: {
      label: 'Established',
      description: 'Core security measures in place',
      icon: Home,
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    comprehensive: {
      label: 'Comprehensive',
      description: 'Most security areas well-established',
      icon: Shield,
      className: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    maintained: {
      label: 'Fully Maintained',
      description: 'All areas complete and up-to-date',
      icon: Lock,
      className: 'bg-green-50 text-green-700 border-green-200'
    }
  };

  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <div className={cn(
      'inline-flex items-center gap-3 px-4 py-2 rounded-lg border',
      config.className,
      className
    )}>
      <Icon className="w-5 h-5" />
      <div>
        <div className="font-semibold">{config.label}</div>
        {showDescription && (
          <div className="text-sm opacity-80">{config.description}</div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// SECURITY AREA CARD
// ============================================================

interface SecurityAreaCardProps {
  title: string;
  description: string;
  status: 'complete' | 'in_progress' | 'needs_review' | 'not_started';
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  estimatedTime?: string;
  lastUpdated?: string;
  onClick?: () => void;
  className?: string;
}

export const SecurityAreaCard: React.FC<SecurityAreaCardProps> = ({
  title,
  description,
  status,
  priority,
  estimatedTime,
  lastUpdated,
  onClick,
  className
}) => {
  return (
    <div 
      className={cn(
        'group relative bg-white rounded-xl border border-prof-secondary-200',
        'shadow-prof-sm hover:shadow-prof-md transition-all duration-prof',
        'cursor-pointer overflow-hidden',
        className
      )}
      onClick={onClick}
    >
      {/* Priority indicator stripe */}
      {priority && priority !== 'low' && (
        <div className={cn(
          'absolute top-0 left-0 w-1 h-full',
          priority === 'urgent' && 'bg-prof-urgent',
          priority === 'high' && 'bg-prof-high',
          priority === 'medium' && 'bg-prof-medium'
        )} />
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-prof-secondary-900 group-hover:text-prof-primary-600 transition-colors">
            {title}
          </h3>
          <StatusBadge status={status} />
        </div>
        
        <p className="text-sm text-prof-secondary-600 mb-4">
          {description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-prof-secondary-500">
          <div className="flex items-center gap-4">
            {estimatedTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {estimatedTime}
              </span>
            )}
            {lastUpdated && (
              <span>Updated {lastUpdated}</span>
            )}
          </div>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

// ============================================================
// RECOMMENDATION CARD
// ============================================================

interface RecommendationCardProps {
  type: 'action' | 'review' | 'update' | 'consultation';
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedTime: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  type,
  title,
  description,
  priority,
  estimatedTime,
  actionLabel = 'Take Action',
  onAction,
  className
}) => {
  const typeConfig = {
    action: { icon: FileText, color: 'text-prof-primary-600' },
    review: { icon: Clock, color: 'text-prof-warning' },
    update: { icon: AlertCircle, color: 'text-prof-info' },
    consultation: { icon: Users, color: 'text-prof-secondary-600' }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      'bg-white rounded-lg border',
      priority === 'urgent' ? 'border-prof-urgent/30 shadow-prof-md' : 'border-prof-secondary-200 shadow-prof-sm',
      'hover:shadow-prof-lg transition-all duration-prof',
      className
    )}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn('p-2 rounded-lg bg-prof-secondary-50', config.color)}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-prof-secondary-900">{title}</h4>
              {priority === 'urgent' && (
                <PriorityIndicator priority={priority} showLabel={false} />
              )}
            </div>
            
            <p className="text-sm text-prof-secondary-600 mb-3">
              {description}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-prof-secondary-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {estimatedTime}
              </span>
              
              <button
                onClick={onAction}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  priority === 'urgent' 
                    ? 'bg-prof-urgent text-white hover:bg-prof-urgent/90'
                    : 'bg-prof-primary-600 text-white hover:bg-prof-primary-700'
                )}
              >
                {actionLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PROGRESS OVERVIEW - No gamification
// ============================================================

interface ProgressOverviewProps {
  completedAreas: number;
  totalAreas: number;
  needsReviewCount: number;
  urgentActionsCount: number;
  className?: string;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  completedAreas,
  totalAreas,
  needsReviewCount,
  urgentActionsCount,
  className
}) => {
  return (
    <div className={cn(
      'bg-gradient-to-br from-prof-primary-50 to-prof-primary-100',
      'rounded-xl border border-prof-primary-200 p-6',
      className
    )}>
      <h3 className="text-lg font-semibold text-prof-primary-900 mb-4">
        Security Overview
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 rounded-lg p-3">
          <div className="text-2xl font-bold text-prof-primary-600">
            {completedAreas}/{totalAreas}
          </div>
          <div className="text-xs text-prof-secondary-600">Areas Complete</div>
        </div>
        
        {urgentActionsCount > 0 && (
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <div className="text-2xl font-bold text-prof-urgent">
              {urgentActionsCount}
            </div>
            <div className="text-xs text-prof-urgent">Urgent Actions</div>
          </div>
        )}
        
        {needsReviewCount > 0 && (
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <div className="text-2xl font-bold text-prof-warning">
              {needsReviewCount}
            </div>
            <div className="text-xs text-prof-warning">Need Review</div>
          </div>
        )}
        
        <div className="bg-white/80 rounded-lg p-3">
          <div className="text-2xl font-bold text-prof-success">
            {Math.round((completedAreas / totalAreas) * 100)}%
          </div>
          <div className="text-xs text-prof-secondary-600">Secured</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// INFORMATION ALERT - Supportive messaging
// ============================================================

interface InfoAlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const InfoAlert: React.FC<InfoAlertProps> = ({
  type = 'info',
  title,
  description,
  action,
  className
}) => {
  const typeConfig = {
    info: {
      icon: Info,
      className: 'bg-prof-info-light border-prof-info/20 text-prof-info-dark'
    },
    success: {
      icon: CheckCircle2,
      className: 'bg-prof-success-light border-prof-success/20 text-prof-success-dark'
    },
    warning: {
      icon: AlertCircle,
      className: 'bg-prof-warning-light border-prof-warning/20 text-prof-warning-dark'
    },
    error: {
      icon: AlertCircle,
      className: 'bg-prof-error-light border-prof-error/20 text-prof-error-dark'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      'rounded-lg border p-4',
      config.className,
      className
    )}>
      <div className="flex gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          {description && (
            <p className="text-sm mt-1 opacity-90">{description}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm font-medium underline mt-2 hover:no-underline"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
