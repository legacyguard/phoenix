import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Answer = "Áno" | "Nie" | undefined;

const questions = [
  { id: "hasWill", text: "Máte spísaný závet?", type: "boolean" as const },
  {
    id: "hasInventory",
    text: "Máte vytvorený inventár toho, čo chcete po sebe zanechať?",
    type: "boolean" as const,
  },
];

const InventoryWizard: React.FC = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const setAnswer = (id: string, value: Answer) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleFinish = () => {
    setIsGenerating(true);
    const tasks: { title: string; priority: "high" | "medium" }[] = [];

    if (answers.hasWill === "Áno") {
      tasks.push({ title: "Overiť aktuálnosť a právnu platnosť závetu", priority: "medium" });
    } else {
      tasks.push({ title: "Vytvoriť závet", priority: "high" });
    }

    if (answers.hasInventory === "Áno") {
      tasks.push({ title: "Aktualizovať a uložiť inventár", priority: "medium" });
    } else {
      tasks.push({ title: "Vytvoriť inventár", priority: "high" });
    }

    localStorage.setItem("lifeInventoryAnswers", JSON.stringify(answers));
    localStorage.setItem("lifeInventoryTasks", JSON.stringify(tasks));
  };

  useEffect(() => {
    if (!isGenerating) return;
    const id = setTimeout(() => navigate("/dashboard"), 2000);
    return () => clearTimeout(id);
  }, [isGenerating, navigate]);

  return (
    <div>
      <h1>Life Inventory</h1>
      {isGenerating ? (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <p>Generujeme váš personalizovaný akčný plán...</p>
          <p>Prosím, čakajte.</p>
        </div>
      ) : (
      <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        {questions.map((q) => (
          <div key={q.id}>
            <div style={{ marginBottom: 6 }}>{q.text}</div>
            {q.type === "boolean" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setAnswer(q.id, "Áno")}
                  aria-pressed={answers[q.id] === "Áno"}
                >
                  Áno
                </button>
                <button
                  type="button"
                  onClick={() => setAnswer(q.id, "Nie")}
                  aria-pressed={answers[q.id] === "Nie"}
                >
                  Nie
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      )}
      <div style={{ marginTop: 16 }}>
        {!isGenerating && (
          <button type="button" onClick={handleFinish}>Dokončiť</button>
        )}
      </div>
    </div>
  );
};

export default InventoryWizard;


