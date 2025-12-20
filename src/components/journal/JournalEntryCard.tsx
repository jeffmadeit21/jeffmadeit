import { JournalEntry, moodEmojis } from '@/types/journal';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface JournalEntryCardProps {
  entry: JournalEntry;
  isActive: boolean;
  onClick: () => void;
}

export const JournalEntryCard = ({ entry, isActive, onClick }: JournalEntryCardProps) => {
  const preview = entry.content.length > 80 
    ? entry.content.substring(0, 80) + '...' 
    : entry.content;

  return (
    <div
      onClick={onClick}
      className={cn(
        'journal-entry-card animate-fade-in',
        isActive && 'active'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-foreground line-clamp-1 flex-1">
          {entry.title || 'Untitled'}
        </h3>
        {entry.mood && (
          <span className="text-lg flex-shrink-0" title={entry.mood}>
            {moodEmojis[entry.mood]}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {preview || 'No content yet...'}
      </p>
      <time className="text-xs text-muted-foreground/70">
        {format(entry.createdAt, 'MMM d, yyyy')}
      </time>
    </div>
  );
};
