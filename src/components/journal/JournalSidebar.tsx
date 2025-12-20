import { useState } from 'react';
import { JournalEntry, Mood, moodEmojis, moodLabels } from '@/types/journal';
import { JournalEntryCard } from './JournalEntryCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, BookOpen, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface JournalSidebarProps {
  entries: JournalEntry[];
  activeEntryId: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
  onSearch: (query: string) => JournalEntry[];
  onFilterByMood: (mood: Mood | null) => JournalEntry[];
}

const moods: Mood[] = ['happy', 'calm', 'neutral', 'sad', 'anxious', 'excited'];

export const JournalSidebar = ({
  entries,
  activeEntryId,
  onSelectEntry,
  onNewEntry,
  onSearch,
  onFilterByMood,
}: JournalSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('all');

  const filteredEntries = (() => {
    let result = entries;
    
    if (searchQuery.trim()) {
      result = onSearch(searchQuery);
    }
    
    if (selectedMood && selectedMood !== 'all') {
      result = result.filter(e => e.mood === selectedMood);
    }
    
    return result;
  })();

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMood('all');
  };

  const hasFilters = searchQuery.trim() || selectedMood !== 'all';

  return (
    <div className="glass rounded-2xl h-full flex flex-col shadow-card animate-slide-in-left">
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">My Journal</h2>
          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {entries.length} entries
          </span>
        </div>

        <Button 
          onClick={onNewEntry} 
          className="w-full gradient-button border-0 mb-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 border-border/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Select value={selectedMood} onValueChange={setSelectedMood}>
          <SelectTrigger className="bg-background/50 border-border/50">
            <SelectValue placeholder="Filter by mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All moods</SelectItem>
            {moods.map(mood => (
              <SelectItem key={mood} value={mood}>
                {moodEmojis[mood]} {moodLabels[mood]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="w-full mt-2 text-muted-foreground"
          >
            Clear filters
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                isActive={entry.id === activeEntryId}
                onClick={() => onSelectEntry(entry)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {hasFilters ? 'No entries match your filters' : 'No entries yet'}
              </p>
              {!hasFilters && (
                <p className="text-xs mt-1">
                  Start writing your first journal entry!
                </p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
