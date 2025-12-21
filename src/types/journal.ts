export type Mood = 'happy' | 'calm' | 'neutral' | 'sad' | 'anxious' | 'excited';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: Mood;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const moodEmojis: Record<Mood, string> = {
  happy: '😊',
  calm: '😌',
  neutral: '😐',
  sad: '😢',
  anxious: '😰',
  excited: '🎉',
};

export const moodLabels: Record<Mood, string> = {
  happy: 'Happy',
  calm: 'Calm',
  neutral: 'Neutral',
  sad: 'Sad',
  anxious: 'Anxious',
  excited: 'Excited',
};
