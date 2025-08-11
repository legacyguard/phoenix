import React from "react";

/**
 * Support component shown when users feel overwhelmed.
 * Provides simple encouragement options without affecting UI/UX.
 */
const OverwhelmSupport: React.FC = () => {
  return (
    <div className="emotional-support overwhelm">
      <h3>This Can Feel Like a Lot</h3>
      <p>
        It's completely normal to feel overwhelmed when thinking about these
        important topics. You're dealing with big, emotional decisions.
      </p>
      <div className="support-options">
        <button>Take a Break</button>
        <button>Focus on Just One Thing</button>
        <button>Talk to Someone</button>
      </div>
    </div>
  );
};

export default OverwhelmSupport;
