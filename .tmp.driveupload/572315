import React from 'react';
import { analytics } from '@/services/analytics';
import { useGrowthBook } from '@growthbook/growthbook-react';

// Define the new structure for a possession, focusing on its meaning
interface Possession {
  id: string;
  name: string; // e.g., "Main Family Home", "Acme Inc. Woodworking Business"
  description: string; // User-defined emotional context, e.g., "Where we raised our kids."
  familyImpact: string; // A clear statement of why this matters, e.g., "Provides a stable home for the family."
  // This 'lifeArea' property is the key for the new grouping
  lifeArea: 'home' | 'savings' | 'business' | 'valuables';
  // Link to related documents (e.g., deed, insurance policy)
  relatedDocumentIds: string[];
}

// Define the structure for each meaningful group
interface PossessionArea {
  id: 'home' | 'savings' | 'business' | 'valuables';
  title: string; // e.g., "Your Home & Property"
  description: string; // e.g., "The places and things that provide shelter and security."
  icon: React.ReactNode;
  possessions: Possession[];
}

const MyPossessions: React.FC = () => {
  const { t } = useTranslation();
  const gb = useGrowthBook();

  // Track goal conversion when a possession is added
  const handleAddPossession = (areaId: string) => {
    // Track the conversion goal for the A/B test
    analytics.track('possession_added', {
      area_id: areaId,
      experiment_variation: gb.getFeatureValue('dashboard-title-experiment', 'control'),
      timestamp: new Date().toISOString()
    });

    // Also track it as a conversion in GrowthBook
    gb.trackConversion('possession_added', {
      areaId
    });

    // TODO: Implement actual add possession logic
    console.log(`Adding possession to ${areaId}`);
  };

  // Mock data representing the new structure. This will come from a central store.
  const possessionAreas: PossessionArea[] = [
  {
    id: 'home',
    title: t("myPossessions.areas.home.title"),
    description: t("myPossessions.areas.home.description"),
    icon: <HomeIcon />,
    possessions: [
    {
      id: 'p1',
      name: "123 Oak Street - Family Home",
      description: "Where we raised our three children and built 20 years of memories.",
      familyImpact: "Ensures your family has a stable home without mortgage stress. Worth $450,000, fully paid off.",
      lifeArea: 'home',
      relatedDocumentIds: ['doc1', 'doc2']
    },
    {
      id: 'p2',
      name: t("myPossessions.mockData.lakeCabin"),
      description: "Our weekend retreat where the grandkids love to fish.",
      familyImpact: "Provides a place for family gatherings and can generate rental income if needed.",
      lifeArea: 'home',
      relatedDocumentIds: ['doc5']
    }]

  },
  {
    id: 'savings',
    title: t("myPossessions.areas.savings.title"),
    description: t("myPossessions.areas.savings.description"),
    icon: <SavingsIcon />,
    possessions: [
    {
      id: 'p3',
      name: "401(k) Retirement Account",
      description: "35 years of disciplined saving.",
      familyImpact: "Provides $2,500/month income for your spouse after you're gone. Currently valued at $850,000.",
      lifeArea: 'savings',
      relatedDocumentIds: ['doc3']
    },
    {
      id: 'p4',
      name: t("myPossessions.mockData.emergencyFund"),
      description: "Our safety net for tough times.",
      familyImpact: "6 months of expenses ($30,000) immediately accessible to handle any family crisis.",
      lifeArea: 'savings',
      relatedDocumentIds: ['doc4']
    }]

  },
  {
    id: 'business',
    title: t("myPossessions.areas.business.title"),
    description: t("myPossessions.areas.business.description"),
    icon: <BusinessIcon />,
    possessions: [
    {
      id: 'p5',
      name: t("myPossessions.mockData.johnsonContracting"),
      description: "The construction business I built from scratch.",
      familyImpact: "Employs 12 people and generates $150,000/year income. Succession plan ensures continued operation.",
      lifeArea: 'business',
      relatedDocumentIds: ['doc6', 'doc7']
    }]

  },
  {
    id: 'valuables',
    title: t("myPossessions.areas.valuables.title"),
    description: t("myPossessions.areas.valuables.description"),
    icon: <ValuablesIcon />,
    possessions: [
    {
      id: 'p6',
      name: t("myPossessions.mockData.classicCarCollection"),
      description: "The '67 Mustang and '72 Corvette we restored together.",
      familyImpact: "Worth $75,000 combined. Son knows how to maintain them and has first right to purchase.",
      lifeArea: 'valuables',
      relatedDocumentIds: ['doc8']
    }]

  }];


  return (
    <div className="p-4 md:p-6 font-sans max-w-screen-xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">{t("myPossessions.my_possessions_1")}</h2>
      <p className="text-sm md:text-base text-gray-600 mt-1">{t("myPossessions.an_inventory_of_the_important__2")}</p>

      <div className="mt-4 md:mt-6 space-y-4 md:space-y-6">
        {possessionAreas.map((area) =>
        <div key={area.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            {/* Area Header */}
            <div className="p-4 md:p-5 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-xl md:text-2xl flex-shrink-0">{area.icon}</span>
                <div className="min-w-0">
                  <h3 className="text-base md:text-lg font-bold text-gray-800">{area.title}</h3>
                  <p className="text-xs md:text-sm text-gray-500 line-clamp-2">{area.description}</p>
                </div>
              </div>
            </div>

            {/* Possessions List */}
            <div className="p-4 md:p-5">
              {area.possessions.length > 0 ?
            <div className="space-y-3 md:space-y-4">
                  {area.possessions.map((possession) =>
              <div key={possession.id} className="p-3 md:p-4 border rounded-lg hover:border-blue-300 transition-colors">
                      <h4 className="font-semibold text-sm md:text-base text-blue-700 line-clamp-1">{possession.name}</h4>
                      <p className="text-xs md:text-sm text-gray-700 italic mt-1">"{possession.description}"</p>
                      <div className="mt-2 p-2 md:p-3 bg-green-50 border-l-4 border-green-400 rounded">
                        <p className="text-xs md:text-sm font-semibold text-green-800">
                          <span className="block sm:inline">{t("myPossessions.family_impact_3")}</span> <span className="font-normal mt-1 sm:mt-0 block sm:inline">{possession.familyImpact}</span>
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button className="px-3 py-2 text-xs font-semibold text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex-1 sm:flex-initial min-w-[100px]">{t("myPossessions.edit_details_4")}

                  </button>
                        <button className="px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex-1 sm:flex-initial">{t("myPossessions.link_papers_5")}
                    {possession.relatedDocumentIds.length})
                        </button>
                        <button className="px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex-1 sm:flex-initial">{t("myPossessions.assign_access_6")}

                  </button>
                      </div>
                    </div>
              )}
                </div> :

            // Empty State with contextual messaging
            <div className="text-center p-6 md:p-8 border-dashed border-2 border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-sm md:text-base text-gray-600 max-w-md mx-auto">
                    {area.id === 'home' && t("myPossessions.areas.home.emptyState")}
                    {area.id === 'savings' && t("myPossessions.areas.savings.emptyState")}
                    {area.id === 'business' && t("myPossessions.areas.business.emptyState")}
                    {area.id === 'valuables' && t("myPossessions.areas.valuables.emptyState")}
                  </p>
                  <button
                onClick={() => handleAddPossession(area.id)}
                className="mt-4 px-4 md:px-6 py-2.5 md:py-3 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">{t("myPossessions.add_your_first_7")}

                {area.id === 'home' ? t("myPossessions.areas.home.addButton") : area.id === 'savings' ? t("myPossessions.areas.savings.addButton") : area.id === 'business' ? t("myPossessions.areas.business.addButton") : t("myPossessions.areas.valuables.addButton")}
                  </button>
                </div>
            }
            </div>
          </div>
        )}
      </div>
    </div>);

};

// Placeholder Icons
import { Home, Banknote, Building, Gem } from 'lucide-react';import { useTranslation } from "react-i18next";

const HomeIcon = () => <Home className="h-5 w-5 text-blue-600" />;
const SavingsIcon = () => <Banknote className="h-5 w-5 text-blue-600" />;
const BusinessIcon = () => <Building className="h-5 w-5 text-blue-600" />;
const ValuablesIcon = () => <Gem className="h-5 w-5 text-blue-600" />;

export default MyPossessions;