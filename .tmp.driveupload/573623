// Living Legacy Service - Stub implementation for tests
export interface LifeEvent {
  userId: string;
  type: string;
  timestamp: Date;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export async function LogLifeEvent(userId: string, eventType: string): Promise<void> {
  // Stub implementation
  console.log(`Logging life event: ${eventType} for user: ${userId}`);
  
  // Import db dynamically to avoid circular dependencies in tests
  try {
    const { db } = await import('@/infra/db');
    await db.lifeEvents.insert({
      userId,
      type: eventType,
      timestamp: new Date(),
    });
  } catch (error) {
    // Ignore errors in test environment
  }
}

export function generateChecklist(eventType: string): ChecklistItem[] {
  // Stub implementation
  const baseItems: ChecklistItem[] = [
    { id: '1', title: `Update documents for ${eventType}`, completed: false },
    { id: '2', title: `Review beneficiaries for ${eventType}`, completed: false },
    { id: '3', title: `Update emergency contacts for ${eventType}`, completed: false },
  ];
  
  return baseItems;
}