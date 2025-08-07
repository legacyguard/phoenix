import React from 'react';

interface ProtectionArea {
  name: string;
  description: string;
  isDocumented: boolean;
  benefit: string;
}

interface FamilyProtectionVisualizationProps {
  protectionAreas: ProtectionArea[];
}

const FamilyProtectionVisualization: React.FC<FamilyProtectionVisualizationProps> = ({ 
  protectionAreas 
}) => {
  const documentedAreas = protectionAreas.filter(area => area.isDocumented);
  const undocumentedAreas = protectionAreas.filter(area => !area.isDocumented);
  
  return (
    <div className="family-protection-visualization">
      <h2>Your Family's Protection Framework</h2>
      
      <div className="protection-shield">
        <div className="shield-icon">🛡️</div>
        <p className="protection-summary">
          You have documented {documentedAreas.length} of {protectionAreas.length} key protection areas
        </p>
      </div>
      
      <div className="protection-areas">
        <div className="documented-areas">
          <h3>Protected Areas</h3>
          <p className="section-description">Your family has security in these areas:</p>
          {documentedAreas.map((area, index) => (
            <div key={index} className="protection-area documented">
              <div className="area-header">
                <span className="check-icon">✓</span>
                <h4>{area.name}</h4>
              </div>
              <p className="area-description">{area.description}</p>
              <p className="area-benefit">{area.benefit}</p>
            </div>
          ))}
        </div>
        
        {undocumentedAreas.length > 0 && (
          <div className="undocumented-areas">
            <h3>Areas for Additional Protection</h3>
            <p className="section-description">Consider documenting these areas when you're ready:</p>
            {undocumentedAreas.map((area, index) => (
              <div key={index} className="protection-area undocumented">
                <h4>{area.name}</h4>
                <p className="area-description">{area.description}</p>
                <p className="potential-benefit">
                  <em>Potential benefit: {area.benefit}</em>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="confidence-statement">
        {documentedAreas.length === 0 && (
          <p>Begin documenting to build your family's protection framework</p>
        )}
        {documentedAreas.length > 0 && documentedAreas.length < 3 && (
          <p>You have established essential protection for your family</p>
        )}
        {documentedAreas.length >= 3 && documentedAreas.length < protectionAreas.length && (
          <p>Your family has substantial protection across multiple areas</p>
        )}
        {documentedAreas.length === protectionAreas.length && (
          <p>You have created a comprehensive protection framework for your family</p>
        )}
      </div>
    </div>
  );
};

export default FamilyProtectionVisualization;
