export type MessageType = "text" | "photo" | "video" | "audio";
export type UnlockCondition = "date" | "after_passing";
export type CapsuleStatus = "locked" | "unlocked" | "delivered";

export interface TimeCapsuleMessage {
  id: string;
  userId: string;
  title: string;
  messageType: MessageType;
  textContent?: string;
  attachmentUrl?: string;
  attachmentMetadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number; // for video/audio
    thumbnailUrl?: string; // for video
  };
  recipientIds: string[];
  unlockCondition: UnlockCondition;
  unlockDate?: string | null;
  status: CapsuleStatus;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string | null;
}

export interface CreateTimeCapsuleDto {
  title: string;
  messageType: MessageType;
  textContent?: string;
  attachment?: File;
  recipientIds: string[];
  unlockCondition: UnlockCondition;
  unlockDate?: string | null;
}

export interface UpdateTimeCapsuleDto {
  title?: string;
  textContent?: string;
  recipientIds?: string[];
  unlockCondition?: UnlockCondition;
  unlockDate?: string | null;
}
