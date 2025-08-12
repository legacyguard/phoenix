import React from "react";

/**
 * Gentle encouragement component for users who may procrastinate.
 * Provides minimal guidance without altering existing UI/UX design.
 */
const ProcrastinationSupport: React.FC = () => {
  return (
    <div className="emotional-support procrastination">
      <h3>It's Hard to Think About These Things</h3>
      <p>
        Many people put off estate planning because it involves thinking about
        difficult topics. That's completely understandable.
      </p>
      <div className="gentle-encouragement">
        <p>
          Even spending 5 minutes today will help your family. Small steps
          count.
        </p>
        <button data-testid="procrastinationsupport-just-5-minutes-today">Just 5 Minutes Today</button>
      </div>
    </div>
  );
};

export default ProcrastinationSupport;
