import React from "react";

const LegacyPlanningAssistant: React.FC = () => {
  return (
    <div className="legacy-planning-assistant">
      <AssistantMessage message="Creating a will is really about making sure your family is taken care of and your wishes are clear. Let's think through what matters most to you." data-testid="legacyplanningassistant-assistantmessage" />
      <FamilyWishesGathering data-testid="legacyplanningassistant-familywishesgathering" />
      <ValuesAndPrioritiesSection data-testid="legacyplanningassistant-valuesandprioritiessection" />
      <LegacyImpactPreview data-testid="legacyplanningassistant-legacyimpactpreview" />
    </div>
  );
};

export default LegacyPlanningAssistant;
