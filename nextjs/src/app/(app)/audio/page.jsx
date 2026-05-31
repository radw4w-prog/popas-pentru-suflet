import AudioBiblePage from '@/views/AudioBiblePage';
export const metadata = { title: 'Biblia Audio - Ascultă Biblia în română', description: 'Ascultă Biblia Cornilescu completă în limba română. Redare continuă, progres salvat automat.' };
export default function Audio() { return <AudioBiblePage />; }

export const dynamic = 'force-dynamic';