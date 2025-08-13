import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [hasChildren, setHasChildren] = useState(false);
  const [mainGoal, setMainGoal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { hasChildren, mainGoal };
    localStorage.setItem("onboardingData", JSON.stringify(data));
    localStorage.setItem("onboardingCompleted", "true");
    navigate("/dashboard");
  };

  return (
    <div>
      <h1>Onboarding</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>
            <input
              type="checkbox"
              checked={hasChildren}
              onChange={(e) => setHasChildren(e.target.checked)}
            />
            {" "}Máte deti?
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Aký je váš hlavný cieľ s aplikáciou?
            <br />
            <input
              type="text"
              value={mainGoal}
              onChange={(e) => setMainGoal(e.target.value)}
              placeholder="Váš cieľ"
              style={{ width: 300 }}
            />
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Onboarding;


