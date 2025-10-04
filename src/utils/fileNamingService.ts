/**
 * File Naming Service
 * Handles custom file naming templates with variable substitution
 */

import { NamingTemplate, NamingVariables } from '../types';
import { StorageService } from './storage';

export class FileNamingService {
  private static readonly STORAGE_KEY = 'naming_templates';
  private static readonly DEFAULT_TEMPLATES: NamingTemplate[] = [
    {
      id: 'default',
      name: 'Default (FirstName_LastName_Type_Date)',
      template: '{firstName}_{lastName}_{type}_{date}.{format}',
      description: 'Standard naming convention',
      createdAt: new Date().toISOString(),
      isDefault: true,
    },
    {
      id: 'simple',
      name: 'Simple (Name_Type)',
      template: '{firstName}_{lastName}_{type}.{format}',
      description: 'Minimal naming without date',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'detailed',
      name: 'Detailed (Name_Company_Position_Date_Time)',
      template: '{firstName}_{lastName}_{company}_{position}_{date}_{time}.{format}',
      description: 'Comprehensive naming with company and position',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'professional',
      name: 'Professional (LastName_FirstName_Type_Date)',
      template: '{lastName}_{firstName}_{type}_{date}.{format}',
      description: 'Last name first format',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'compact',
      name: 'Compact (Initials_Type_Date)',
      template: '{firstInitial}{lastInitial}_{type}_{date}.{format}',
      description: 'Uses initials for brevity',
      createdAt: new Date().toISOString(),
    },
  ];

  /**
   * Apply a naming template with variable substitution
   */
  static applyTemplate(template: string, variables: NamingVariables): string {
    let result = template;

    // Add derived variables
    const firstInitial = variables.firstName.charAt(0).toUpperCase();
    const lastInitial = variables.lastName.charAt(0).toUpperCase();

    const allVariables = {
      ...variables,
      firstInitial,
      lastInitial,
    };

    // Replace all variables in the template
    Object.entries(allVariables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value || '');
    });

    // Clean up any remaining empty variables or double underscores
    result = result.replace(/_+/g, '_'); // Replace multiple underscores with single
    result = result.replace(/_\./g, '.'); // Remove underscore before extension
    result = result.replace(/^_|_$/g, ''); // Remove leading/trailing underscores

    // Sanitize filename (remove invalid characters)
    result = this.sanitizeFileName(result);

    return result;
  }

  /**
   * Sanitize file name to remove invalid characters
   */
  static sanitizeFileName(fileName: string): string {
    // Replace invalid characters with underscore
    return fileName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
  }

  /**
   * Get all naming templates
   */
  static async getTemplates(): Promise<NamingTemplate[]> {
    const stored = await StorageService.get<NamingTemplate[]>(this.STORAGE_KEY);
    return stored || this.DEFAULT_TEMPLATES;
  }

  /**
   * Get template by ID
   */
  static async getTemplate(id: string): Promise<NamingTemplate | undefined> {
    const templates = await this.getTemplates();
    return templates.find((t) => t.id === id);
  }

  /**
   * Get default template
   */
  static async getDefaultTemplate(): Promise<NamingTemplate> {
    const templates = await this.getTemplates();
    return templates.find((t) => t.isDefault) || this.DEFAULT_TEMPLATES[0]!;
  }

  /**
   * Save a new naming template
   */
  static async saveTemplate(template: Omit<NamingTemplate, 'id' | 'createdAt'>): Promise<void> {
    const templates = await this.getTemplates();

    // If this is set as default, unset other defaults
    if (template.isDefault) {
      templates.forEach((t) => (t.isDefault = false));
    }

    const newTemplate: NamingTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    templates.push(newTemplate);
    await StorageService.set(this.STORAGE_KEY, templates);
  }

  /**
   * Update an existing template
   */
  static async updateTemplate(id: string, updates: Partial<NamingTemplate>): Promise<void> {
    const templates = await this.getTemplates();
    const index = templates.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new Error('Template not found');
    }

    // If setting as default, unset other defaults
    if (updates.isDefault) {
      templates.forEach((t) => (t.isDefault = false));
    }

    templates[index] = { ...templates[index]!, ...updates };
    await StorageService.set(this.STORAGE_KEY, templates);
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(id: string): Promise<void> {
    let templates = await this.getTemplates();
    const template = templates.find((t) => t.id === id);

    if (!template) {
      throw new Error('Template not found');
    }

    // Don't allow deleting default templates
    if (this.DEFAULT_TEMPLATES.some((t) => t.id === id)) {
      throw new Error('Cannot delete default template');
    }

    templates = templates.filter((t) => t.id !== id);
    await StorageService.set(this.STORAGE_KEY, templates);
  }

  /**
   * Set a template as default
   */
  static async setDefaultTemplate(id: string): Promise<void> {
    const templates = await this.getTemplates();
    templates.forEach((t) => {
      t.isDefault = t.id === id;
    });
    await StorageService.set(this.STORAGE_KEY, templates);
  }

  /**
   * Preview a template with sample data
   */
  static previewTemplate(template: string): string {
    const sampleVariables: NamingVariables = {
      firstName: 'John',
      lastName: 'Doe',
      type: 'Resume',
      date: '2025-10-04',
      time: '14-30-00',
      company: 'TechCorp',
      position: 'SoftwareEngineer',
      format: 'pdf',
    };

    return this.applyTemplate(template, sampleVariables);
  }

  /**
   * Validate a template string
   */
  static validateTemplate(template: string): { valid: boolean; error?: string } {
    // Check for balanced braces
    const openBraces = (template.match(/{/g) || []).length;
    const closeBraces = (template.match(/}/g) || []).length;

    if (openBraces !== closeBraces) {
      return { valid: false, error: 'Unbalanced braces in template' };
    }

    // Check if template contains at least one variable
    if (!template.includes('{')) {
      return { valid: false, error: 'Template must contain at least one variable' };
    }

    // Check if template includes {format}
    if (!template.includes('{format}')) {
      return { valid: false, error: 'Template must include {format} for file extension' };
    }

    // Extract variables
    const variables = template.match(/{([^}]+)}/g);
    if (!variables) {
      return { valid: false, error: 'No valid variables found' };
    }

    // Check for valid variable names
    const validVariables = [
      'firstName',
      'lastName',
      'type',
      'date',
      'time',
      'company',
      'position',
      'format',
      'firstInitial',
      'lastInitial',
    ];

    const invalidVars = variables
      .map((v) => v.replace(/[{}]/g, ''))
      .filter((v) => !validVariables.includes(v));

    if (invalidVars.length > 0) {
      return {
        valid: false,
        error: `Invalid variables: ${invalidVars.join(', ')}. Valid variables are: ${validVariables.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Get available variables with descriptions
   */
  static getAvailableVariables(): Array<{ name: string; description: string; example: string }> {
    return [
      { name: 'firstName', description: 'User first name', example: 'John' },
      { name: 'lastName', description: 'User last name', example: 'Doe' },
      { name: 'firstInitial', description: 'First letter of first name', example: 'J' },
      { name: 'lastInitial', description: 'First letter of last name', example: 'D' },
      { name: 'type', description: 'Document type', example: 'Resume or CoverLetter' },
      { name: 'date', description: 'Current date', example: '2025-10-04' },
      { name: 'time', description: 'Current time', example: '14-30-00' },
      { name: 'company', description: 'Company name (optional)', example: 'TechCorp' },
      { name: 'position', description: 'Job position (optional)', example: 'SoftwareEngineer' },
      { name: 'format', description: 'File format (REQUIRED)', example: 'pdf' },
    ];
  }
}
