import React, { useState } from "react";

type TrustedPerson = {
  id: string;
  name: string;
  relationship: string;
  preparednessScore: number;
  responsibilities: string[];
};

const initialTrustedPeople: TrustedPerson[] = [
  {
    id: "1",
    name: "Alice Johnson",
    relationship: "Executor",
    preparednessScore: 82,
    responsibilities: ["Document access", "Notification handling"],
  },
  {
    id: "2",
    name: "Bob Smith",
    relationship: "Secondary Contact",
    preparednessScore: 58,
    responsibilities: ["Emergency contact"],
  },
  {
    id: "3",
    name: "Carol Davis",
    relationship: "Advisor",
    preparednessScore: 34,
    responsibilities: ["Financial guidance", "Review"],
  },
];

const getScoreColor = (score: number): string => {
  if (score >= 70) return "green";
  if (score >= 40) return "goldenrod";
  return "crimson";
};

const TrustedCircle: React.FC = () => {
  const [people, setPeople] = useState<TrustedPerson[]>(initialTrustedPeople);
  const [newName, setNewName] = useState("");
  const [newRelationship, setNewRelationship] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRelationship.trim()) return;
    const person: TrustedPerson = {
      id: String(Date.now()),
      name: newName.trim(),
      relationship: newRelationship.trim(),
      preparednessScore: 50,
      responsibilities: [],
    };
    setPeople((prev) => [person, ...prev]);
    setNewName("");
    setNewRelationship("");
  };

  return (
    <div>
      <h1>Trusted Circle</h1>
      <form onSubmit={handleAdd} style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          type="text"
          placeholder="Relationship"
          value={newRelationship}
          onChange={(e) => setNewRelationship(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {people.map((p) => (
          <li key={p.id} style={{ marginBottom: 12 }}>
            <div>
              <strong>{p.name}</strong> – {p.relationship}
            </div>
            <div>
              Responsibilities: {p.responsibilities.length}
            </div>
            <div>
              Preparedness: <span style={{ color: getScoreColor(p.preparednessScore) }}>{p.preparednessScore}%</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrustedCircle;


