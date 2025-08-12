import React from "react";
import { LegacyLetters } from "@/features/legacy-briefing/components/LegacyLetters";

const LegacyLettersPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <LegacyLetters data-testid="legacyletters-legacyletters" />
    </div>
  );
};

export default LegacyLettersPage;
