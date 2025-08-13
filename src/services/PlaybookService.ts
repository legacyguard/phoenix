export type PlaybookEntry = {
  id: string;
  category: string;
  title: string;
  content: string;
};

const STORAGE_KEY = "playbookEntries";

function getEntries(): PlaybookEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PlaybookEntry[]) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: PlaybookEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function generateId(): string {
  return Date.now().toString();
}

export const PlaybookService = {
  getEntries,
  saveEntries,
  generateId,
};


