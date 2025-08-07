import React from 'react';

const LegacyPlanningAssistant: React.FC = () => {
  return (
    <div className="legacy-planning-assistant">
      <AssistantMessage 
        message="Creating a will is really about making sure your family is taken care of and your wishes are clear. Let's think through what matters most to you."
      />
      <FamilyWishesGathering />
      <ValuesAndPrioritiesSection />
      <LegacyImpactPreview />
    </div>
  );
};

export default LegacyPlanningAssistant;

