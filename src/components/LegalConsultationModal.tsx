import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { Scale, FileText, Users, HelpCircle, Shield, Calculator, Info } from 'lucide-react';

interface LegalConsultationModalProps {
  open: boolean;
  onClose: () => void;
  onProceed: (details: {type: string;question: string;countryCode: string;}) => void;
  userCountry?: string;
}

const getConsultationTypes = (t: Record<string, unknown>) => [
{
  value: 'will_review',
  label: t('legalConsultation.types.willReview.label'),
  description: t('legalConsultation.types.willReview.description'),
  icon: FileText,
  price: 99
},
{
  value: 'estate_planning_qa',
  label: t('legalConsultation.types.estatePlanningQA.label'),
  description: t('legalConsultation.types.estatePlanningQA.description'),
  icon: HelpCircle,
  price: 79
},
{
  value: 'executor_guidance',
  label: t('legalConsultation.types.executorGuidance.label'),
  description: t('legalConsultation.types.executorGuidance.description'),
  icon: Users,
  price: 129
},
{
  value: 'beneficiary_advice',
  label: t('legalConsultation.types.beneficiaryAdvice.label'),
  description: t('legalConsultation.types.beneficiaryAdvice.description'),
  icon: Shield,
  price: 89
},
{
  value: 'trust_setup',
  label: t('legalConsultation.types.trustSetup.label'),
  description: t('legalConsultation.types.trustSetup.description'),
  icon: Scale,
  price: 199
},
{
  value: 'tax_planning',
  label: t('legalConsultation.types.taxPlanning.label'),
  description: t('legalConsultation.types.taxPlanning.description'),
  icon: Calculator,
  price: 149
}];


const LegalConsultationModal: React.FC<LegalConsultationModalProps> = ({
  open,
  onClose,
  onProceed,
  userCountry = 'GB'
}) => {
  const { t } = useTranslation('ui');
  const [consultationType, setConsultationType] = useState<string>('');
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<number>(99);
  const consultationTypes = getConsultationTypes(t);

  useEffect(() => {
     
    const selected = consultationTypes.find((type) => type.value === consultationType);
    if (selected) {
      setSelectedPrice(selected.price);
    }
  }, [consultationType, consultationTypes]);

  const handleProceed = () => {
    setError('');

    if (!consultationType) {
      setError(t("legalConsultationModal.please_select_a_consultation_t_1"));
      return;
    }

    if (!userQuestion.trim()) {
      setError(t("legalConsultationModal.please_provide_your_legal_ques_2"));
      return;
    }

    if (userQuestion.trim().length < 20) {
      setError(t("legalConsultationModal.please_provide_more_detail_in__3"));
      return;
    }

    onProceed({
      type: consultationType,
      question: userQuestion.trim(),
      countryCode: userCountry
    });
  };

  const handleClose = () => {
    setConsultationType('');
    setUserQuestion('');
    setError('');
    onClose();
  };

  const selectedType = consultationTypes.find((type) => type.value === consultationType);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl">{t("legalConsultationModal.request_a_professional_legal_r_4")}

            </DialogTitle>
          </div>
          <DialogDescription>{t("legalConsultationModal.get_expert_legal_advice_from_o_5")}

          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error &&
          <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          }
          
          <div className="space-y-3">
            <Label htmlFor="consultation-type">{t("legalConsultationModal.consultation_type_6")}</Label>
            <Select
              onValueChange={setConsultationType}
              value={consultationType}>

              <SelectTrigger id="consultation-type">
                <SelectValue placeholder={t("legalConsultationModal.select_the_type_of_legal_consu_7")} />
              </SelectTrigger>
              <SelectContent>
                {consultationTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-start gap-3 py-1">
                        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="space-y-1">
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {type.description}
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-auto">
                          €{type.price}
                        </Badge>
                      </div>
                    </SelectItem>);

                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="question">{t("legalConsultationModal.your_legal_question_8")}</Label>
            <Textarea
              id="question"
              placeholder={t("legalConsultationModal.please_describe_your_legal_que_9")}
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              rows={6}
              className="resize-none" />

            <p className="text-xs text-muted-foreground">
              {userQuestion.length}{t("legalConsultationModal.500_characters_minimum_20_10")}
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{t("legalConsultationModal.one_time_consultation_fee_11")}
                  {selectedPrice}
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>{t("legalConsultationModal.written_response_within_48_72__12")}</li>
                  <li>{t("legalConsultationModal.review_by_qualified_lawyer_in__13")}</li>
                  <li>{t("legalConsultationModal.follow_up_clarification_includ_14")}</li>
                  <li>{t("legalConsultationModal.secure_and_confidential_15")}</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} variant="outline">
            {t('ui.cancel')}
          </Button>
          <Button onClick={handleProceed} disabled={!consultationType || !userQuestion}>
            {t("legalConsultationModal.proceed_to_payment_16")} (€{selectedPrice})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

};

export default LegalConsultationModal;