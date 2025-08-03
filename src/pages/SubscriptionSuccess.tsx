import React from 'react';
import { useNavigate } from 'react-router-dom';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Subscription Successful</h1>
      <p className="mb-6">Thank you for subscribing! Your premium access is now active.</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default SubscriptionSuccess;

