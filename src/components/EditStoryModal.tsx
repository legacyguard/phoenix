import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import { toast } from 'sonner';
import { Feather } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EditStoryModalProps {
  assetId: string;
  assetName: string;
  currentStory?: string;
  onClose: () => void;
  onStorySaved: (story: string) => void;
}

export const EditStoryModal: React.FC<EditStoryModalProps> = ({
  assetId,
  assetName,
  currentStory = '',
  onClose,
  onStorySaved,
}) => {
  const { t } = useTranslation('assets');
  const [story, setStory] = useState(currentStory);
  const [isSaving, setIsSaving] = useState(false);
  const [characterCount, setCharacterCount] = useState(currentStory.length);

  const maxCharacters = 2000;

  useEffect(() => {
     
    setCharacterCount(story.length);
  }, [story]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) {
        toast.error(t('editStoryModal.errors.notAuthenticated'));
        return;
      }

      const { error } = await supabaseWithRetry
        .from('assets')
        .update({ asset_story: story.trim() || null })
        .eq('id', assetId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(t('editStoryModal.messages.saved'));
      onStorySaved(story.trim());
      onClose();
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error(t('editStoryModal.errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Feather className="h-5 w-5 text-accent-green" />
            {currentStory ? t('editStoryModal.editStory') : t('editStoryModal.addStory')}
          </DialogTitle>
          <DialogDescription>
            {t('editStoryModal.description', { assetName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="story">{t('editStoryModal.fields.yourStory')}</Label>
            <Textarea
              id="story"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder={t('editStoryModal.placeholders.story')}
              className="min-h-[200px] resize-none"
              maxLength={maxCharacters}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t('editStoryModal.hints.shareMemories')}</span>
              <span className={characterCount > maxCharacters * 0.9 ? 'text-orange-600' : ''}>
                {characterCount} / {maxCharacters}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">{t('editStoryModal.tips.title')}</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• {t('editStoryModal.tips.explainSpecial')}</li>
              <li>• {t('editStoryModal.tips.shareMemories')}</li>
              <li>• {t('editStoryModal.tips.describeHistory')}</li>
              <li>• {t('editStoryModal.tips.mentionWishes')}</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || story.length === 0}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('editStoryModal.saving')}
                </>
              ) : (
                t('editStoryModal.saveStory')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
