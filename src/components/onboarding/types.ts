export interface ProjectOrderAnswers {
  documentAccess: "yes" | "no" | "partially";
  caretaker: "designated" | "family_figure_out" | "not_thought";
  familyClarity: "yes_clear" | "somewhat" | "never_discussed";
  biggestWorry: "financial" | "legal" | "memories" | "conflicts";
  // Store original life answers for enhanced personalization
  lifeAnswers?: import("./BasicLifeQuestions").LifeAnswers;
}
