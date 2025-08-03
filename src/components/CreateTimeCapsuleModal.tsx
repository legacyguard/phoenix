import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  CalendarIcon,
  FileText,
  Image,
  Video,
  Mic,
  Upload,
  X,
  AlertCircle,
  Users,
  Lock } from
'lucide-react';
import { toast } from 'sonner';
import { VideoRecorder } from '@/features/time-capsule/components/VideoRecorder';
import CryptoJS from 'crypto-js';
import { TimeCapsuleMessage, MessageType, UnlockCondition } from '@/types/timeCapsule';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface CreateTimeCapsuleModalProps {
  open: boolean;
  onClose: () => void;
  trustedPeople: Array<Record<string, unknown>>;
  onSuccess: () => void;
  editingCapsule?: TimeCapsuleMessage | null;
}

export const CreateTimeCapsuleModal: React.FC<CreateTimeCapsuleModalProps> = ({
  open,
  onClose,
  trustedPeople,
  onSuccess,
  editingCapsule
}) => {
  const { t } = useTranslation('common');
  const { user } = useUser();
  const { isPremium } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);

const handleVideoRecorded = useCallback((file: File) => {
    // Encrypt file with AES
    const reader = new FileReader();
    reader.onload = () => {
      const encrypted = CryptoJS.AES.encrypt(reader.result as string, 'secret-key').toString();
      const encryptedBlob = new Blob([encrypted], { type: file.type });
      setAttachment(new File([encryptedBlob], file.name));
    };
    reader.readAsBinaryString(file);
    setShowVideoRecorder(false);
  }, []);
  const [title, setTitle] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('text');
  const [textContent, setTextContent] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [unlockCondition, setUnlockCondition] = useState<UnlockCondition>('date');
  const [unlockDate, setUnlockDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (editingCapsule) {
      setTitle(editingCapsule.title);
      setMessageType(editingCapsule.messageType);
      setTextContent(editingCapsule.textContent || '');
      setSelectedRecipients(editingCapsule.recipientIds);
      setUnlockCondition(editingCapsule.unlockCondition);
      if (editingCapsule.unlockDate) {
        setUnlockDate(new Date(editingCapsule.unlockDate));
      }
    }
  }, [editingCapsule]);

  const resetForm = () => {
    setTitle('');
    setMessageType('text');
    setTextContent('');
    setAttachment(null);
    setSelectedRecipients([]);
    setUnlockCondition('date');
    setUnlockDate(undefined);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError(t('createTimeCapsuleModal.errors.noTitle'));
      return;
    }

    if (selectedRecipients.length === 0) {
      setError(t('createTimeCapsuleModal.errors.noRecipients'));
      return;
    }

    if (unlockCondition === 'date' && !unlockDate) {
      setError(t('createTimeCapsuleModal.errors.noUnlockDate'));
      return;
    }

    if (messageType === 'text' && !textContent.trim()) {
      setError(t('createTimeCapsuleModal.errors.noMessage'));
      return;
    }

    if (['photo', 'video', 'audio'].includes(messageType) && !attachment && !editingCapsule) {
      setError(t('createTimeCapsuleModal.errors.noFile'));
      return;
    }

    try {
      setLoading(true);

      const url = editingCapsule ?
      `/api/time-capsule/${editingCapsule.id}` :
      '/api/time-capsule';

      const method = editingCapsule ? 'PUT' : 'POST';

      if (editingCapsule && !attachment) {
        const updateData = {
          title,
          textContent: messageType === 'text' ? textContent : undefined,
          recipientIds: selectedRecipients,
          unlockCondition,
          unlockDate: unlockCondition === 'date' ? unlockDate?.toISOString() : null
        };

        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${await user?.getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          throw new Error(t('createTimeCapsuleModal.errors.updateFailed'));
        }
      } else {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('messageType', messageType);
        formData.append('recipientIds', JSON.stringify(selectedRecipients));
        formData.append('unlockCondition', unlockCondition);

        if (unlockCondition === 'date' && unlockDate) {
          formData.append('unlockDate', unlockDate.toISOString());
        }

        if (messageType === 'text') {
          formData.append('textContent', textContent);
        }

        if (attachment) {
          formData.append('attachment', attachment);
        }

        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${await user?.getToken()}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || t('createTimeCapsuleModal.errors.saveFailed'));
        }
      }

      toast.success(editingCapsule ? t('createTimeCapsuleModal.success.updated') : t('createTimeCapsuleModal.success.created'));
      resetForm();
      onSuccess();
    } catch (err) {
      console.error('Error saving time capsule:', err);
      setError(err instanceof Error ? err.message : t('createTimeCapsuleModal.errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(t('createTimeCapsuleModal.errors.fileTooLarge'));
      return;
    }

    const validTypes = {
      photo: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/webm', 'audio/ogg']
    };

    if (messageType !== 'text' && !validTypes[messageType]?.includes(file.type)) {
      setError(t('createTimeCapsuleModal.errors.invalidFileType', { messageType }));
      return;
    }

    setAttachment(file);
    setError(null);
  };

  const toggleRecipient = (recipientId: string) => {
    setSelectedRecipients((prev) =>
    prev.includes(recipientId) ?
    prev.filter((id) => id !== recipientId) :
    [...prev, recipientId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingCapsule ? t('createTimeCapsuleModal.titleEdit') : t('createTimeCapsuleModal.titleCreate')}
            </DialogTitle>
            <DialogDescription>
              {t('createTimeCapsuleModal.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {error &&
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            }

            <div className="space-y-2">
              <Label htmlFor="title">{t('createTimeCapsuleModal.labels.title')}</Label>
              <Input
                id="title"
                placeholder={t('createTimeCapsuleModal.placeholders.title')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100} />

            </div>

            <div className="space-y-2">
              <Label>{t('createTimeCapsuleModal.labels.messageType')}</Label>
              <RadioGroup
                value={messageType}
                onValueChange={(value) => setMessageType(value as MessageType)}
                disabled={!!editingCapsule}>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="text" id="text" />
                    <Label htmlFor="text" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" />
                      {t('createTimeCapsuleModal.messageTypes.text')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="photo" id="photo" />
                    <Label htmlFor="photo" className="flex items-center gap-2 cursor-pointer">
                      <Image className="h-4 w-4" />
                      {t('createTimeCapsuleModal.messageTypes.photo')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="video" id="video" />
                    <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer">
                      <Video className="h-4 w-4" />
                      {t('createTimeCapsuleModal.messageTypes.video')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="audio" id="audio" />
                    <Label htmlFor="audio" className="flex items-center gap-2 cursor-pointer">
                      <Mic className="h-4 w-4" />
                      {t('createTimeCapsuleModal.messageTypes.audio')}
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>{t('createTimeCapsuleModal.labels.recipients')}</Label>
              <div className="border rounded-lg p-4">
                {trustedPeople.length === 0 ?
                <p className="text-sm text-muted-foreground">
                    {t('createTimeCapsuleModal.recipients.noTrustedPeople')}
                  </p> :

                <div className="space-y-2">
                    {trustedPeople.map((person) =>
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                    onClick={() => toggleRecipient(person.id)}>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{person.name}</p>
                            <p className="text-sm text-muted-foreground">{person.relationship}</p>
                          </div>
                        </div>
                        {selectedRecipients.includes(person.id) &&
                    <Badge variant="default">{t('createTimeCapsuleModal.recipients.selected')}</Badge>
                    }
                      </div>
                  )}
                  </div>
                }
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('createTimeCapsuleModal.labels.deliveryQuestion')}</Label>
              <RadioGroup
                value={unlockCondition}
                onValueChange={(value) => setUnlockCondition(value as UnlockCondition)}>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="date" id="specific-date" />
                  <Label htmlFor="specific-date">{t('createTimeCapsuleModal.unlockConditions.onDate')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="after_passing" id="after-passing" />
                  <Label htmlFor="after-passing">{t('createTimeCapsuleModal.unlockConditions.afterPassing')}</Label>
                </div>
              </RadioGroup>
            </div>

            {unlockCondition === 'date' &&
            <div className="space-y-2">
                <Label>{t('createTimeCapsuleModal.labels.unlockDate')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !unlockDate && 'text-muted-foreground'
                    )}>

                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {unlockDate ? format(unlockDate, 'PPP') : t('createTimeCapsuleModal.placeholders.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                    mode="single"
                    selected={unlockDate}
                    onSelect={setUnlockDate}
                    initialFocus
                    disabled={(date) => date < new Date()} />

                  </PopoverContent>
                </Popover>
              </div>
            }

            {messageType === 'text' &&
            <div className="space-y-2">
                <Label htmlFor="message">{t('createTimeCapsuleModal.labels.yourMessage')}</Label>
                <Textarea
                id="message"
                placeholder={t('createTimeCapsuleModal.placeholders.message')}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={6}
                maxLength={5000} />

                <p className="text-sm text-muted-foreground text-right">
                  {t('createTimeCapsuleModal.characterCount', { count: textContent.length, max: 5000 })}
                </p>
              </div>
            }
            {messageType === 'video' && showVideoRecorder &&
            <VideoRecorder
              onVideoRecorded={handleVideoRecorded}
              onClose={() => setShowVideoRecorder(false)}
              maxDurationSeconds={300} // 5 minutes
              maxFileSizeMB={500} // 500MB
            />
            }

            {messageType === 'video' && !isPremium && !showVideoRecorder &&
            <Alert variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('createTimeCapsuleModal.premium.videoMessage')}{' '}
                  <Link to={t("createTimeCapsuleModal.upgrade_1")} className="text-primary hover:underline">{t('createTimeCapsuleModal.premium.upgradeNow')}</Link>
                </AlertDescription>
              </Alert>
            }

            {messageType === 'video' && isPremium && !showVideoRecorder &&
            <Button onClick={() => setShowVideoRecorder(true)}>
                {t('createTimeCapsuleModal.buttons.recordVideo')}
              </Button>
            }

            {messageType !== 'text' &&
            <div className="space-y-2">
                <Label>{t('createTimeCapsuleModal.labels.uploadFile', { messageType })}</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {attachment ?
                <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">{attachment.name}</span>
                        <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachment(null)}>

                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('createTimeCapsuleModal.fileUpload.fileSizeMB', { size: (attachment.size / 1024 / 1024).toFixed(2) })}
                      </p>
                    </div> :

                <>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-primary hover:underline">{t('createTimeCapsuleModal.fileUpload.clickToUpload')}</span>
                        <span className="text-muted-foreground">{t('createTimeCapsuleModal.fileUpload.dragAndDrop')}</span>
                      </Label>
                      <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept={
                    messageType === 'photo' ? 'image/*' :
                    messageType === 'video' ? 'video/*' :
                    'audio/*'
                    } />

                      <p className="text-xs text-muted-foreground mt-2">
                        {t('createTimeCapsuleModal.fileUpload.maxSize')}
                      </p>
                    </>
                }
                </div>
              </div>
            }
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t('createTimeCapsuleModal.buttons.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('createTimeCapsuleModal.buttons.saving') : editingCapsule ? t('createTimeCapsuleModal.buttons.update') : t('createTimeCapsuleModal.buttons.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);

};