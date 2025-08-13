import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type AnswerMap = Record<string, boolean>;

const questions = [
  { id: "ownsProperty", text: "Vlastníte nehnuteľnosť?", type: "boolean" as const },
  { id: "hasDependents", text: "Máte deti alebo iných závislých?", type: "boolean" as const },
  { id: "hasBusiness", text: "Prevádzkujete podnikanie alebo živnosť?", type: "boolean" as const },
];

const PersonalizedOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});

  const finishOnboarding = (skip: boolean = false) => {
    const newTasks: { title: string; priority: "high" | "medium" }[] = [];
    if (!skip) {
      if (answers.ownsProperty) {
        newTasks.push({ title: "Zaobstarať poistenie nehnuteľnosti", priority: "medium" });
      }
      if (answers.hasDependents) {
        newTasks.push({ title: "Priradiť opatrovníka pre deti", priority: "high" });
      }
      if (answers.hasBusiness) {
        newTasks.push({ title: "Vytvoriť plán kontinuity podnikania", priority: "medium" });
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
      <p style={{ color: "#555" }}>Len pár klikov – pripravíme odporúčania na mieru.</p>
      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 12 }}>{q.text}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => handleAnswer(true)}>Áno</button>
          <button type="button" onClick={() => handleAnswer(false)}>Nie</button>
          <button type="button" onClick={handleSkip} style={{ marginLeft: 8 }}>Preskočiť</button>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
          Otázka {currentIndex + 1} / {questions.length}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedOnboarding;


