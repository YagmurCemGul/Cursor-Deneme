/**
 * Tests for AISettings Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AISettings } from '../AISettings';
import { StorageService } from '../../utils/storage';

jest.mock('../../utils/storage');
jest.mock('../../utils/logger');

const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;

describe('AISettings', () => {
  const mockOnConfigChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageService.getAIProvider = jest.fn().mockResolvedValue('openai');
    mockStorageService.getAPIKeys = jest.fn().mockResolvedValue({});
    mockStorageService.getAIModel = jest.fn().mockResolvedValue('gpt-4o-mini');
    mockStorageService.getSettings = jest.fn().mockResolvedValue({});
  });

  it('should render AI provider selection', async () => {
    render(<AISettings language="en" onConfigChange={mockOnConfigChange} />);

    await waitFor(() => {
      expect(screen.getByText(/AI Provider/i)).toBeInTheDocument();
    });
  });

  it('should allow changing AI provider', async () => {
    render(<AISettings language="en" onConfigChange={mockOnConfigChange} />);

    await waitFor(() => {
      const providerButtons = screen.getAllByRole('button', { name: /openai|gemini|claude/i });
      expect(providerButtons.length).toBeGreaterThan(0);
    });
  });

  it('should display API key input for selected provider', async () => {
    render(<AISettings language="en" onConfigChange={mockOnConfigChange} />);

    await waitFor(() => {
      const apiKeyInput = screen.getByPlaceholderText(/api.*key/i);
      expect(apiKeyInput).toBeInTheDocument();
    });
  });

  it('should save settings when save button is clicked', async () => {
    mockStorageService.saveAIProvider = jest.fn().mockResolvedValue(undefined);
    mockStorageService.saveAPIKeys = jest.fn().mockResolvedValue(undefined);
    mockStorageService.saveAIModel = jest.fn().mockResolvedValue(undefined);
    mockStorageService.saveSettings = jest.fn().mockResolvedValue(undefined);

    render(<AISettings language="en" onConfigChange={mockOnConfigChange} />);

    await waitFor(() => {
      const saveButton = screen.getByText(/save/i);
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockStorageService.saveAIProvider).toHaveBeenCalled();
    });
  });

  it('should display model selection dropdown', async () => {
    render(<AISettings language="en" onConfigChange={mockOnConfigChange} />);

    await waitFor(() => {
      const modelSelect = screen.getByRole('combobox');
      expect(modelSelect).toBeInTheDocument();
    });
  });

  it('should show temperature slider', async () => {
    render(<AISettings language="en" onConfigChange={mockOnConfigChange} />);

    await waitFor(() => {
      const temperatureSlider = screen.getByRole('slider');
      expect(temperatureSlider).toBeInTheDocument();
    });
  });
});
