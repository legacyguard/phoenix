import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentUploadExample } from '@/components/ai/DocumentUploadExample';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAI, useLifeQuestions, useActionSuggestions } from '../../lib/hooks/useAI';
import { Heart, Brain, FileText, Sparkles } from 'lucide-react';
import type { UserProfile, UserContext } from '../../lib/services/openai.types';

export function AIDemo() {
  const { t } = useTranslation();
  const { generateQuestion, generateMessage, suggestAction } = useAI();
  const [generatedMessage, setGeneratedMessage] = React.useState('');
  const [currentQuestion, setCurrentQuestion] = React.useState<Record<string, unknown> | null>(null);
  const [currentSuggestion, setCurrentSuggestion] = React.useState<Record<string, unknown> | null>(null);

  // Mock user profile for demo
  const demoProfile: UserProfile = {
    id: 'demo-user',
    name: 'Sarah Johnson',
    age: 42,
    familyMembers: 3,
    documentsCount: 4,
    preferences: {
      communicationStyle: 'empathetic',
    },
  };

  // Mock context for suggestions
  const demoContext: UserContext = {
    currentPage: 'dashboard',
    recentActions: ['uploaded_will', 'added_insurance'],
    documentsUploaded: 4,
    completionPercentage: 65,
    mood: 'motivated',
  };

  const handleGenerateQuestion = async () => {
    const question = await generateQuestion(demoProfile);
    if (question) {
      setCurrentQuestion(question);
    }
  };

  const handleGenerateSuggestion = async () => {
    const suggestion = await suggestAction(demoContext);
    if (suggestion) {
      setCurrentSuggestion(suggestion);
    }
  };

  const handleGenerateMessage = async (scenario: string, tone: Record<string, unknown>) => {
    const message = await generateMessage(scenario, tone);
    if (message) {
      setGeneratedMessage(message);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{t('demo.ai.title')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('demo.ai.subtitle')}
        </p>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            {t('demo.ai.tabs.documents')}
          </TabsTrigger>
          <TabsTrigger value="questions">
            <Heart className="mr-2 h-4 w-4" />
            {t('demo.ai.tabs.questions')}
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <Brain className="mr-2 h-4 w-4" />
            {t('demo.ai.tabs.suggestions')}
          </TabsTrigger>
          <TabsTrigger value="messages">
            <Sparkles className="mr-2 h-4 w-4" />
            {t('demo.ai.tabs.messages')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-6">
          <DocumentUploadExample />
        </TabsContent>

        <TabsContent value="questions" className="mt-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{t('demo.ai.lifeQuestions.title')}</CardTitle>
              <CardDescription>
                {t('demo.ai.lifeQuestions.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">{t('demo.ai.profile.label')}</p>
                <p className="font-medium">{demoProfile.name}, {demoProfile.age} years old</p>
                <p className="text-sm">{demoProfile.documentsCount} {t('demo.ai.profile.documentsCount')}</p>
              </div>

              <Button onClick={handleGenerateQuestion} className="w-full">
                {t('demo.ai.generateQuestionButton')}
              </Button>

              {currentQuestion && (
                <div className="space-y-4 mt-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="space-y-2">
                      <p className="font-medium text-lg">{currentQuestion.question}</p>
                      <p className="text-sm text-gray-600">{currentQuestion.context}</p>
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{t('demo.ai.question.category')} {currentQuestion.category}</span>
                    <span>{t('demo.ai.question.time', { minutes: currentQuestion.estimatedTimeMinutes })}</span>
                  </div>

                  {currentQuestion.followUpQuestions && (
                    <div>
                      <p className="text-sm font-medium mb-2">{t('demo.ai.question.followUp')}:</p>
                      <ul className="space-y-1">
                        {currentQuestion.followUpQuestions.map((q: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-600">• {q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="mt-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{t('demo.ai.suggestions.title')}</CardTitle>
              <CardDescription>
                {t('demo.ai.suggestions.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">{t('demo.ai.context.label')}</p>
                <p className="text-sm">{t('demo.ai.context.completion')} {demoContext.completionPercentage}%</p>
                <p className="text-sm">{t('demo.ai.context.recent')} {demoContext.recentActions.join(', ')}</p>
                <p className="text-sm">{t('demo.ai.context.mood')} {demoContext.mood}</p>
              </div>

              <Button onClick={handleGenerateSuggestion} className="w-full">
                {t('demo.ai.getSuggestionButton')}
              </Button>

              {currentSuggestion && (
                <div className="space-y-4 mt-4">
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="space-y-2">
                      <p className="font-medium">{currentSuggestion.action}</p>
                      <p className="text-sm text-gray-600">{currentSuggestion.reason}</p>
                      {currentSuggestion.encouragement && (
                        <p className="text-sm italic text-green-700">
                          💚 {currentSuggestion.encouragement}
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-between text-sm">
                    <span>{t('demo.ai.suggestion.priority')} <span className="font-medium">{currentSuggestion.priority}</span></span>
                    <span>{t('demo.ai.suggestion.timeNeeded', { time: currentSuggestion.estimatedTime })}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{t('demo.ai.messages.title')}</CardTitle>
              <CardDescription>
                {t('demo.ai.messages.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleGenerateMessage('User feels overwhelmed', 'supportive')}
                >
                  {t('demo.ai.messages.overwhelmedUser')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateMessage('User completed their will', 'celebratory')}
                >
                  {t('demo.ai.messages.completedWill')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateMessage('User starting their journey', 'encouraging')}
                >
                  {t('demo.ai.messages.justStarting')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateMessage('User needs motivation', 'gentle')}
                >
                  {t('demo.ai.messages.needsMotivation')}
                </Button>
              </div>

              {generatedMessage && (
                <Alert className="bg-purple-50 border-purple-200">
                  <AlertDescription className="text-purple-800">
                    💜 {generatedMessage}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-muted-foreground">
        <p>{t('demo.ai.note.description')}</p>
        <p>{t('demo.ai.note.apiKey')}</p>
      </div>
    </div>
  );
}
