export type Task = { title: string; priority: "high" | "medium" };

export interface CategorizedTask extends Task {
  category: "zavet" | "inventar";
}

export function categorizeTasks(tasks: Task[]): CategorizedTask[] {
  return tasks.map((task) => {
    const title = task.title.toLowerCase();
    let category: "zavet" | "inventar" = "inventar";
    if (title.includes("závet") || title.includes("zavet")) {
      category = "zavet";
    }
    return { ...task, category };
  });
}

export function computeCategoryProgress(
  tasks: CategorizedTask[],
  taskStatus: Record<string, boolean>,
) {
  const categories: Array<CategorizedTask["category"]> = [
    "zavet",
    "inventar",
  ];

  const result: Record<
    CategorizedTask["category"],
    { total: number; completed: number; percent: number }
  > = {
    zavet: { total: 0, completed: 0, percent: 0 },
    inventar: { total: 0, completed: 0, percent: 0 },
  };

  categories.forEach((cat) => {
    const inCat = tasks.filter((t) => t.category === cat);
    const total = inCat.length;
    const completed = inCat.reduce(
      (acc, t) => acc + (taskStatus[t.title] ? 1 : 0),
      0,
    );
    const percent = total > 0 ? (completed / total) * 100 : 0;
    result[cat] = { total, completed, percent };
  });

  return result;
}

export function computeCategoryStats(
  categorizedTasks: CategorizedTask[],
  taskStatus: Record<string, boolean>,
) {
  return categorizedTasks.reduce(
    (acc, task) => {
      const { category } = task;
      acc[category] = acc[category] || { total: 0, completed: 0 };
      acc[category].total += 1;
      if (taskStatus[task.title]) acc[category].completed += 1;
      return acc;
    },
    {} as Record<string, { total: number; completed: number }>,
  );
}


