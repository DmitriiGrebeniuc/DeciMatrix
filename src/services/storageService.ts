import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY, STORAGE_VERSION } from '../constants/storage';
import type { Decision } from '../types/decision';

type AppStorage = {
  version: number;
  decisions: Decision[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDecision(value: unknown): value is Decision {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    (value.status === 'draft' || value.status === 'completed') &&
    Array.isArray(value.options) &&
    Array.isArray(value.criteria) &&
    Array.isArray(value.scores)
  );
}

function isAppStorage(value: unknown): value is AppStorage {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.version === 'number' &&
    Array.isArray(value.decisions) &&
    value.decisions.every(isDecision)
  );
}

export async function loadDecisions(): Promise<Decision[]> {
  try {
    const rawValue = await AsyncStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(rawValue);

    if (!isAppStorage(parsedValue)) {
      return [];
    }

    return parsedValue.decisions;
  } catch (error) {
    console.warn('Failed to load decisions from storage.', error);
    return [];
  }
}

export async function saveDecisions(decisions: Decision[]): Promise<void> {
  const storageValue: AppStorage = {
    version: STORAGE_VERSION,
    decisions,
  };

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storageValue));
  } catch (error) {
    console.warn('Failed to save decisions to storage.', error);
  }
}

export async function clearDecisions(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear decisions from storage.', error);
  }
}
