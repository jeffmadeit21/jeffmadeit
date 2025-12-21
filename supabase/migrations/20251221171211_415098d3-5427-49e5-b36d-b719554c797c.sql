-- Create journal_entries table
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  mood TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (no auth required)
CREATE POLICY "Allow public read" ON public.journal_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.journal_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.journal_entries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.journal_entries FOR DELETE USING (true);

-- Create storage bucket for journal images
INSERT INTO storage.buckets (id, name, public) VALUES ('journal-images', 'journal-images', true);

-- Storage policies
CREATE POLICY "Public can view journal images" ON storage.objects FOR SELECT USING (bucket_id = 'journal-images');
CREATE POLICY "Public can upload journal images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'journal-images');
CREATE POLICY "Public can update journal images" ON storage.objects FOR UPDATE USING (bucket_id = 'journal-images');
CREATE POLICY "Public can delete journal images" ON storage.objects FOR DELETE USING (bucket_id = 'journal-images');

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();