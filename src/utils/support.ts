interface SupportOptions {
  error?: Error;
  context?: string;
  userMessage?: string;
}

interface SupportContext {
  timestamp: string;
  userAgent: string;
  url: string;
  errorMessage?: string;
  errorStack?: string;
  context?: string;
  userMessage?: string;
  savedData: Record<string, unknown>;
}

export const contactSupport = async (options: SupportOptions = {}) => {
  const { error, context, userMessage } = options;

  // Gather context for support
  const supportContext: SupportContext = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    errorMessage: error?.message,
    errorStack: error?.stack,
    context,
    userMessage,
    // Include any saved form data to help user continue
    savedData: getSavedFormData()
  };
  
  // Show immediate feedback
  showSupportModal(supportContext);
  
  try {
    // Send to support system
    const response = await fetch('/api/support/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supportContext)
    });
    
    if (response.ok) {
      const { ticketId } = await response.json();
      updateSupportModal('success', ticketId);
    } else {
      updateSupportModal('fallback');
    }
  } catch (e) {
    // Provide fallback support options
    updateSupportModal('fallback');
  }
};

<<<<<<< HEAD
interface SupportContext {
  timestamp: string;
  userAgent: string;
  url: string;
  errorMessage?: string;
  errorStack?: string;
  context?: string;
  userMessage?: string;
  savedData: Record<string, unknown>;
}

=======
>>>>>>> def8bce230b3756e164733a99e06fe0f070332f2
const showSupportModal = (context: SupportContext) => {
  // This would integrate with your modal system
  // For now, we'll use a custom event
  window.dispatchEvent(new CustomEvent('show-support-modal', {
    detail: {
      title: "Let's Get You Some Help",
      message: "I understand this is frustrating. Our support team is ready to help you personally.",
      context
    }
  }));
};

const updateSupportModal = (status: 'success' | 'fallback', ticketId?: string) => {
  window.dispatchEvent(new CustomEvent('update-support-modal', {
    detail: {
      status,
      ticketId,
      fallbackOptions: status === 'fallback' ? {
        phone: '1-800-LEGACY-HELP',
        email: 'support@legacyplan.com',
        chat: true
      } : undefined
    }
  }));
};

const getSavedFormData = (): Record<string, unknown> => {
  // Retrieve any auto-saved form data
  try {
    return JSON.parse(localStorage.getItem('autosaved-form-data') || '{}');
  } catch {
    return {};
  }
};

// Alternative support channels
export const supportChannels = {
  phone: {
    number: '1-800-LEGACY-HELP',
    hours: 'Monday-Friday 9AM-6PM EST',
    message: 'Our caring support team is ready to help'
  },
  email: {
    address: 'support@legacyplan.com',
    responseTime: 'Usually within 2 hours',
    message: 'Send us your questions and we\'ll help you personally'
  },
  chat: {
    available: true,
    message: 'Chat with a real person who understands'
  }
};

// Export helper to show support options inline
export const showInlineSupport = () => {
  const supportHTML = `
    <div class="inline-support-options">
      <p class="support-header">Need help? We're here for you:</p>
      <div class="support-channels">
        <button onclick="window.open('tel:${supportChannels.phone.number}', '_self')">
          📞 Call ${supportChannels.phone.number}
        </button>
        <button onclick="window.location.href='mailto:${supportChannels.email.address}'">
          ✉️ Email Support
        </button>
        <button onclick="window.openChat()">
          💬 Start Live Chat
        </button>
      </div>
    </div>
  `;
  
  return supportHTML;
};
