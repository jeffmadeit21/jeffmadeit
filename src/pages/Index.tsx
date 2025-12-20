import { JournalApp } from '@/components/journal/JournalApp';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>My Personal Journal - Capture Your Thoughts</title>
        <meta name="description" content="A beautiful personal journal app to capture your daily thoughts, track your moods, and reflect on your journey. Private, simple, and elegant." />
      </Helmet>
      <JournalApp />
    </>
  );
};

export default Index;
