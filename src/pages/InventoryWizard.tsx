import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Answer = "Yes" | "No" | undefined;

const questions = [
  { id: "hasWill", text: "Do you have a written will?", type: "boolean" as const },
  {
    id: "hasInventory",
    text: "Do you have an inventory of what you want to leave behind?",
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

    if (answers.hasWill === "Yes") {
      tasks.push({ title: "Verify the currency and legal validity of the will", priority: "medium" });
    } else {
      tasks.push({ title: "Create a will", priority: "high" });
    }

    if (answers.hasInventory === "Yes") {
      tasks.push({ title: "Update and save inventory", priority: "medium" });
    } else {
      tasks.push({ title: "Create inventory", priority: "high" });
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
          <p>Generating your personalized action plan...</p>
          <p>Please wait.</p>
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
                  onClick={() => setAnswer(q.id, "Yes")}
                  aria-pressed={answers[q.id] === "Yes"}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setAnswer(q.id, "No")}
                  aria-pressed={answers[q.id] === "No"}
                >
                  No
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      )}
      <div style={{ marginTop: 16 }}>
        {!isGenerating && (
          <button type="button" onClick={handleFinish}>Finish</button>
        )}
      </div>
    </div>
  );
};

export default InventoryWizard;


