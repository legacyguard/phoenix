import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PrivacyControlPanel from '../PrivacyControlPanel';

// Mock the dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue('mock-token'),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('PrivacyControlPanel', () => {
  const mockSettings = {
    defaultProcessingMode: 'hybrid' as const,
    autoDeleteAfter: 30,
    aiFeatureToggles: {
      expirationIntelligence: true,
      behavioralNudges: false,
      relationshipDetection: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as unknown as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    });
  });

  it('should render the privacy control panel', async () => {
    render(<PrivacyControlPanel />);

    await waitFor(() => {
      expect(screen.getByText('privacy.title')).toBeInTheDocument();
    });
  });

  it('should display loading state initially', () => {
    render(<PrivacyControlPanel />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should load and display privacy settings', async () => {
    render(<PrivacyControlPanel />);

    await waitFor(() => {
      expect(screen.getByText('privacy.processingMode')).toBeInTheDocument();
      expect(screen.getByText('privacy.autoDelete')).toBeInTheDocument();
      expect(screen.getByText('privacy.aiFeatures')).toBeInTheDocument();
    });
  });

  it('should handle processing mode change', async () => {
    const user = userEvent.setup();
    render(<PrivacyControlPanel />);

    await waitFor(() => {
      expect(screen.getByText('privacy.processingMode')).toBeInTheDocument();
    });

    const processingModeSelect = screen.getByRole('combobox');
    await user.click(processingModeSelect);

    // Select local only mode
    const localOnlyOption = screen.getByText('privacy.processingModes.localOnly');
    await user.click(localOnlyOption);

    expect(processingModeSelect).toHaveValue('local_only');
  });

  it('should handle auto delete setting change', async () => {
    const user = userEvent.setup();
    render(<PrivacyControlPanel />);

    await waitFor(() => {
      expect(screen.getByText('privacy.autoDelete')).toBeInTheDocument();
    });

    const autoDeleteSelect = screen.getByDisplayValue('30');
    await user.click(autoDeleteSelect);

    // Select 90 days
    const ninetyDaysOption = screen.getByText('privacy.autoDeleteOptions.90');
    await user.click(ninetyDaysOption);

    expect(autoDeleteSelect).toHaveValue('90');
  });

  it('should toggle AI feature switches', async () => {
    const user = userEvent.setup();
    render(<PrivacyControlPanel />);

    await waitFor(() => {
      expect(screen.getByText('privacy.aiFeatures.expirationIntelligence')).toBeInTheDocument();
    });

    // Find and toggle the expiration intelligence switch
    const expirationSwitch = screen.getByRole('switch', { name: /expiration intelligence/i });
    await user.click(expirationSwitch);

    // The switch should be toggled off
    expect(expirationSwitch).not.toBeChecked();
  });

  it('should save settings successfully', async () => {
    const user = userEvent.setup();
    const { toast } = await import('sonner');
    
    (global.fetch as unknown as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSettings),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    render(<PrivacyControlPanel />);

    await waitFor(() => {
      expect(screen.getByText('privacy.saveSettings')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save settings/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/privacy-settings', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockSettings),
      });
      expect(toast.success).toHaveBeenCalledWith('privacy.settingsSaved');
    });
  });

  it('should handle save error', async () => {
    const user = userEvent.setup();
    const { toast } = await import('sonner');
    
    (global.fetch as unknown as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSettings),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

    render(<PrivacyControlPanel />);

    await waitFor(() => {
      expect(screen.getByText('privacy.saveSettings')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save settings/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('privacy.saveError');
    });
  });

  it('should handle load error', async () => {
    const { toast } = await import('sonner');
    
    (global.fetch as unknown as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<PrivacyControlPanel />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('privacy.loadError');
    });
  });

  it('should show saving state when saving', async () => {
    const user = userEvent.setup();
    
    (global.fetch as unknown as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSettings),
      })
      .mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<PrivacyControlPanel />);

    await waitFor(() => {
      expect(screen.getByText('privacy.saveSettings')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save settings/i });
    await user.click(saveButton);

    // Should show loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it('should handle nested setting changes correctly', async () => {
    const user = userEvent.setup();
    render(<PrivacyControlPanel />);

    await waitFor(() => {
      expect(screen.getByText('privacy.aiFeatures.behavioralNudges')).toBeInTheDocument();
    });

    // Toggle behavioral nudges (should be off initially based on mock data)
    const behavioralNudgesSwitch = screen.getByRole('switch', { name: /behavioral nudges/i });
    await user.click(behavioralNudgesSwitch);

    // Should be toggled on
    expect(behavioralNudgesSwitch).toBeChecked();
  });

  it('should display family access management section', async () => {
    render(<PrivacyControlPanel />);

    await waitFor(() => {
      expect(screen.getByText('privacy.familyAccess')).toBeInTheDocument();
    });
  });
}); 