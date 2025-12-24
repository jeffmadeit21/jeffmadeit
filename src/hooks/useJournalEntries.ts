import { useState, useEffect, useCallback } from 'react';
import { JournalEntry, Mood } from '@/types/journal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useJournalEntries = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchEntries = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: JournalEntry[] = (data || []).map((row) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        mood: row.mood as Mood | undefined,
        images: row.images || [],
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));

      setEntries(mapped);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
      toast.error('Failed to load journal entries');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = useCallback(async (
    title: string, 
    content: string, 
    mood?: Mood, 
    images?: string[]
  ): Promise<JournalEntry | null> => {
    if (!user) {
      toast.error('You must be logged in to create entries');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          title,
          content,
          mood: mood || null,
          images: images || [],
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newEntry: JournalEntry = {
        id: data.id,
        title: data.title,
        content: data.content,
        mood: data.mood as Mood | undefined,
        images: data.images || [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setEntries(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (error) {
      console.error('Failed to create entry:', error);
      toast.error('Failed to create entry');
      return null;
    }
  }, [user]);

  const updateEntry = useCallback(async (
    id: string, 
    updates: Partial<Pick<JournalEntry, 'title' | 'content' | 'mood' | 'images'>>
  ) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({
          title: updates.title,
          content: updates.content,
          mood: updates.mood || null,
          images: updates.images,
        })
        .eq('id', id);

      if (error) throw error;

      setEntries(prev =>
        prev.map(entry =>
          entry.id === id
            ? { ...entry, ...updates, updatedAt: new Date() }
            : entry
        )
      );
    } catch (error) {
      console.error('Failed to update entry:', error);
      toast.error('Failed to update entry');
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Failed to delete entry:', error);
      toast.error('Failed to delete entry');
    }
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
