import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type AnswerMap = Record<string, boolean>;

const questions = [
  { id: "ownsProperty", text: "Do you own real estate?", type: "boolean" as const },
  { id: "hasDependents", text: "Do you have children or other dependents?", type: "boolean" as const },
  { id: "hasBusiness", text: "Do you run a business?", type: "boolean" as const },
];

const PersonalizedOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});

  const finishOnboarding = (skip: boolean = false) => {
    const newTasks: { title: string; priority: "high" | "medium" }[] = [];
    if (!skip) {
      if (answers.ownsProperty) {
        newTasks.push({ title: "Obtain property insurance", priority: "medium" });
      }
      if (answers.hasDependents) {
        newTasks.push({ title: "Assign guardian for children", priority: "high" });
      }
      if (answers.hasBusiness) {
        newTasks.push({ title: "Create business continuity plan", priority: "medium" });
      }
    }

    try {
      const raw = localStorage.getItem("lifeInventoryTasks");
      const existing: { title: string; priority: "high" | "medium" }[] = raw ? JSON.parse(raw) : [];
      const seen = new Set(existing.map((t) => t.title));
      const merged = [...existing, ...newTasks.filter((t) => !seen.has(t.title))];
      localStorage.setItem("lifeInventoryTasks", JSON.stringify(merged));
      localStorage.setItem("personalizedAnswers", JSON.stringify(answers));
    } catch {}

    navigate("/dashboard");
  };

  const handleAnswer = (answer: boolean) => {
    const q = questions[currentIndex];
    const updated: AnswerMap = { ...answers, [q.id]: answer };
    setAnswers(updated);
    if (currentIndex >= questions.length - 1) {
      finishOnboarding(false);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleSkip = () => finishOnboarding(true);

  const q = questions[currentIndex];

  return (
    <div>
      <h1>Personalized Setup</h1>
      <p style={{ color: "#555" }}>Just a few clicks to prepare personalized recommendations.</p>
      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 12 }}>{q.text}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => handleAnswer(true)}>Yes</button>
          <button type="button" onClick={() => handleAnswer(false)}>No</button>
          <button type="button" onClick={handleSkip} style={{ marginLeft: 8 }}>Skip</button>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
          Question {currentIndex + 1} / {questions.length}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedOnboarding;


