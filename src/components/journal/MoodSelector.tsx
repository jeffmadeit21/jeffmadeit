import { Mood, moodEmojis, moodLabels } from '@/types/journal';
import { cn } from '@/lib/utils';

interface MoodSelectorProps {
  value?: Mood;
  onChange: (mood: Mood | undefined) => void;
}

const moods: Mood[] = ['happy', 'calm', 'neutral', 'sad', 'anxious', 'excited'];

export const MoodSelector = ({ value, onChange }: MoodSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {moods.map((mood) => (
        <button
          key={mood}
          type="button"
          onClick={() => onChange(value === mood ? undefined : mood)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
            'border hover:scale-105 active:scale-95',
            value === mood
              ? 'bg-primary/10 border-primary text-primary shadow-sm'
              : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
          )}
        >
          <span className="text-base">{moodEmojis[mood]}</span>
          <span>{moodLabels[mood]}</span>
        </button>
      ))}
    </div>
  );
};
