import React, { useState } from "react";
import type { useTranslation } from "react-i18next";

interface CrisisScenario {
  id: string;
  title: string;
  description: string;
  familyImpact: string;
  preventionSteps: PreventionStep[];
  urgencyLevel: "critical" | "important" | "recommended";
  affectedFamilyMembers: string[];
}

interface PreventionStep {
  id: string;
  crisisScenario: string;
  actionRequired: string;
  timeEstimate: number;
  privacyLevel: "local_only" | "encrypted_cloud" | "family_shared";
  familyBenefit: string;
  preventionStatus: "vulnerable" | "partially_protected" | "fully_protected";
}

const crisisScenarios: CrisisScenario[] = [
  {
    id: "1",
    title: "Family Cannot Access Critical Information",
    description:
      "Without proper documentation, your family will struggle to access essential accounts and services during an already difficult time.",
    familyImpact: "Critical - Immediate financial and legal complications",
    preventionSteps: [
      {
        id: "1-1",
        crisisScenario: "Your spouse cannot access bank accounts to pay bills",
        actionRequired: "Document primary bank account information",
        timeEstimate: 3,
        privacyLevel: "local_only",
        familyBenefit:
          "Your spouse will have immediate access to pay household expenses",
        preventionStatus: "vulnerable",
      },
      {
        id: "1-2",
        crisisScenario:
          "Your children cannot find insurance policies when needed",
        actionRequired: "Record all insurance policy details",
        timeEstimate: 5,
        privacyLevel: "local_only",
        familyBenefit:
          "Your family can quickly file claims and access benefits",
        preventionStatus: "vulnerable",
      },
      {
        id: "1-3",
        crisisScenario:
          "Your family doesn't know who to contact for legal matters",
        actionRequired: "List attorney and legal advisor contacts",
        timeEstimate: 2,
        privacyLevel: "local_only",
        familyBenefit:
          "Your family will have immediate access to legal guidance",
        preventionStatus: "vulnerable",
      },
      {
        id: "1-4",
        crisisScenario: "Important passwords are lost and accounts are locked",
        actionRequired: "Secure critical account credentials",
        timeEstimate: 4,
        privacyLevel: "local_only",
        familyBenefit: "Your family can access digital accounts and services",
        preventionStatus: "vulnerable",
      },
    ],

    urgencyLevel: "critical",
    affectedFamilyMembers: ["Spouse", "Children", "Executor"],
  },
  {
    id: "2",
    title: "Family Faces Legal and Financial Chaos",
    description:
      "Missing documents and unclear financial situations can lead to months of legal complications and financial stress.",
    familyImpact: "Severe - Extended legal battles and financial uncertainty",
    preventionSteps: [
      {
        id: "2-1",
        crisisScenario:
          "Your family doesn't understand your financial situation",
        actionRequired: "Create a financial overview document",
        timeEstimate: 10,
        privacyLevel: "encrypted_cloud",
        familyBenefit:
          "Your family will have a clear picture of assets and obligations",
        preventionStatus: "vulnerable",
      },
      {
        id: "2-2",
        crisisScenario: "Legal documents are missing or cannot be found",
        actionRequired: "Store and organize all legal documents",
        timeEstimate: 15,
        privacyLevel: "encrypted_cloud",
        familyBenefit:
          "Your family can quickly access wills, trusts, and legal papers",
        preventionStatus: "vulnerable",
      },
      {
        id: "2-3",
        crisisScenario:
          "Your business operations halt because no one has access",
        actionRequired: "Document business continuity information",
        timeEstimate: 20,
        privacyLevel: "encrypted_cloud",
        familyBenefit:
          "Your business can continue operating without interruption",
        preventionStatus: "vulnerable",
      },
    ],

    urgencyLevel: "critical",
    affectedFamilyMembers: ["Spouse", "Business Partners", "Employees"],
  },
  {
    id: "3",
    title: "Family Makes Wrong Decisions Due to Lack of Information",
    description:
      "Without clear guidance, your family may make decisions that go against your wishes or harm their interests.",
    familyImpact: "Long-term - Irreversible decisions and family conflicts",
    preventionSteps: [
      {
        id: "3-1",
        crisisScenario: "Your family doesn't know your medical preferences",
        actionRequired: "Document healthcare directives",
        timeEstimate: 10,
        privacyLevel: "family_shared",
        familyBenefit:
          "Your family can make medical decisions aligned with your wishes",
        preventionStatus: "vulnerable",
      },
      {
        id: "3-2",
        crisisScenario:
          "Your children don't understand your wishes for their future",
        actionRequired: "Write guidance letters for children",
        timeEstimate: 30,
        privacyLevel: "family_shared",
        familyBenefit:
          "Your children will have your wisdom and guidance when needed",
        preventionStatus: "vulnerable",
      },
      {
        id: "3-3",
        crisisScenario: "Family conflicts arise due to unclear intentions",
        actionRequired: "Document inheritance decisions clearly",
        timeEstimate: 15,
        privacyLevel: "encrypted_cloud",
        familyBenefit: "Your family will understand and respect your decisions",
        preventionStatus: "vulnerable",
      },
    ],

    urgencyLevel: "important",
    affectedFamilyMembers: ["Spouse", "Children", "Extended Family"],
  },
];

const FamilyCrisisPrevention: React.FC = () => {
  const [scenarios, setScenarios] = useState(crisisScenarios);

  const handleCrisisPrevention = (stepId: string) => {
    setScenarios((prevScenarios) =>
      prevScenarios.map((scenario) => ({
        ...scenario,
        preventionSteps: scenario.preventionSteps.map((step) =>
          step.id === stepId
            ? { ...step, preventionStatus: "fully_protected" }
            : step,
        ),
      })),
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vulnerable":
        return "#DC2626";
      case "partially_protected":
        return "#D97706";
      case "fully_protected":
        return "#059669";
      default:
        return "#6B7280";
    }
  };

  const getUrgencyBadgeStyle = (urgency: string) => {
    const baseStyle = {
      padding: "4px 12px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
    };

    switch (urgency) {
      case "critical":
        return { ...baseStyle, backgroundColor: "#FEE2E2", color: "#991B1B" };
      case "important":
        return { ...baseStyle, backgroundColor: "#FEF3C7", color: "#92400E" };
      default:
        return { ...baseStyle, backgroundColor: "#E5E7EB", color: "#374151" };
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#F9FAFB",
        padding: "32px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "#111827",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          {t("familyCrisisPrevention.family_crisis_prevention_1")}
        </h1>
        <p style={{ fontSize: "18px", color: "#6B7280" }}>
          {t("familyCrisisPrevention.protect_your_family_from_chaos_2")}
        </p>
      </div>

      {scenarios.map((scenario) => {
        const protectedSteps = scenario.preventionSteps.filter(
          (step) => step.preventionStatus === "fully_protected",
        ).length;
        const totalSteps = scenario.preventionSteps.length;
        const allProtected = protectedSteps === totalSteps;

        return (
          <div
            key={scenario.id}
            style={{
              backgroundColor: "#FFFFFF",
              border: allProtected ? "2px solid #059669" : "2px solid #E5E7EB",
              borderRadius: "8px",
              marginBottom: "24px",
              overflow: "hidden",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ padding: "24px", borderBottom: "1px solid #E5E7EB" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  {scenario.title}
                </h2>
                <span style={getUrgencyBadgeStyle(scenario.urgencyLevel)}>
                  {scenario.urgencyLevel}
                </span>
              </div>
              <p
                style={{
                  color: "#4B5563",
                  marginBottom: "16px",
                  lineHeight: "1.6",
                }}
              >
                {scenario.description}
              </p>
              <div style={{ display: "flex", gap: "24px", fontSize: "14px" }}>
                <div>
                  <span style={{ color: "#6B7280" }}>
                    {t("familyCrisisPrevention.impact_3")}
                  </span>
                  <span style={{ color: "#DC2626", fontWeight: "600" }}>
                    {scenario.familyImpact}
                  </span>
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>
                    {t("familyCrisisPrevention.affects_4")}
                  </span>
                  <span style={{ color: "#111827", fontWeight: "600" }}>
                    {scenario.affectedFamilyMembers.join(", ")}
                  </span>
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>
                    {t("familyCrisisPrevention.protection_status_5")}
                  </span>
                  <span
                    style={{
                      color: allProtected ? "#059669" : "#DC2626",
                      fontWeight: "600",
                    }}
                  >
                    {protectedSteps}/{totalSteps}
                    {t("familyCrisisPrevention.steps_completed_6")}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ padding: "16px 24px", backgroundColor: "#F9FAFB" }}>
              {scenario.preventionSteps.map((step) => (
                <div
                  key={step.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    padding: "20px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#DC2626",
                          marginBottom: "8px",
                        }}
                      >
                        {t("familyCrisisPrevention.crisis_7")}
                        {step.crisisScenario}
                      </h3>
                      <div style={{ marginBottom: "12px" }}>
                        <p
                          style={{
                            color: "#111827",
                            fontWeight: "500",
                            marginBottom: "4px",
                          }}
                        >
                          {t("familyCrisisPrevention.prevention_step_8")}
                          {step.actionRequired}
                        </p>
                        <p style={{ color: "#059669", fontSize: "14px" }}>
                          <strong>
                            {t("familyCrisisPrevention.family_benefit_9")}
                          </strong>{" "}
                          {step.familyBenefit}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          fontSize: "14px",
                          color: "#6B7280",
                        }}
                      >
                        <span>⏱️ {step.timeEstimate} minutes</span>
                        <span>
                          {t("familyCrisisPrevention.privacy_10")}
                          {step.privacyLevel.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginLeft: "24px" }}>
                      {step.preventionStatus === "vulnerable" ? (
                        <button
                          onClick={() => handleCrisisPrevention(step.id)}
                          style={{
                            backgroundColor: "#DC2626",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "6px",
                            padding: "10px 20px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#B91C1C")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#DC2626")
                          }
                        >
                          {t("familyCrisisPrevention.prevent_this_crisis_11")}
                        </button>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "#059669",
                            fontWeight: "600",
                            fontSize: "14px",
                          }}
                        >
                          <span style={{ fontSize: "20px" }}>✓</span>
                          {t("familyCrisisPrevention.crisis_prevented_12")}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: "12px",
                      paddingTop: "12px",
                      borderTop: "1px solid #E5E7EB",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: getStatusColor(step.preventionStatus),
                      }}
                    >
                      {t("familyCrisisPrevention.status_13")}
                      {step.preventionStatus === "vulnerable"
                        ? "Your family is vulnerable to this crisis"
                        : "Your family is protected from this crisis"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FamilyCrisisPrevention;
