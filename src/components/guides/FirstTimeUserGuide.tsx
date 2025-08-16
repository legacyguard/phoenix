import React, { useEffect, useRef } from 'react';
import { ShepherdJourneyProvider, useShepherd } from 'react-shepherd';
import Shepherd from 'shepherd.js';

const FirstTimeUserGuideContent: React.FC = () => {
  const { shepherd } = useShepherd();
  const tourRef = useRef<Shepherd.Tour | null>(null);

  useEffect(() => {
    // Check if this is the first time showing the guide
    const firstTimeGuideShown = localStorage.getItem('firstTimeGuideShown');
    
    if (firstTimeGuideShown === 'false' || firstTimeGuideShown === null) {
      // Start the tour after a short delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (tourRef.current) {
          tourRef.current.start();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const tourOptions = {
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-custom',
      scrollTo: true
    },
    useModalOverlay: true
  };

  const steps = [
    {
      id: 'welcome',
      text: `
        <div class="text-center">
          <h3 class="text-lg font-semibold mb-2">Welcome to Your Life Inventory Dashboard</h3>
          <p>Let's take a quick tour of your personalized dashboard. This is your command center for securing what matters most.</p>
        </div>
      `,
      buttons: [
        {
          text: 'Skip Tour',
          action: () => {
            tourRef.current?.cancel();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Start Tour',
          action: () => {
            tourRef.current?.next();
          },
          classes: 'shepherd-button-primary'
        }
      ]
    },
    {
      id: 'financial-security',
      attachTo: {
        element: '#life-area-financial-security',
        on: 'bottom'
      },
      text: `
        <div>
          <h4 class="font-semibold mb-2">Financial Security</h4>
          <p>This is your financial foundation. We'll help you secure and organize your financial accounts so your loved ones can access them when needed.</p>
        </div>
      `,
      buttons: [
        {
          text: 'Previous',
          action: () => {
            tourRef.current?.back();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            tourRef.current?.next();
          },
          classes: 'shepherd-button-primary'
        }
      ]
    },
    {
      id: 'legal-documents',
      attachTo: {
        element: '#life-area-legal-documents',
        on: 'top'
      },
      text: `
        <div>
          <h4 class="font-semibold mb-2">Legal Documents</h4>
          <p>Essential legal documents that ensure your wishes are respected and your family is protected. We'll guide you through creating each one.</p>
        </div>
      `,
      buttons: [
        {
          text: 'Previous',
          action: () => {
            tourRef.current?.back();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            tourRef.current?.next();
          },
          classes: 'shepherd-button-primary'
        }
      ]
    },
    {
      id: 'personalized-areas',
      attachTo: {
        element: '[id^="life-area-"]:nth-of-type(2)',
        on: 'left'
      },
      text: `
        <div>
          <h4 class="font-semibold mb-2">Your Personalized Areas</h4>
          <p>Based on your onboarding answers, we've customized these areas specifically for your situation. Each one highlights what needs your attention most.</p>
        </div>
      `,
      buttons: [
        {
          text: 'Previous',
          action: () => {
            tourRef.current?.back();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            tourRef.current?.next();
          },
          classes: 'shepherd-button-primary'
        }
      ]
    },
    {
      id: 'start-first-task',
      attachTo: {
        element: '#life-area-financial-security button',
        on: 'top'
      },
      text: `
        <div>
          <h4 class="font-semibold mb-2">Ready to Begin</h4>
          <p>Click "Start First Step" on any card to begin a guided micro-task sequence. Each task takes just 5 minutes and brings you closer to complete peace of mind.</p>
        </div>
      `,
      buttons: [
        {
          text: 'Previous',
          action: () => {
            tourRef.current?.back();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Finish Tour',
          action: () => {
            tourRef.current?.complete();
          },
          classes: 'shepherd-button-primary'
        }
      ]
    }
  ];

  const handleTourComplete = () => {
    localStorage.setItem('firstTimeGuideShown', 'true');
  };

  const handleTourCancel = () => {
    localStorage.setItem('firstTimeGuideShown', 'true');
  };

  useEffect(() => {
    if (shepherd) {
      // Create the tour using the new API
      const tour = new Shepherd.Tour({
        ...tourOptions,
        steps: steps
      });

      tour.on('complete', handleTourComplete);
      tour.on('cancel', handleTourCancel);

      tourRef.current = tour;
    }
  }, [shepherd]);

  return null;
};

const FirstTimeUserGuide: React.FC = () => {
  return (
    <ShepherdJourneyProvider
      steps={steps}
      tourOptions={tourOptions}
    >
      <FirstTimeUserGuideContent />
    </ShepherdJourneyProvider>
  );
};

export default FirstTimeUserGuide;
