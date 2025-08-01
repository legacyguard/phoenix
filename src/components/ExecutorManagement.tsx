import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Shield, Trash2, AlertCircle } from 'lucide-react';import { useTranslation } from "react-i18next";

interface ExecutorRelationship {
  id: string;
  executor_id: string;
  relationship_type: 'primary' | 'secondary' | 'emergency';
  executor_profile?: {
    full_name: string;
    email: string;
  };
  created_at: string;
}

const ExecutorManagement: React.FC = () => {
  const { user } = useAuth();
  const [executors, setExecutors] = useState<ExecutorRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [email, setEmail] = useState('');
  const [relationshipType, setRelationshipType] = useState<'primary' | 'secondary' | 'emergency'>('primary');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchExecutors();
    }
  }, [user]);

  const fetchExecutors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.
      from('executor_relationships').
      select(`
          *,
          executor_profile:profiles!executor_id(
            full_name,
            email
          )
        `).
      eq('user_id', user!.id).
      order('created_at', { ascending: false });

      if (error) throw error;
      setExecutors(data || []);
    } catch (err) {
      console.error('Error fetching executors:', err);
      setError(t("executorManagement.failed_to_load_executors_2"));
    } finally {
      setLoading(false);
    }
  };

  const addExecutor = async () => {
    try {
      setAdding(true);
      setError(null);
      setSuccess(null);

      // Find user by email
      const { data: userData, error: userError } = await supabase.
      from('profiles').
      select('id').
      eq('email', email).
      single();

      if (userError || !userData) {
        setError(t("executorManagement.user_not_found_with_this_email_3"));
        return;
      }

      // Check if already exists
      const existing = executors.find((e) => e.executor_id === userData.id);
      if (existing) {
        setError(t("executorManagement.this_person_is_already_designa_4"));
        return;
      }

      // Add executor relationship
      const { error: insertError } = await supabase.
      from('executor_relationships').
      insert({
        user_id: user!.id,
        executor_id: userData.id,
        relationship_type: relationshipType
      });

      if (insertError) throw insertError;

      setSuccess(t('executorManagement.successMessages.executorAdded'));
      setEmail('');
      await fetchExecutors();
    } catch (err) {
      console.error('Error adding executor:', err);
      setError(t("executorManagement.failed_to_add_executor_5"));
    } finally {
      setAdding(false);
    }
  };

  const removeExecutor = async (executorId: string) => {
    try {
      const { error } = await supabase.
      from('executor_relationships').
      delete().
      eq('id', executorId).
      eq('user_id', user!.id);

      if (error) throw error;

      setSuccess(t('executorManagement.successMessages.executorRemoved'));
      await fetchExecutors();
    } catch (err) {
      console.error('Error removing executor:', err);
      setError(t("executorManagement.failed_to_remove_executor_6"));
    }
  };

  if (loading) {
    return <div>{t("executorManagement.loading_executors_7")}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />{t("executorManagement.executor_management_8")}

          </CardTitle>
          <CardDescription>{t("executorManagement.designate_trusted_individuals__9")}


          </CardDescription>
        </CardHeader>
        <CardContent>
          {error &&
          <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          }

          {success &&
          <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          }

          {/* Add Executor Form */}
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5" />{t("executorManagement.add_new_executor_10")}

            </h3>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="email">{t("executorManagement.email_address_11")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("executorManagement.executor_example_com_12")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} />

              </div>

              <div>
                <Label htmlFor="type">{t("executorManagement.relationship_type_13")}</Label>
                <Select value={relationshipType} onValueChange={(value: Record<string, unknown>) => setRelationshipType(value)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">{t("executorManagement.primary_executor_14")}</SelectItem>
                    <SelectItem value="secondary">{t("executorManagement.secondary_executor_15")}</SelectItem>
                    <SelectItem value="emergency">{t("executorManagement.emergency_contact_16")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={addExecutor}
                disabled={!email || adding}
                className="w-full sm:w-auto">

                {adding ? t('executorManagement.statusLabels.adding') : t('executorManagement.statusLabels.addExecutor')}
              </Button>
            </div>
          </div>

          {/* Executors List */}
          <div className="space-y-3">
            <h3 className="font-semibold">{t("executorManagement.current_executors_17")}</h3>
            
            {executors.length === 0 ?
            <p className="text-muted-foreground text-center py-8">{t("executorManagement.no_executors_designated_yet_ad_18")}

            </p> :

            executors.map((executor) =>
            <div
              key={executor.id}
              className="flex items-center justify-between p-4 border rounded-lg">

                  <div>
                    <div className="font-medium">
                      {executor.executor_profile?.full_name || t('executorManagement.statusLabels.unknownUser')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {executor.executor_profile?.email}
                    </div>
                    <Badge variant="secondary" className="mt-1">
                      {executor.relationship_type.charAt(0).toUpperCase() + executor.relationship_type.slice(1)}
                    </Badge>
                  </div>
                  
                  <Button
                variant="ghost"
                size="sm"
                onClick={() => removeExecutor(executor.id)}
                className="text-destructive hover:text-destructive">

                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
            )
            }
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">{t("executorManagement.important_information_19")}

            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>{t("executorManagement.primary_executors_receive_imme_20")}</li>
              <li>{t("executorManagement.secondary_executors_are_notifi_21")}</li>
              <li>{t("executorManagement.emergency_contacts_are_notifie_22")}</li>
              <li>{t("executorManagement.all_executors_must_have_legacy_23")}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default ExecutorManagement;