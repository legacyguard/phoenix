import React from 'react';

const FamilyInformationOrganizer: React.FC = () => {
  return (
    <div className="family-information-organizer">
      <AssistantMessage 
        message="Let's organize your important papers so your family can find what they need quickly, especially during stressful times."
      />
      <DocumentsByFamilyNeed />
      <UrgencyBasedOrganization />
      <FamilyAccessGuidance />
    </div>
  );
};

export default FamilyInformationOrganizer;

