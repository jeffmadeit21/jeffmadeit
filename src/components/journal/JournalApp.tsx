import { useState, useCallback } from 'react';
import { JournalEntry, Mood } from '@/types/journal';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { useAuth } from '@/hooks/useAuth';
import { JournalSidebar } from './JournalSidebar';
import { JournalEditor } from './JournalEditor';
import { Button } from '@/components/ui/button';
import { Sparkles, LogOut } from 'lucide-react';

export const JournalApp = () => {
  const { 
    entries, 
    isLoading, 
    createEntry, 
    updateEntry, 
    deleteEntry,
    searchEntries,
    filterByMood,
  } = useJournalEntries();
  const { signOut, user } = useAuth();

  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);

  const handleNewEntry = useCallback(() => {
    setActiveEntry(null);
    setIsNewEntry(true);
  }, []);

  const handleSelectEntry = useCallback((entry: JournalEntry) => {
    setActiveEntry(entry);
    setIsNewEntry(false);
  }, []);

  const handleSave = useCallback(async (title: string, content: string, mood?: Mood, images?: string[]) => {
    if (isNewEntry) {
      const newEntry = await createEntry(title, content, mood, images);
      if (newEntry) {
        setActiveEntry(newEntry);
        setIsNewEntry(false);
      }
    } else if (activeEntry) {
      await updateEntry(activeEntry.id, { title, content, mood, images });
      setActiveEntry({ ...activeEntry, title, content, mood, images, updatedAt: new Date() });
    }
  }, [isNewEntry, activeEntry, createEntry, updateEntry]);

  const handleDelete = useCallback(async () => {
    if (activeEntry) {
      await deleteEntry(activeEntry.id);
      setActiveEntry(null);
      setIsNewEntry(false);
    }
  }, [activeEntry, deleteEntry]);

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-main flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary-foreground animate-pulse mx-auto mb-4" />
          <p className="text-primary-foreground/80">Loading your journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-main">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 min-h-screen">
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                My Personal Journal
              </h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={signOut}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
          <p className="text-primary-foreground/70 text-center mt-2">
            {user?.email ? `Welcome, ${user.email}` : 'Capture your thoughts, track your moods'}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 max-w-7xl mx-auto">
          <JournalSidebar
            entries={entries}
            activeEntryId={activeEntry?.id ?? null}
            onSelectEntry={handleSelectEntry}
            onNewEntry={handleNewEntry}
            onSearch={searchEntries}
            onFilterByMood={filterByMood}
          />

          <div className="min-h-[600px]">
            {(activeEntry || isNewEntry) ? (
              <JournalEditor
                entry={activeEntry}
                onSave={handleSave}
                onDelete={handleDelete}
                isNew={isNewEntry}
              />
            ) : (
              <div className="glass rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center shadow-card animate-fade-in">
                <Sparkles className="w-16 h-16 text-primary/30 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Welcome to Your Journal
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Select an existing entry from the sidebar or create a new one to start writing.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
