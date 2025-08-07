import React from 'react';

interface AcknowledgmentMoment {
  trigger: string;
  type: 'foundation' | 'documentation' | 'completion' | 'responsibility_fulfilled';
  familyImpact: string;
  acknowledgmentMessage: string;
  confidenceBuilder: string;
}

interface ProtectionAcknowledgmentProps {
  moment: AcknowledgmentMoment;
  nextSteps?: string[];
  onContinue?: () => void;
}

const ProtectionAcknowledgment: React.FC<ProtectionAcknowledgmentProps> = ({ 
  moment, 
  nextSteps = [],
  onContinue 
}) => {
  return (
    <div className="protection-acknowledgment">
      <div className="acknowledgment-content">
        <div className="acknowledgment-icon">✓</div>
        <h2>Important Step Completed</h2>
        <p className="accomplishment">{moment.acknowledgmentMessage}</p>
        
        <div className="family-protection">
          <h3>Family Protection Impact:</h3>
          <p>{moment.familyImpact}</p>
        </div>
        
        <div className="confidence-building">
          <p>{moment.confidenceBuilder}</p>
        </div>
        
        {nextSteps.length > 0 && (
          <div className="next-steps">
            <h4>Consider Next:</h4>
            <ul>
              {nextSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        )}
        
        <button 
          className="continue-button" 
          onClick={onContinue}
        >
          Continue Protecting Your Family
        </button>
      </div>
    </div>
  );
};

export default ProtectionAcknowledgment;
