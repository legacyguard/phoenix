import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Heart, MessageCircle, Users, Sparkles } from 'lucide-react';
import { trackEmpatheticInteraction } from '@/hooks/useUXMetrics';

interface EmpathyFeedbackProps {
  context: string;
  onComplete?: (feedback: EmpathyFeedbackData) => void;
  inline?: boolean;
}

interface EmpathyFeedbackData {
  personalAssistantScore: number;
  familyFocusScore: number;
  emotionalSupportScore: number;
  overallExperienceScore: number;
  feedback: string;
  timestamp: Date;
  context: string;
}

const EmpathyFeedback: React.FC<EmpathyFeedbackProps> = ({ 
  context, 
  onComplete,
  inline = false 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questions = [
    {
      id: 'personalAssistant',
      icon: <Heart className="h-5 w-5 text-rose-500" />,
      question: "Did this feel like talking to a caring person or using a technical tool?",
      lowLabel: "Technical tool",
      highLabel: "Caring person"
    },
    {
      id: 'familyFocus',
      icon: <Users className="h-5 w-5 text-blue-500" />,
      question: "How well did we understand what matters to your family?",
      lowLabel: "Not at all",
      highLabel: "Completely understood"
    },
    {
      id: 'emotionalSupport',
      icon: <MessageCircle className="h-5 w-5 text-green-500" />,
      question: "Did you feel supported during difficult parts of the process?",
      lowLabel: "No support",
      highLabel: "Very supported"
    },
    {
      id: 'overallExperience',
      icon: <Sparkles className="h-5 w-5 text-purple-500" />,
      question: "How confident are you that this will help your family?",
      lowLabel: "Not confident",
      highLabel: "Very confident"
    }
  ];

  const handleResponse = (value: string) => {
    const score = parseInt(value);
    setResponses({
      ...responses,
      [questions[currentQuestion].id]: score
    });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = () => {
    const feedbackData: EmpathyFeedbackData = {
      personalAssistantScore: responses.personalAssistant || 0,
      familyFocusScore: responses.familyFocus || 0,
      emotionalSupportScore: responses.emotionalSupport || 0,
      overallExperienceScore: responses.overallExperience || 0,
      feedback,
      timestamp: new Date(),
      context
    };

    // Track the feedback
    trackEmpatheticInteraction({
      type: 'help_accessed',
      context: 'empathy_feedback',
      emotionalTone: feedbackData.overallExperienceScore >= 7 ? 'positive' : 
                     feedbackData.overallExperienceScore >= 4 ? 'neutral' : 'negative',
      familyFocused: feedbackData.familyFocusScore >= 7
    });

    if (onComplete) {
      onComplete(feedbackData);
    }

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Thank You!</h3>
            <p className="text-muted-foreground">
              Your feedback helps us create a more caring experience for families like yours.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];

  if (inline) {
    return (
      <div className="inline-empathy-feedback p-4 bg-blue-50 rounded-lg">
        <p className="text-sm font-medium mb-3">{currentQ.question}</p>
        <RadioGroup onValueChange={handleResponse} className="flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
            <label key={value} className="cursor-pointer">
              <RadioGroupItem value={value.toString()} className="sr-only" />
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                transition-all duration-200 
                ${responses[currentQ.id] === value 
                  ? 'bg-blue-600 text-white scale-110' 
                  : 'bg-white hover:bg-blue-100'
                }
              `}>
                {value}
              </div>
            </label>
          ))}
        </RadioGroup>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{currentQ.lowLabel}</span>
          <span>{currentQ.highLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {currentQ.icon}
          Help Us Understand Your Experience
        </CardTitle>
        <CardDescription>
          Question {currentQuestion + 1} of {questions.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{currentQ.question}</h3>
          
          <RadioGroup 
            onValueChange={handleResponse} 
            value={responses[currentQ.id]?.toString()}
            className="space-y-2"
          >
            <div className="grid grid-cols-10 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                <label key={value} className="cursor-pointer">
                  <RadioGroupItem value={value.toString()} className="sr-only" />
                  <div className={`
                    w-full aspect-square rounded-lg flex items-center justify-center
                    text-sm font-medium transition-all duration-200 border-2
                    ${responses[currentQ.id] === value 
                      ? 'bg-blue-600 text-white border-blue-600 scale-110' 
                      : 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300'
                    }
                  `}>
                    {value}
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{currentQ.lowLabel}</span>
              <span>{currentQ.highLabel}</span>
            </div>
          </RadioGroup>
        </div>

        {currentQuestion === questions.length - 1 && (
          <div className="space-y-3">
            <Label htmlFor="feedback">
              What would make this feel more personal and caring? (Optional)
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Your thoughts help us improve..."
              rows={4}
            />
          </div>
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          {currentQuestion === questions.length - 1 ? (
            <Button 
              onClick={handleSubmit}
              disabled={!responses[currentQ.id]}
            >
              Submit Feedback
            </Button>
          ) : (
            <Button 
              onClick={() => handleResponse(responses[currentQ.id]?.toString() || '5')}
              disabled={!responses[currentQ.id]}
            >
              Next Question
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex gap-1">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                index <= currentQuestion ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmpathyFeedback;
