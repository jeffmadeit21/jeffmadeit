import { useState, useEffect, useCallback } from 'react';
import { JournalEntry, Mood } from '@/types/journal';

const STORAGE_KEY = 'journal_entries';

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

const loadEntries = (): JournalEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((entry: any) => ({
        ...entry,
        createdAt: new Date(entry.createdAt),
        updatedAt: new Date(entry.updatedAt),
      }));
    }
  } catch (error) {
    console.error('Failed to load entries:', error);
  }
  return [];
};

const saveEntries = (entries: JournalEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Failed to save entries:', error);
  }
};

export const useJournalEntries = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loaded = loadEntries();
    setEntries(loaded);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveEntries(entries);
    }
  }, [entries, isLoading]);

  const createEntry = useCallback((title: string, content: string, mood?: Mood): JournalEntry => {
    const now = new Date();
    const newEntry: JournalEntry = {
      id: generateId(),
      title,
      content,
      mood,
      createdAt: now,
      updatedAt: now,
    };
    setEntries(prev => [newEntry, ...prev]);
    return newEntry;
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<Pick<JournalEntry, 'title' | 'content' | 'mood'>>) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, ...updates, updatedAt: new Date() }
          : entry
      )
    );
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const searchEntries = useCallback((query: string): JournalEntry[] => {
    if (!query.trim()) return entries;
    const lower = query.toLowerCase();
    return entries.filter(
      entry =>
        entry.title.toLowerCase().includes(lower) ||
        entry.content.toLowerCase().includes(lower)
    );
  }, [entries]);

  const filterByMood = useCallback((mood: Mood | null): JournalEntry[] => {
    if (!mood) return entries;
    return entries.filter(entry => entry.mood === mood);
  }, [entries]);

  return {
    entries,
    isLoading,
    createEntry,
    updateEntry,
    deleteEntry,
    searchEntries,
    filterByMood,
  };
};
