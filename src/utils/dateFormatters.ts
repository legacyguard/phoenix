import formatDistanceToNow from "date-fns/formatDistanceToNow";

// Helper function that might be used elsewhere
export const formatLastContacted = (date: string | null): string => {
  if (!date) return "";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
};
