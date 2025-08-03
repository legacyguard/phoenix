import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Phone,
  Mail,
  User,
  GripVertical,
  Plus,
  Trash2,
  AlertCircle,
  Shield,
  MessageSquare,
  Clock,
  CheckCircle,
  X,
  Bell,
  BellOff
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  notes?: string;
}

interface EmergencyContact {
  id: string;
  contact_id: string;
  priority_order: number;
  relationship?: string;
  last_contacted?: string;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  contact_role?: string;
  contact_notes?: string;
}

export const EmergencyContacts: React.FC = () => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('');
  const [isReordering, setIsReordering] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      // Load emergency contacts with details
      const { data: emergencyData, error: emergencyError } = await supabaseWithRetry
        .from('emergency_contacts_view')
        .select('*')
        .eq('user_id', user.id)
        .order('priority_order');

      if (emergencyError) throw emergencyError;
      setEmergencyContacts(emergencyData || []);

      // Load all contacts to show available ones
      const { data: contactsData, error: contactsError } = await supabaseWithRetry
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('name');

      if (contactsError) throw contactsError;

      // Filter out contacts already set as emergency contacts
      const emergencyContactIds = emergencyData?.map(ec => ec.contact_id) || [];
      const available = contactsData?.filter(c => !emergencyContactIds.includes(c.id)) || [];
      setAvailableContacts(available);

    } catch (error) {
      console.error('[EmergencyContacts] Error loading data:', error);
      toast.error(t('emergency.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(emergencyContacts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately
    setEmergencyContacts(items);
    setIsReordering(true);

    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      // Update priority orders in database
      const contactIds = items.map(item => item.contact_id);
      const { error } = await supabaseWithRetry.rpc('reorder_emergency_contacts', {
        p_user_id: user.id,
        p_contact_ids: contactIds
      });

      if (error) throw error;
      toast.success(t('emergency.messages.reordered'));
    } catch (error) {
      console.error('[EmergencyContacts] Error reordering:', error);
      toast.error(t('emergency.errors.reorderFailed'));
      loadData(); // Reload to restore correct order
    } finally {
      setIsReordering(false);
    }
  };

  const handleAddEmergencyContact = async () => {
    if (!selectedContactId) {
      toast.error(t('emergency.errors.selectContact'));
      return;
    }

    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      const nextPriority = emergencyContacts.length + 1;

      const { error } = await supabaseWithRetry
        .from('emergency_contacts')
        .insert({
          user_id: user.id,
          contact_id: selectedContactId,
          priority_order: nextPriority,
          relationship
        });

      if (error) throw error;

      toast.success(t('emergency.messages.added'));
      setShowAddDialog(false);
      setSelectedContactId('');
      setRelationship('');
      loadData();
    } catch (error) {
      console.error('[EmergencyContacts] Error adding:', error);
      toast.error(t('emergency.errors.addFailed'));
    }
  };

  const handleRemoveEmergencyContact = async (id: string) => {
    try {
      const { error } = await supabaseWithRetry
        .from('emergency_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(t('emergency.messages.removed'));
      loadData();
    } catch (error) {
      console.error('[EmergencyContacts] Error removing:', error);
      toast.error(t('emergency.errors.removeFailed'));
    }
  };

  const handleSendTestMessage = async (contact: EmergencyContact) => {
    try {
      const response = await fetch(`/api/emergency/send-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contactId: contact.id })
      });

      if (!response.ok) {
        throw new Error(t('emergency.errors.testFailed'));
      }

      toast.success(t('emergency.messages.testSent', { name: contact.contact_name }));
      
      // Update last_contacted timestamp
      await supabaseWithRetry
        .from('emergency_contacts')
        .update({ last_contacted: new Date().toISOString() })
        .eq('id', contact.id);
      
      loadData();
    } catch (error) {
      console.error('[EmergencyContacts] Error sending test:', error);
      toast.error(t('emergency.errors.testFailed'));
    }
  };

  const getPriorityBadge = (priority: number) => {
    const variants = {
      1: 'default',
      2: 'secondary',
      3: 'outline'
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'outline'}>
        {t(`emergency.priority.${priority}`)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('emergency.title')}</CardTitle>
          <CardDescription>{t('emergency.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('emergency.title')}
              </CardTitle>
              <CardDescription>{t('emergency.description')}</CardDescription>
            </div>
            {emergencyContacts.length < 3 && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('emergency.addContact')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {emergencyContacts.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('emergency.noContacts')}
              </AlertDescription>
            </Alert>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="emergency-contacts">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {emergencyContacts.map((contact, index) => (
                      <Draggable
                        key={contact.id}
                        draggableId={contact.id}
                        index={index}
                        isDragDisabled={isReordering}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                          >
                            <Card className="p-4">
                              <div className="flex items-start gap-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="mt-1 cursor-move"
                                >
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>
                                
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-medium">{contact.contact_name}</h4>
                                        {getPriorityBadge(contact.priority_order)}
                                      </div>
                                      {contact.relationship && (
                                        <p className="text-sm text-muted-foreground">
                                          {contact.relationship}
                                        </p>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveEmergencyContact(contact.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    {contact.contact_phone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                        <a
                                          href={`tel:${contact.contact_phone}`}
                                          className="text-primary hover:underline"
                                        >
                                          {contact.contact_phone}
                                        </a>
                                      </div>
                                    )}
                                    {contact.contact_email && (
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                        <a
                                          href={`mailto:${contact.contact_email}`}
                                          className="text-primary hover:underline"
                                        >
                                          {contact.contact_email}
                                        </a>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSendTestMessage(contact)}
                                      >
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        {t('emergency.sendTest')}
                                      </Button>
                                      
                                      {contact.last_contacted && (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Clock className="h-3 w-3" />
                                          {t('emergency.lastContacted', {
                                            time: format(new Date(contact.last_contacted), 'MM/dd/yyyy HH:mm')
                                          })}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {emergencyContacts.length === 3 && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {t('emergency.maxContactsReached')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Add Emergency Contact Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('emergency.addContactDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('emergency.addContactDialog.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact">{t('emergency.addContactDialog.selectContact')}</Label>
              <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                <SelectTrigger id="contact">
                  <SelectValue placeholder={t('emergency.addContactDialog.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {availableContacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{contact.name}</span>
                        {contact.role && (
                          <span className="text-muted-foreground">({contact.role})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">{t('emergency.addContactDialog.relationship')}</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger id="relationship">
                  <SelectValue placeholder={t('emergency.addContactDialog.relationshipPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">{t('relationships.spouse')}</SelectItem>
                  <SelectItem value="child">{t('relationships.child')}</SelectItem>
                  <SelectItem value="parent">{t('relationships.parent')}</SelectItem>
                  <SelectItem value="sibling">{t('relationships.sibling')}</SelectItem>
                  <SelectItem value="friend">{t('relationships.friend')}</SelectItem>
                  <SelectItem value="other">{t('relationships.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAddEmergencyContact}>
              {t('emergency.addContactDialog.addButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
