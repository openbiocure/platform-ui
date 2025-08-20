// Simple encryption utilities for frontend
// Note: This is for client-side data protection, not server security
// Real encryption happens on the backend

import { getSecureItem } from '../services/authService';

// Base64 encoding/decoding utilities
export const base64Encode = (str: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (error) {
    console.error('Base64 encoding failed:', error);
    return str;
  }
};

export const base64Decode = (str: string): string => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (error) {
    console.error('Base64 decoding failed:', error);
    return str;
  }
};

// Simple XOR encryption for client-side data obfuscation
// This is NOT secure encryption - use only for UI state protection
const xorEncrypt = (data: string, key: string): string => {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(
      data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
};

const xorDecrypt = (data: string, key: string): string => {
  return xorEncrypt(data, key); // XOR is symmetric
};

// Get encryption key from session or generate a default one
const getEncryptionKey = (): string => {
  const sessionKey = getSecureItem('session_key');
  if (sessionKey) {
    return sessionKey;
  }
  
  // Fallback key (not secure, but better than nothing)
  return 'openbiocure_default_key_' + (window.location.hostname || 'localhost');
};

// Encrypt sensitive form data before transmission
export const encryptFormData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    const key = getEncryptionKey();
    const encrypted = xorEncrypt(jsonString, key);
    return base64Encode(encrypted);
  } catch (error) {
    console.error('Encryption failed:', error);
    return JSON.stringify(data); // Fallback to unencrypted
  }
};

// Decrypt form data after receiving
export const decryptFormData = (encryptedData: string): any => {
  try {
    const key = getEncryptionKey();
    const decoded = base64Decode(encryptedData);
    const decrypted = xorDecrypt(decoded, key);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    try {
      return JSON.parse(encryptedData); // Try parsing as unencrypted
    } catch {
      return {}; // Return empty object if all fails
    }
  }
};

// Encrypt passwords before sending to backend
// Note: Backend should use proper bcrypt/scrypt hashing
export const hashPassword = async (password: string): Promise<string> => {
  try {
    // Use Web Crypto API if available
    if (crypto && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + getEncryptionKey());
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (error) {
    console.error('Crypto API failed:', error);
  }
  
  // Fallback to simple encoding (not secure)
  return base64Encode(password + getEncryptionKey());
};

// Secure random string generation
export const generateSecureRandom = (length: number = 32): string => {
  try {
    if (crypto && crypto.getRandomValues) {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
  } catch (error) {
    console.error('Secure random generation failed:', error);
  }
  
  // Fallback to Math.random (not cryptographically secure)
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Secure storage utilities
export const secureStore = {
  // Store encrypted data in localStorage
  set: (key: string, value: any): void => {
    try {
      const encrypted = encryptFormData(value);
      localStorage.setItem(`secure_${key}`, encrypted);
    } catch (error) {
      console.error('Secure store failed:', error);
    }
  },

  // Retrieve and decrypt data from localStorage
  get: (key: string): any => {
    try {
      const encrypted = localStorage.getItem(`secure_${key}`);
      if (!encrypted) return null;
      return decryptFormData(encrypted);
    } catch (error) {
      console.error('Secure retrieve failed:', error);
      return null;
    }
  },

  // Remove encrypted data
  remove: (key: string): void => {
    try {
      localStorage.removeItem(`secure_${key}`);
    } catch (error) {
      console.error('Secure remove failed:', error);
    }
  },

  // Clear all secure storage
  clear: (): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('secure_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Secure clear failed:', error);
    }
  }
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password should be at least 8 characters long');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain uppercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain numbers');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain special characters');
  }

  if (password.length >= 12) {
    score += 1;
  }

  return {
    isValid: score >= 4,
    score,
    feedback
  };
};

export default {
  encryptFormData,
  decryptFormData,
  hashPassword,
  generateSecureRandom,
  secureStore,
  validatePasswordStrength,
};
