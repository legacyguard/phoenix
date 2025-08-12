import React from "react";
import { LegacyBriefing } from "@/features/legacy-briefing/components/LegacyBriefing";

const LegacyBriefingPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <LegacyBriefing data-testid="legacybriefing-legacybriefing" />
    </div>
  );
};

export default LegacyBriefingPage;
