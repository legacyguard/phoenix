import type { CategorizedTask } from "@/utils/taskCategories";

export const NudgeService = {
  getNudgeMessage(
    tasks: CategorizedTask[],
    taskStatus: Record<string, boolean>,
  ): string | null {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => taskStatus[t.title]).length;
    const highPriorityIncomplete = tasks.filter(
      (t) => t.priority === "high" && !taskStatus[t.title],
    );
    if (highPriorityIncomplete.length > 0) {
      const list = highPriorityIncomplete.map((t) => `"${t.title}"`).join(", ");
      return `Máte ešte dôležité úlohy: ${list}. Odporúčame im venovať pozornosť.`;
    }
    if (totalTasks === 0) {
      return null;
    }
    if (completedTasks === totalTasks) {
      return "Skvelá práca! Všetky úlohy z inventára sú splnené. Môžete byť pokojní.";
    }
    const remaining = totalTasks - completedTasks;
    return `Už ste prešli kus cesty! Zostávajú vám ešte ${remaining} úlohy.`;
  },
};


