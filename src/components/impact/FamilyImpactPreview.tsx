import React from "react";

interface UserAction {
  id: string;
  type: "asset" | "will" | "trustedCircle" | "medical" | "financial";
  description: string;
  documented: boolean;
}

interface ImpactScenario {
  id: string;
  category: string;
  currentBenefit: string;
  timeAndStressSaved?: string;
  realWorldScenario?: string;
}

interface UserDocumentation {
  financialAccounts: boolean;
  willCreated: boolean;
  trustedCircle: boolean;
  medicalPreferences: boolean;
  childCareArrangements: boolean;
  assetDistribution: boolean;
}

const generateImpactScenarios = (
  userActions: UserAction[],
): ImpactScenario[] => {
  const scenarios: ImpactScenario[] = [];

  // Generate scenarios based on what's actually documented
  userActions.forEach((action) => {
    if (action.documented) {
      switch (action.type) {
        case "asset":
          scenarios.push({
            id: `asset-${action.id}`,
            category: "Asset Organization",
            currentBenefit:
              "Your family can find your bank account information in 5 minutes instead of searching for weeks",
            timeAndStressSaved:
              "This saves your family approximately 40 hours of searching and calling",
            realWorldScenario:
              "When your family needs to pay bills, they'll know which account to use",
          });
          break;
        case "will":
          scenarios.push({
            id: `will-${action.id}`,
            category: "Will Documentation",
            currentBenefit:
              "Your family knows exactly what you decided - no guessing or arguments",
            timeAndStressSaved:
              "This prevents costly legal disputes and family conflicts",
            realWorldScenario:
              "Your wishes are documented and legally clear to everyone",
          });
          break;
        case "trustedCircle":
          scenarios.push({
            id: `trusted-${action.id}`,
            category: "Support Network",
            currentBenefit:
              "Your family has specific people to call who know how to help",
            timeAndStressSaved:
              "This eliminates the stress of making decisions alone during difficult times",
            realWorldScenario:
              "When your family needs legal help, they'll know which attorney to call",
          });
          break;
      }
    }
  });

  return scenarios;
};

const ImpactScenario: React.FC<{ scenario: ImpactScenario }> = ({
  scenario,
}) => (
  <div className="impact-scenario-card">
    <h4 className="scenario-category">{scenario.category}</h4>
    <p className="current-benefit">{scenario.currentBenefit}</p>
    {scenario.timeAndStressSaved && (
      <p className="time-saved">{scenario.timeAndStressSaved}</p>
    )}
    {scenario.realWorldScenario && (
      <p className="real-world-example">{scenario.realWorldScenario}</p>
    )}
  </div>
);

const FamilyImpactPreview: React.FC<{ userActions: UserAction[] }> = ({
  userActions,
}) => {
  const impactScenarios = generateImpactScenarios(userActions);
  const documentedActions = userActions.filter((action) => action.documented);
  const undocumentedActions = userActions.filter(
    (action) => !action.documented,
  );

  return (
    <div className="family-impact-preview">
      <h3>How Your Documentation Helps Your Family</h3>

      {/* Show specific benefits for documented items */}
      {documentedActions.length > 0 && (
        <div className="documented-benefits">
          <h4>What Your Family Now Has Access To:</h4>
          <div className="impact-scenarios">
            {impactScenarios.map((scenario) => (
              <ImpactScenario key={scenario.id} scenario={scenario} data-testid="familyimpactpreview-impactscenario" />
            ))}
          </div>
        </div>
      )}

      {/* Show potential benefits for not-yet-documented items */}
      {undocumentedActions.length > 0 && (
        <div className="potential-benefits">
          <h4>Additional Protection You Could Provide:</h4>
          <div className="undocumented-impacts">
            {undocumentedActions.map((action) => (
              <div key={action.id} className="potential-impact">
                <p>
                  By documenting {action.description}, your family would benefit
                  from:
                </p>
                {getSpecificBenefitForAction(action)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-world comparison without progress metrics */}
      <div className="documentation-comparison">
        <h4>The Difference Your Documentation Makes</h4>
        <div className="comparison-grid">
          <div className="without-documentation">
            <h5>Without Your Documentation:</h5>
            <ul>
              <li>
                Your family searches through papers and calls multiple
                institutions
              </li>
              <li>Important deadlines might be missed</li>
              <li>Family members may disagree about your wishes</li>
              <li>
                Expensive professionals may need to be hired to find information
              </li>
            </ul>
          </div>
          <div className="with-documentation">
            <h5>With Your Current Documentation:</h5>
            <ul>
              {documentedActions.length > 0 ? (
                <>
                  <li>
                    Your family has immediate access to documented information
                  </li>
                  <li>Clear instructions are available for documented areas</li>
                  <li>Your documented wishes are clear to everyone</li>
                  <li>Documented contacts are available when needed</li>
                </>
              ) : (
                <li>
                  Start documenting to provide these benefits to your family
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get specific benefits for undocumented actions
const getSpecificBenefitForAction = (action: UserAction): JSX.Element => {
  switch (action.type) {
    case "financial":
      return (
        <ul>
          <li>Quick access to account information during emergencies</li>
          <li>Ability to pay bills and manage finances immediately</li>
          <li>No need to search through paperwork or contact multiple banks</li>
        </ul>
      );
    case "medical":
      return (
        <ul>
          <li>Your medical preferences would be known and respected</li>
          <li>Healthcare providers would have clear guidance</li>
          <li>
            Family members wouldn't have to guess during medical emergencies
          </li>
        </ul>
      );
    case "trustedCircle":
      return (
        <ul>
          <li>A ready support network during difficult times</li>
          <li>Specific people to handle specific responsibilities</li>
          <li>Reduced burden on any single family member</li>
        </ul>
      );
    default:
      return <p>Clear guidance and reduced stress for your family</p>;
  }
};

export default FamilyImpactPreview;
