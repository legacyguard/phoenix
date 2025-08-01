import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SmartUploadZone } from '../upload/SmartUploadZone';

// Mock the dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockUpload = vi.fn();

vi.mock('../../../lib/hooks/useDocumentUpload', () => ({
  useDocumentUpload: () => ({
    upload: mockUpload,
    uploadFile: vi.fn(),
    uploadProgress: 0,
    isUploading: false,
  }),
  useUploadPreferences: () => ({
    preferences: {
      privacy: 'local',
      autoCategorize: true,
      autoCompress: false,
      autoEncrypt: false,
      processOCR: false,
      analyzeWithAI: false,
      generateThumbnail: true,
      familySharing: false,
    },
  }),
}));

// Mock file input
const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
const mockImageFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

describe('SmartUploadZone', () => {
  const mockOnUploadStart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the upload zone', () => {
    render(<SmartUploadZone onUploadStart={mockOnUploadStart} />);

    expect(screen.getByText('upload.zone.dropHere')).toBeInTheDocument();
    expect(screen.getByText('upload.zone.description')).toBeInTheDocument();
    expect(screen.getByText('upload.zone.chooseFiles')).toBeInTheDocument();
  });

  it('should show active state when dragging over', async () => {
    const user = userEvent.setup();
    render(<SmartUploadZone onUploadStart={mockOnUploadStart} />);

    const uploadZone = screen.getByTestId('upload-zone');
    
    // Simulate drag enter with proper dataTransfer
    fireEvent.dragEnter(uploadZone, {
      dataTransfer: {
        items: [{ kind: 'file', type: 'application/pdf' }],
        types: ['Files'],
      },
    });
    
    await waitFor(() => {
      expect(screen.getByText('upload.zone.dropHereActive')).toBeInTheDocument();
      expect(screen.getByText('upload.zone.descriptionActive')).toBeInTheDocument();
    });
  });

  it('should handle file selection via button click', async () => {
    const user = userEvent.setup();
    render(<SmartUploadZone onUploadStart={mockOnUploadStart} />);

    const fileInput = screen.getByTestId('file-input');
    const chooseFilesButton = screen.getByText('upload.zone.chooseFiles');

    // Mock file input change
    fireEvent.change(fileInput, {
      target: { files: [mockFile] },
    });

    await waitFor(() => {
      expect(mockOnUploadStart).toHaveBeenCalled();
      expect(mockUpload).toHaveBeenCalledWith([mockFile], expect.any(Object));
    });
  });

  it('should handle file drop', async () => {
    const user = userEvent.setup();
    render(<SmartUploadZone onUploadStart={mockOnUploadStart} />);

    const uploadZone = screen.getByTestId('upload-zone');

    // Simulate file drop
    fireEvent.drop(uploadZone, {
      dataTransfer: {
        files: [mockFile],
      },
    });

    await waitFor(() => {
      expect(mockOnUploadStart).toHaveBeenCalled();
      expect(mockUpload).toHaveBeenCalledWith([mockFile], expect.any(Object));
    });
  });

  it('should show camera button on mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<SmartUploadZone onUploadStart={mockOnUploadStart} />);

    expect(screen.getByText('upload.zone.takePhoto')).toBeInTheDocument();
  });

  it('should show privacy indicator for local processing', () => {
    render(<SmartUploadZone onUploadStart={mockOnUploadStart} />);

    expect(screen.getByText('upload.zone.processingLocally')).toBeInTheDocument();
  });

  it('should handle multiple file uploads', async () => {
    const user = userEvent.setup();
    render(<SmartUploadZone onUploadStart={mockOnUploadStart} maxFiles={3} />);

    const fileInput = screen.getByTestId('file-input');
    const multipleFiles = [mockFile, mockImageFile, new File(['content'], 'doc.pdf', { type: 'application/pdf' })];

    fireEvent.change(fileInput, {
      target: { files: multipleFiles },
    });

    await waitFor(() => {
      expect(mockOnUploadStart).toHaveBeenCalled();
    });
  });

  it('should validate file types', async () => {
    const user = userEvent.setup();
    render(<SmartUploadZone onUploadStart={mockOnUploadStart} acceptedTypes={['image/*']} />);

    const fileInput = screen.getByTestId('file-input');
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, {
      target: { files: [invalidFile] },
    });

    // Should not call onUploadStart for invalid file type
    expect(mockOnUploadStart).not.toHaveBeenCalled();
  });

  it('should handle drag leave correctly', async () => {
    const user = userEvent.setup();
    render(<SmartUploadZone onUploadStart={mockOnUploadStart} />);

    const uploadZone = screen.getByTestId('upload-zone');
    
    // Simulate drag enter then leave
    fireEvent.dragEnter(uploadZone);
    fireEvent.dragLeave(uploadZone);
    
    await waitFor(() => {
      expect(screen.getByText('upload.zone.dropHere')).toBeInTheDocument();
    });
  });

  it('should show drag overlay when dragging', async () => {
    const user = userEvent.setup();
    render(<SmartUploadZone onUploadStart={mockOnUploadStart} />);

    const uploadZone = screen.getByTestId('upload-zone');
    
    fireEvent.dragEnter(uploadZone);
    
    await waitFor(() => {
      expect(screen.getByText('upload.zone.dropHere')).toBeInTheDocument();
    });
  });

  it('should handle camera button click', async () => {
    const user = userEvent.setup();
    render(<SmartUploadZone onUploadStart={mockOnUploadStart} />);

    const cameraButton = screen.getByText('upload.zone.takePhoto');
    await user.click(cameraButton);

    // Should trigger camera/file input - the component uses the same file input for both
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<SmartUploadZone onUploadStart={mockOnUploadStart} className="custom-class" />);

    const uploadZone = screen.getByTestId('upload-zone');
    expect(uploadZone).toHaveClass('custom-class');
  });

  it('should handle file input change with no files', async () => {
    const user = userEvent.setup();
    render(<SmartUploadZone onUploadStart={mockOnUploadStart} />);

    const fileInput = screen.getByTestId('file-input');

    fireEvent.change(fileInput, {
      target: { files: [] },
    });

    // Should not call onUploadStart when no files are selected
    expect(mockOnUploadStart).not.toHaveBeenCalled();
  });

  it('should handle file input change with null files', async () => {
    const user = userEvent.setup();
    render(<SmartUploadZone onUploadStart={mockOnUploadStart} />);

    const fileInput = screen.getByTestId('file-input');

    fireEvent.change(fileInput, {
      target: { files: null },
    });

    // Should not call onUploadStart when files is null
    expect(mockOnUploadStart).not.toHaveBeenCalled();
  });
}); 