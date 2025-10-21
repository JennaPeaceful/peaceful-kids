/**
 * Capacitor Storage Adapter for Supabase
 *
 * Provides reliable session persistence on native platforms using Capacitor Preferences
 * instead of localStorage which can have sync issues on Android/iOS
 */

import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export class CapacitorStorage {
  async getItem(key: string): Promise<string | null> {
    // On web, use localStorage for compatibility
    if (!Capacitor.isNativePlatform()) {
      return localStorage.getItem(key);
    }

    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch (error) {
      console.error('[CapacitorStorage] Error getting item:', key, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    // On web, use localStorage for compatibility
    if (!Capacitor.isNativePlatform()) {
      localStorage.setItem(key, value);
      return;
    }

    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.error('[CapacitorStorage] Error setting item:', key, error);
    }
  }

  async removeItem(key: string): Promise<void> {
    // On web, use localStorage for compatibility
    if (!Capacitor.isNativePlatform()) {
      localStorage.removeItem(key);
      return;
    }

    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error('[CapacitorStorage] Error removing item:', key, error);
    }
  }
}
