import { createSeoMetadata } from '@/lib/seoMetadata';
import BibliaContent from './BibliaContent';

export const metadata = createSeoMetadata({
  title: 'Biblia Cornilescu online — 66 cărți, 31.102 versete',
  description: 'Citește Biblia Cornilescu online gratuit. Explorează cele 66 de cărți ale Bibliei, accesează rapid capitolele și versetele importante.',
  path: '/biblia',
  ogTitle: 'Biblia Cornilescu online',
  ogDescription: 'Explorează cele 66 de cărți ale Bibliei și citește versetele rapid, online și gratuit.',
  imageTitle: 'Biblia Cornilescu online',
  imageSubtitle: '66 de cărți, 31.102 versete',
  imageTag: 'Biblia online',
});

export default function BibliaPage() {
  return <BibliaContent />;
}