import React, { useEffect, useState } from "react";
import { PlaybookService, PlaybookEntry } from "@/services/PlaybookService";

const categories = [
  "Dôležité dokumenty",
  "Kontakty",
  "Heslá a prístupové údaje",
  "Starostlivosť o zvieratá",
  "Želania ohľadom pohrebu",
  "Iné",
];

type FormState = {
  category: string;
  title: string;
  content: string;
};

const initialForm: FormState = { category: categories[0], title: "", content: "" };

const Playbook: React.FC = () => {
  const [entries, setEntries] = useState<PlaybookEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<PlaybookEntry | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);

  useEffect(() => {
    setEntries(PlaybookService.getEntries());
  }, []);

  const handleSave = () => {
    if (!form.title.trim()) return;
    let next: PlaybookEntry[];
    if (editingEntry) {
      next = entries.map((e) =>
        e.id === editingEntry.id ? { ...e, ...form } : e,
      );
    } else {
      const newEntry: PlaybookEntry = {
        id: PlaybookService.generateId(),
        category: form.category,
        title: form.title,
        content: form.content,
      };
      next = [newEntry, ...entries];
    }
    setEntries(next);
    PlaybookService.saveEntries(next);
    setEditingEntry(null);
    setForm(initialForm);
  };

  const handleEdit = (entry: PlaybookEntry) => {
    setEditingEntry(entry);
    setForm({ category: entry.category, title: entry.title, content: entry.content });
  };

  const handleDelete = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    PlaybookService.saveEntries(next);
  };

  const handleReset = () => {
    setEditingEntry(null);
    setForm(initialForm);
  };

  return (
    <div>
      <h1>Guardian's Playbook</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        style={{ display: "grid", gap: 8, maxWidth: 560 }}
      >
        <label>Kategória:</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <label>Titulok:</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <label>Obsah:</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={6}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">{editingEntry ? "Update" : "Add"}</button>
          {editingEntry && (
            <button type="button" onClick={handleReset}>
              Cancel
            </button>
          )}
        </div>
      </form>
      <h2>Záznamy</h2>
      {entries.length === 0 ? (
        <p>Žiadne záznamy v playbooku.</p>
      ) : (
        <ul>
          {entries.map((entry) => (
            <li key={entry.id} style={{ marginBottom: 12 }}>
              <strong>{entry.category}:</strong> {entry.title}
              <br />
              <small>{entry.content}</small>
              <br />
              <button onClick={() => handleEdit(entry)}>Edit</button>
              <button onClick={() => handleDelete(entry.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Playbook;


