import React from 'react';
import { cn } from '@/lib/utils';

export interface AnimatedProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  currentStep,
  totalSteps,
  className
}) => {
  // Handle edge cases
  const safeCurrentStep = Math.max(0, currentStep);
  const safeTotalSteps = Math.max(1, totalSteps);
  const progress = Math.min((safeCurrentStep / safeTotalSteps) * 100, 100);

  return (
    <div className={cn("w-full", className)}>
      {/* Progress Bar */}
      <div 
        className="relative h-2 bg-muted rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={safeCurrentStep}
        aria-valuemin={0}
        aria-valuemax={safeTotalSteps}
        aria-label={`Progress: step ${safeCurrentStep} of ${safeTotalSteps}`}
      >
        <div
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step Indicator */}
      <div className="flex justify-between items-center mt-3">
        <span className="text-sm text-muted-foreground">
          Step {safeCurrentStep} of {safeTotalSteps}
        </span>
        <span className="text-sm font-medium text-primary">
          {Math.round(progress)}% Complete
        </span>
      </div>
      
      {/* Step Dots */}
      <div className="flex justify-center space-x-2 mt-4">
        {Array.from({ length: safeTotalSteps }, (_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index < safeCurrentStep
                ? "bg-primary scale-110"
                : index === safeCurrentStep
                ? "bg-primary"
                : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedProgress;
