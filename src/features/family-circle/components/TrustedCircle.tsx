import React from "react";
import { API_URLS } from "@/utils/constants";

// Define a single responsibility for a trusted person
import { useTranslation } from "react-i18next";
interface Responsibility {
  id: string;
  // This is the key change: human-readable description
  description: string; // e.g., "Will care for our children if something happens to us."
  // Link to the scenario where this is relevant
  relevantScenario: "hospitalized" | "incapacitated" | "sudden_passing";
  // Link to the assets this responsibility pertains to
  relatedAssetIds?: string[];
  // What type of responsibility is this?
  type: "financial" | "caregiving" | "legal" | "inheritance";
}

// Define the structure for a single trusted person
interface TrustedPerson {
  id: string;
  name: string;
  relationship: string; // e.g., "Spouse", "Brother", "Best Friend"
  avatarUrl?: string;
  // A person can have multiple responsibilities
  responsibilities: Responsibility[];
  // This score measures how informed and ready the person is
  preparednessScore: number; // 0-100
}

export const TrustedCircle: React.FC = () => {
  const { t } = useTranslation("family-core");

  // Mock data representing the new unified structure
  const trustedPeople: TrustedPerson[] = [
    {
      id: "tp1",
      name: t("trustedCircle.mockData.sarah.name"),
      relationship: t("trustedCircle.mockData.sarah.relationship"),
      avatarUrl: undefined,
      responsibilities: [
        {
          id: "r1",
          description: t(
            "trustedCircle.mockData.sarah.responsibilities.bankAccess",
          ),
          relevantScenario: "hospitalized",
          relatedAssetIds: ["p3", "p4"],
          type: "financial",
        },
        {
          id: "r2",
          description: t(
            "trustedCircle.mockData.sarah.responsibilities.inheritAssets",
          ),
          relevantScenario: "sudden_passing",
          relatedAssetIds: ["p1", "p2", "p3", "p4"],
          type: "inheritance",
        },
        {
          id: "r3",
          description: t(
            "trustedCircle.mockData.sarah.responsibilities.medicalPower",
          ),
          relevantScenario: "incapacitated",
          type: "legal",
        },
      ],

      preparednessScore: 85,
    },
    {
      id: "tp2",
      name: t("trustedCircle.mockData.michael.name"),
      relationship: t("trustedCircle.mockData.michael.relationship"),
      avatarUrl: undefined,
      responsibilities: [
        {
          id: "r4",
          description: t(
            "trustedCircle.mockData.michael.responsibilities.childCare",
          ),
          relevantScenario: "sudden_passing",
          type: "caregiving",
        },
        {
          id: "r5",
          description: t(
            "trustedCircle.mockData.michael.responsibilities.estateExecution",
          ),
          relevantScenario: "sudden_passing",
          type: "legal",
        },
        {
          id: "r6",
          description: t(
            "trustedCircle.mockData.michael.responsibilities.businessManagement",
          ),
          relevantScenario: "incapacitated",
          relatedAssetIds: ["p5"],
          type: "financial",
        },
      ],

      preparednessScore: 40,
    },
    {
      id: "tp3",
      name: t("trustedCircle.mockData.robert.name"),
      relationship: t("trustedCircle.mockData.robert.relationship"),
      avatarUrl: undefined,
      responsibilities: [
        {
          id: "r7",
          description: t(
            "trustedCircle.mockData.robert.responsibilities.businessAuthority",
          ),
          relevantScenario: "hospitalized",
          relatedAssetIds: ["p5"],
          type: "financial",
        },
        {
          id: "r8",
          description: t(
            "trustedCircle.mockData.robert.responsibilities.buySellAgreement",
          ),
          relevantScenario: "sudden_passing",
          relatedAssetIds: ["p5"],
          type: "financial",
        },
      ],

      preparednessScore: 75,
    },
    {
      id: "tp4",
      name: t("trustedCircle.mockData.emily.name"),
      relationship: t("trustedCircle.mockData.emily.relationship"),
      avatarUrl: undefined,
      responsibilities: [
        {
          id: "r9",
          description: t(
            "trustedCircle.mockData.emily.responsibilities.backupGuardian",
          ),
          relevantScenario: "sudden_passing",
          type: "caregiving",
        },
      ],

      preparednessScore: 20,
    },
  ];

  // Helper function to get preparedness color
  const getPreparednessColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  // Helper function to get preparedness status
  const getPreparednessStatus = (score: number) => {
    if (score >= 70) return t("trustedCircle.preparednessStatus.wellPrepared");
    if (score >= 40)
      return t("trustedCircle.preparednessStatus.partiallyPrepared");
    return t("trustedCircle.preparednessStatus.needsAttention");
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg font-sans">
      <h1 className="text-3xl font-bold text-gray-800">
        {t("trustedCircle.title")}
      </h1>
      <p className="text-lg text-gray-600 mt-1">
        {t("trustedCircle.subtitle")}
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {trustedPeople.map((person) => (
          <div
            key={person.id}
            className="bg-white rounded-lg shadow-sm border p-4"
          >
            <div className="flex items-center">
              {/* Avatar and Name */}
              <img
                src={person.avatarUrl || API_URLS.placeholder}
                alt={person.name}
                className="h-12 w-12 rounded-full"
              />
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {person.name}
                </h3>
                <p className="text-sm text-gray-500">{person.relationship}</p>
              </div>
              {/* Preparedness Score */}
              <div className="ml-auto text-center">
                <div className="relative w-16 h-16">
                  {/* Background circle */}
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#e5e7eb"
                      strokeWidth="4"
                      fill="none"
                    />

                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke={
                        person.preparednessScore >= 70
                          ? "#10b981"
                          : person.preparednessScore >= 40
                            ? "#f59e0b"
                            : "#ef4444"
                      }
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - person.preparednessScore / 100)}`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className={`text-sm font-bold ${getPreparednessColor(person.preparednessScore)}`}
                    >
                      {person.preparednessScore}%
                    </span>
                  </div>
                </div>
                <p
                  className={`text-xs mt-1 font-medium ${getPreparednessColor(person.preparednessScore)}`}
                >
                  {getPreparednessStatus(person.preparednessScore)}
                </p>
              </div>
            </div>

            {/* Responsibilities */}
            <div className="mt-4">
              <h4 className="font-semibold text-sm text-gray-700">
                {t("trustedCircle.responsibilities")}
              </h4>
              <ul className="mt-2 space-y-2 list-disc list-inside">
                {person.responsibilities.map((resp) => (
                  <li key={resp.id} className="text-sm text-gray-800">
                    {resp.description}
                  </li>
                ))}
              </ul>
            </div>

            {/* Preparedness Checklist */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {t("trustedCircle.preparationStatus")}
              </p>
              <div className="space-y-1">
                <div className="flex items-center text-xs">
                  <span
                    className={
                      person.preparednessScore >= 20
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                  >
                    {person.preparednessScore >= 20 ? "✓" : "○"}
                  </span>
                  <span className="ml-2 text-gray-700">
                    {t("trustedCircle.informedOfRole")}
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <span
                    className={
                      person.preparednessScore >= 40
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                  >
                    {person.preparednessScore >= 40 ? "✓" : "○"}
                  </span>
                  <span className="ml-2 text-gray-700">
                    {t("trustedCircle.acceptedResponsibility")}
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <span
                    className={
                      person.preparednessScore >= 70
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                  >
                    {person.preparednessScore >= 70 ? "✓" : "○"}
                  </span>
                  <span className="ml-2 text-gray-700">
                    {t("trustedCircle.hasAccessToDocuments")}
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <span
                    className={
                      person.preparednessScore >= 85
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                  >
                    {person.preparednessScore >= 85 ? "✓" : "○"}
                  </span>
                  <span className="ml-2 text-gray-700">
                    {t("trustedCircle.reviewedEmergencyProcedures")}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4">
              <button
                className={`w-full px-4 py-2 text-sm font-semibold rounded transition-colors ${
                  person.preparednessScore >= 70
                    ? "text-green-700 bg-green-50 border border-green-200 hover:bg-green-100"
                    : "text-white bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {person.preparednessScore >= 70
                  ? t("trustedCircle.buttonText.prepared", {
                      name: person.name.split(" ")[0],
                    })
                  : t("trustedCircle.buttonText.prepareNow", {
                      name: person.name.split(" ")[0],
                    })}
              </button>
            </div>
          </div>
        ))}
        {/* Add New Person Button */}
        <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg">
          <button className="text-blue-600 font-semibold">
            {t("trustedCircle.addTrustedPerson")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrustedCircle;
