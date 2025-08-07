import React, { useState } from 'react';
import {
  EmpatheticLoader,
  EmpatheticTransition,
  EmpatheticButton,
  EmpatheticError,
  EmpatheticValidation,
  ProgressStory
} from './index';
import type { ProgressStep } from './index';

/**
 * Example usage of all empathetic loading components
 */
const EmpatheticLoadingExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<string>('');
  const [showTransition, setShowTransition] = useState(false);
  const [progress, setProgress] = useState(0);

  const progressSteps: ProgressStep[] = [
    {
      id: 'gather-info',
      title: 'Gather Information',
      description: 'Collecting your family details',
      completed: true
    },
    {
      id: 'analyze',
      title: 'Analyze Needs',
      description: 'Understanding your requirements',
      completed: true,
      current: true
    },
    {
      id: 'create-plan',
      title: 'Create Plan',
      description: 'Building your protection plan',
      completed: false
    },
    {
      id: 'finalize',
      title: 'Finalize',
      description: 'Completing your setup',
      completed: false
    }
  ];

  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold mb-4">Empathetic Loading Components</h2>

      {/* Basic Loader */}
      <section className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Loader</h3>
        {loading ? (
          <EmpatheticLoader
            context="family"
            action="loading"
            emotionalState="first_time"
          />
        ) : (
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 3000);
            }}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Show Loader
          </button>
        )}
      </section>

      {/* Loader with Progress */}
      <section className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Loader with Progress</h3>
        <EmpatheticLoader
          context="will"
          action="generating"
          progress={progress}
          emotionalState="complex_task"
        />
        <button
          onClick={() => {
            let p = 0;
            const interval = setInterval(() => {
              p += 10;
              setProgress(p);
              if (p >= 100) {
                clearInterval(interval);
                setTimeout(() => setProgress(0), 2000);
              }
            }, 500);
          }}
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
        >
          Start Progress
        </button>
      </section>

      {/* Page Transition */}
      <section className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Page Transition</h3>
        {showTransition && (
          <EmpatheticTransition
            from="dashboard"
            to="assets"
            onComplete={() => setShowTransition(false)}
          />
        )}
        <button
          onClick={() => setShowTransition(true)}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Show Transition
        </button>
      </section>

      {/* Empathetic Buttons */}
      <section className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Empathetic Buttons</h3>
        <div className="flex space-x-4">
          <EmpatheticButton
            action="save"
            loading={saving}
            loadingContext="Keeping this safe..."
            onClick={() => {
              setSaving(true);
              setTimeout(() => setSaving(false), 2000);
            }}
          >
            Save
          </EmpatheticButton>
          <EmpatheticButton action="share" variant="outline">
            Share
          </EmpatheticButton>
          <EmpatheticButton action="delete" variant="destructive">
            Delete
          </EmpatheticButton>
        </div>
      </section>

      {/* Error Handling */}
      <section className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Error Handling</h3>
        {error ? (
          <EmpatheticError
            type="save_failed"
            onRetry={() => setError(null)}
            onDismiss={() => setError(null)}
          />
        ) : (
          <button
            onClick={() => setError('save_failed')}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Trigger Error
          </button>
        )}
      </section>

      {/* Form Validation */}
      <section className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Form Validation</h3>
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Enter guardian name"
              className="px-3 py-2 border rounded"
              onChange={(e) => {
                if (e.target.value.length === 0) {
                  setValidation('required');
                } else if (e.target.value.length < 3) {
                  setValidation('too_short');
                } else {
                  setValidation('success');
                }
              }}
            />
            <EmpatheticValidation
              type={validation as any}
              show={!!validation}
            />
          </div>
        </div>
      </section>

      {/* Progress Story */}
      <section className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Progress Story</h3>
        <ProgressStory
          steps={progressSteps}
          orientation="horizontal"
        />
      </section>
    </div>
  );
};

export default EmpatheticLoadingExample;
