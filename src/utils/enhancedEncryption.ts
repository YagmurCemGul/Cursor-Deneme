/**
 * Enhanced Encryption
 * End-to-end encryption for sensitive CV data
 */

import { CVData } from '../types';
import { logger } from './logger';

export class EnhancedEncryption {
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async encryptCV(cvData: CVData, userPassword: string): Promise<string> {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await this.deriveKey(userPassword, salt);

      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(cvData));

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      // Combine salt + iv + encrypted data
      const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      result.set(salt, 0);
      result.set(iv, salt.length);
      result.set(new Uint8Array(encrypted), salt.length + iv.length);

      return btoa(String.fromCharCode(...result));
    } catch (error) {
      logger.error('Encryption failed:', error);
      throw new Error('Failed to encrypt CV data');
    }
  }

  async decryptCV(encrypted: string, userPassword: string): Promise<CVData> {
    try {
      const data = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));

      const salt = data.slice(0, 16);
      const iv = data.slice(16, 28);
      const ciphertext = data.slice(28);

      const key = await this.deriveKey(userPassword, salt);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );

      const decoder = new TextDecoder();
      const json = decoder.decode(decrypted);

      return JSON.parse(json);
    } catch (error) {
      logger.error('Decryption failed:', error);
      throw new Error('Failed to decrypt CV data. Wrong password?');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
  }

  generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const random = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(random)
      .map(x => charset[x % charset.length])
      .join('');
  }
}

export const encryption = new EnhancedEncryption();
