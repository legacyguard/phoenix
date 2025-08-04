import React from 'react';
import { useNavigate } from 'react-router-dom';

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Subscription Canceled</h1>
      <p className="mb-6">Your subscription process has been canceled. No charges were made.</p>
      <button
        onClick={() => navigate('/pricing')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Return to Pricing
      </button>
    </div>
  );
};

export default SubscriptionCancel;

