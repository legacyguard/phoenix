import { LifeAnswers } from "./BasicLifeQuestions";
import { ProjectOrderAnswers } from "./OnboardingWizard";

/**
 * Maps life-centered answers to technical onboarding answers
 * This allows the new emotional questions to work with existing technical infrastructure
 */
export function mapLifeAnswersToProjectOrder(
  lifeAnswers: LifeAnswers,
): ProjectOrderAnswers {
  const mapping: ProjectOrderAnswers = {
    documentAccess: "no",
    caretaker: "not_thought",
    familyClarity: "never_discussed",
    biggestWorry: "financial",
  };

  // Map preparedness level to document access
  switch (lifeAnswers.preparednessLevel) {
    case "fully_organized":
      mapping.documentAccess = "yes";
      break;
    case "know_but_scattered":
      mapping.documentAccess = "partially";
      break;
    case "need_time":
    case "not_sure":
      mapping.documentAccess = "no";
      break;
  }

  // Map family dependency to caretaker designation
  switch (lifeAnswers.familyDependency) {
    case "spouse_children":
    case "family_turns_to_me":
      mapping.caretaker = "designated";
      break;
    case "handle_decisions":
      mapping.caretaker = "family_figure_out";
      break;
    case "family_would_struggle":
      mapping.caretaker = "not_thought";
      break;
  }

  // Map family vulnerability to family clarity
  switch (lifeAnswers.familyVulnerability) {
    case "documents_passwords":
      mapping.familyClarity = "somewhat";
      break;
    case "contacts_actions":
    case "financial_situation":
    case "decisions_i_handle":
      mapping.familyClarity = "never_discussed";
      break;
  }

  // Map primary responsibility to biggest worry
  switch (lifeAnswers.primaryResponsibility) {
    case "family_security":
    case "financial_affairs":
      mapping.biggestWorry = "financial";
      break;
    case "aging_parents":
      mapping.biggestWorry = "memories";
      break;
    case "business_family":
      mapping.biggestWorry = "legal";
      break;
  }

  // Additional intelligent mapping based on vulnerability
  if (lifeAnswers.familyVulnerability === "decisions_i_handle") {
    mapping.biggestWorry = "conflicts";
  }

  return mapping;
}

/**
 * Maps technical answers back to life answers for editing
 * This is used when users want to modify their answers
 */
export function mapProjectOrderToLifeAnswers(
  projectAnswers: ProjectOrderAnswers,
): Partial<LifeAnswers> {
  const mapping: Partial<LifeAnswers> = {};

  // Map document access to preparedness level
  switch (projectAnswers.documentAccess) {
    case "yes":
      mapping.preparednessLevel = "fully_organized";
      break;
    case "partially":
      mapping.preparednessLevel = "know_but_scattered";
      break;
    case "no":
      mapping.preparednessLevel = "not_sure";
      break;
  }

  // Map caretaker to family dependency
  switch (projectAnswers.caretaker) {
    case "designated":
      mapping.familyDependency = "spouse_children";
      break;
    case "family_figure_out":
      mapping.familyDependency = "handle_decisions";
      break;
    case "not_thought":
      mapping.familyDependency = "family_would_struggle";
      break;
  }

  // Map family clarity to vulnerability
  switch (projectAnswers.familyClarity) {
    case "yes_clear":
      mapping.familyVulnerability = "documents_passwords";
      break;
    case "somewhat":
      mapping.familyVulnerability = "contacts_actions";
      break;
    case "never_discussed":
      mapping.familyVulnerability = "financial_situation";
      break;
  }

  // Map biggest worry to primary responsibility
  switch (projectAnswers.biggestWorry) {
    case "financial":
      mapping.primaryResponsibility = "family_security";
      break;
    case "legal":
      mapping.primaryResponsibility = "business_family";
      break;
    case "memories":
      mapping.primaryResponsibility = "aging_parents";
      break;
    case "conflicts":
      mapping.primaryResponsibility = "financial_affairs";
      break;
  }

  return mapping;
}
