import { useState, useEffect } from 'react';
import { JournalEntry, Mood } from '@/types/journal';
import { MoodSelector } from './MoodSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Trash2, FileDown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface JournalEditorProps {
  entry: JournalEntry | null;
  onSave: (title: string, content: string, mood?: Mood) => void;
  onDelete: () => void;
  isNew: boolean;
}

export const JournalEditor = ({ entry, onSave, onDelete, isNew }: JournalEditorProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood | undefined>();

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      setMood(entry.mood);
    } else {
      setTitle('');
      setContent('');
      setMood(undefined);
    }
  }, [entry]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      toast.error('Please add a title or content');
      return;
    }
    onSave(title, content, mood);
    toast.success(isNew ? 'Entry created!' : 'Entry saved!');
  };

  const handleDelete = () => {
    onDelete();
    toast.success('Entry deleted');
  };

  const handleDownloadPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>${title || 'Journal Entry'}</title>
          <style>
            body { font-family: Georgia, serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
            .content { line-height: 1.8; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>${title || 'Untitled Entry'}</h1>
          <div class="meta">
            ${entry ? new Date(entry.createdAt).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : new Date().toLocaleDateString()}
            ${mood ? ` • Feeling: ${mood}` : ''}
          </div>
          <div class="content">${content}</div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success('PDF ready for download');
  };

  return (
    <div className="glass rounded-2xl p-6 shadow-card h-full flex flex-col animate-scale-in">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          {isNew ? 'New Entry' : 'Edit Entry'}
        </h2>
      </div>

      <Input
        placeholder="Entry title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4 text-lg font-medium bg-background/50 border-border/50 focus:border-primary"
      />

      <div className="mb-4">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          How are you feeling?
        </label>
        <MoodSelector value={mood} onChange={setMood} />
      </div>

      <Textarea
        placeholder="Start writing your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 min-h-[300px] resize-none bg-background/50 border-border/50 focus:border-primary font-mono text-sm"
      />

      <div className="flex gap-3 mt-6 flex-wrap">
        <Button onClick={handleSave} className="gradient-button border-0">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button 
          variant="outline" 
          onClick={handleDownloadPDF}
          className="bg-secondary/10 border-secondary/30 text-secondary hover:bg-secondary/20"
        >
          <FileDown className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        {!isNew && (
          <Button 
            variant="outline" 
            onClick={handleDelete}
            className="bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20 ml-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};
