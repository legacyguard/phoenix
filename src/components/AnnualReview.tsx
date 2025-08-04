import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Clock, AlertCircle, ArrowRight, ArrowLeft, Calendar } from 'lucide-react';

const AnnualReview: React.FC = () => {
    const { t } = useTranslation('ui');
    const [step, setStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    const handleNext = () => {
        setStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setStep((prevStep) => prevStep - 1);
    };

    const completeStep = () => {
        setCompletedSteps(prev => new Set([...prev, step - 1]));
    };

    const progressPercentage = (completedSteps.size / 4) * 100;

    const steps = [
        {
            title: t('annualReview.step1.title'),
            description: t('annualReview.step1.description'),
            content: (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                            {t('annualReview.commandRoster.title')}
                        </CardTitle>
                        <p className="text-gray-600">{t('annualReview.commandRoster.description')}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <h4 className="font-semibold">John Smith</h4>
                                    <p className="text-sm text-gray-600">{t('annualReview.commandRoster.details.executor')}</p>
                                </div>
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                    {t('annualReview.commandRoster.status.current')}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <h4 className="font-semibold">Sarah Johnson</h4>
                                    <p className="text-sm text-gray-600">{t('annualReview.commandRoster.details.guardian')}</p>
                                </div>
                                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                    {t('annualReview.commandRoster.status.needsUpdate')}
                                </Badge>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700">{t('annualReview.commandRoster.executorQuestion', { name: 'John Smith' })}</p>
                        <div className="flex gap-3">
                            <Button onClick={completeStep} variant="default">
                                {t('annualReview.buttons.confirm')}
                            </Button>
                            <Button variant="outline">
                                {t('annualReview.buttons.update')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ),
        },
        {
            title: t('annualReview.step2.title'),
            description: t('annualReview.step2.description'),
            content: (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                            {t('annualReview.armory.title')}
                        </CardTitle>
                        <p className="text-gray-600">{t('annualReview.armory.description')}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <h4 className="font-semibold">{t('annualReview.armory.categories.realEstate')}</h4>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <h5 className="font-medium">Primary Residence</h5>
                                        <p className="text-sm text-gray-600">123 Main St, City</p>
                                    </div>
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                        {t('annualReview.armory.status.current')}
                                    </Badge>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-semibold">{t('annualReview.armory.categories.bankAccounts')}</h4>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <h5 className="font-medium">Main Checking Account</h5>
                                        <p className="text-sm text-gray-600">****1234</p>
                                    </div>
                                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                        {t('annualReview.armory.status.needsUpdate')}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700">{t('annualReview.armory.ownershipQuestion', { assetName: 'Primary Residence' })}</p>
                        <div className="flex gap-3">
                            <Button onClick={completeStep} variant="default">
                                {t('annualReview.buttons.confirm')}
                            </Button>
                            <Button variant="outline">
                                {t('annualReview.buttons.update')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ),
        },
        {
            title: t('annualReview.step3.title'),
            description: t('annualReview.step3.description'),
            content: (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                            {t('annualReview.beneficiaries.title')}
                        </CardTitle>
                        <p className="text-gray-600">{t('annualReview.beneficiaries.description')}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <h4 className="font-semibold">Emily Smith</h4>
                                    <p className="text-sm text-gray-600">{t('annualReview.beneficiaries.details.primary')} • {t('annualReview.beneficiaries.details.percentage', { percentage: 60 })}</p>
                                </div>
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                    {t('annualReview.beneficiaries.status.current')}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <h4 className="font-semibold">Michael Smith</h4>
                                    <p className="text-sm text-gray-600">{t('annualReview.beneficiaries.details.primary')} • {t('annualReview.beneficiaries.details.percentage', { percentage: 40 })}</p>
                                </div>
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                    {t('annualReview.beneficiaries.status.current')}
                                </Badge>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700">{t('annualReview.beneficiaries.confirmationQuestion')}</p>
                        <div className="flex gap-3">
                            <Button onClick={completeStep} variant="default">
                                {t('annualReview.buttons.confirm')}
                            </Button>
                            <Button variant="outline">
                                {t('annualReview.buttons.update')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ),
        },
        {
            title: t('annualReview.step4.title'),
            description: t('annualReview.step4.description'),
            content: (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            {t('annualReview.complete.title')}
                        </CardTitle>
                        <p className="text-gray-600">{t('annualReview.complete.description')}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="font-medium">{t('annualReview.complete.summary')}</span>
                                </div>
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                    {t('annualReview.status.completed')}
                                </Badge>
                            </div>
                            <div className="p-3 border rounded-lg">
                                <h4 className="font-semibold mb-2">{t('annualReview.complete.changes')}</h4>
                                <p className="text-sm text-gray-600">{t('annualReview.complete.noChanges')}</p>
                            </div>
                            <div className="flex items-center gap-2 p-3 border rounded-lg">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium">{t('annualReview.complete.nextReview')}</p>
                                    <p className="text-sm text-gray-600">December 15, 2024</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700">{t('annualReview.complete.message')}</p>
                        <p className="text-sm text-gray-600">{t('annualReview.complete.reminder')}</p>
                        <div className="flex gap-3">
                            <Button onClick={() => {/* Implement logic to update lastReviewDate */}} variant="default">
                                {t('annualReview.buttons.finish')}
                            </Button>
                            <Button variant="outline">
                                {t('annualReview.buttons.save')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ),
        },
    ];

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t('annualReview.title')}
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                    {t('annualReview.subtitle')}
                </p>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    {t('annualReview.description')}
                </p>
            </div>

            {/* Progress Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        {t('annualReview.progress.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Progress value={progressPercentage} className="w-full" />
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>{t('annualReview.progress.completed')}: {completedSteps.size}</span>
                            <span>{t('annualReview.progress.totalSteps')}: 4</span>
                        </div>
                        <p className="text-sm text-gray-500">{t('annualReview.progress.estimatedTime')}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Current Step */}
            <div className="space-y-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {steps[step - 1].title}
                    </h2>
                    <p className="text-gray-600">
                        {steps[step - 1].description}
                    </p>
                </div>
                {steps[step - 1].content}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
                {step > 1 && (
                    <Button onClick={handleBack} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('annualReview.buttons.back')}
                    </Button>
                )}
                {step < steps.length && (
                    <Button onClick={handleNext} variant="outline">
                        {t('annualReview.buttons.next')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AnnualReview;

