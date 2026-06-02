import DashboardPage from '@/views/DashboardPage';
import { createSeoMetadata } from '@/lib/seoMetadata';

export const metadata = createSeoMetadata({
  title: 'Acasă — Versetul și gândul zilei',
  description: 'Descoperă versetul zilei, gândul zilei și devoționalul creștin de astăzi într-un spațiu de liniște și inspirație biblică.',
  path: '/dashboard',
  ogTitle: 'Versetul și gândul zilei — Popas pentru Suflet',
  ogDescription: 'Intră pentru devoționalul de astăzi, rugăciunea zilei și călătoria ta spirituală.',
  imageTitle: 'Versetul și gândul zilei',
  imageSubtitle: 'Devoțional, rugăciune și inspirație biblică pentru fiecare zi',
  imageTag: 'Popas pentru Suflet',
});

export default function Dashboard() { return <DashboardPage />; }

export const dynamic = 'force-dynamic';