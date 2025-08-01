import { ExtractedMetadata, RelationshipResult, UserInventory } from '../types/document-ai';

// To find related documents based on new document data
export async function detectRelationships(
  newDocMetadata: ExtractedMetadata, 
  userInventory: UserInventory
): Promise<RelationshipResult> {
  const { vinNumber, propertyAddress, ownerNames } = newDocMetadata;
  const { possessions, people } = userInventory;
  let result: RelationshipResult = {};

  // Link to Possessions
  if (vinNumber) {
    const linkedCar = possessions.find(p => p.details?.vin === vinNumber);
    if (linkedCar) result.linkedPossessionId = linkedCar.id;
  }
  if (propertyAddress) {
    const linkedHome = possessions.find(p => p.details?.address === propertyAddress);
    if (linkedHome) result.linkedPossessionId = linkedHome.id;
  }

  // Link to People
  if (ownerNames) {
    for (const ownerName of ownerNames) {
      const linkedPerson = people.find(p => p.name.toLowerCase() === ownerName.toLowerCase());
      if (linkedPerson) {
        result.linkedPersonId = linkedPerson.id;
        break;
      }
    }
  }

  // Suggest Missing Documents
  const hasMortgage = possessions.some(p => p.type === 'mortgage');
  const hasPropertyInsurance = possessions.some(p => p.type === 'property_insurance');
  if (hasMortgage && !hasPropertyInsurance) {
    result.missingDocumentSuggestion = "It looks like you have a mortgage but no property insurance linked. Consider adding your policy.";
  }

  // Return the relationship result
  return result;
}

