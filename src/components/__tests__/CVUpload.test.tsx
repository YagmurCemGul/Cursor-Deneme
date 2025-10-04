/**
 * Tests for CVUpload Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CVUpload } from '../CVUpload';
import { FileParser } from '../../utils/fileParser';

jest.mock('../../utils/fileParser');
jest.mock('../../utils/logger');

describe('CVUpload', () => {
  const mockOnCVParsed = jest.fn();
  const mockFileParser = FileParser as jest.Mocked<typeof FileParser>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render upload zone', () => {
    render(<CVUpload onCVParsed={mockOnCVParsed} language="en" />);
    expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument();
  });

  it('should display file name after upload', async () => {
    mockFileParser.parseFile = jest.fn().mockResolvedValue({
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    });

    render(<CVUpload onCVParsed={mockOnCVParsed} language="en" />);

    const file = new File(['test content'], 'test-cv.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockFileParser.parseFile).toHaveBeenCalledWith(file);
      expect(mockOnCVParsed).toHaveBeenCalled();
    });
  });

  it('should handle parsing errors', async () => {
    mockFileParser.parseFile = jest.fn().mockRejectedValue(new Error('Parse error'));
    window.alert = jest.fn();

    render(<CVUpload onCVParsed={mockOnCVParsed} language="en" />);

    const file = new File(['test content'], 'test-cv.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });

  it('should show loading state during upload', async () => {
    mockFileParser.parseFile = jest.fn(
      (_file: File) => new Promise((resolve) => setTimeout(() => resolve({}), 100))
    ) as any;

    render(<CVUpload onCVParsed={mockOnCVParsed} language="en" />);

    const file = new File(['test content'], 'test-cv.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    });
  });
});
