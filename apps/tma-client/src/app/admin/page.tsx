import { getUserProfile } from '@/features/characters/api';
import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/features/admin/components/AdminDashboard';

export default async function AdminPage() {
  const profile = await getUserProfile();

  // Verificación de rol: solo staff y superadmin
  if (!profile || (profile.role !== 'staff' && profile.role !== 'superadmin')) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-black overflow-hidden relative p-4 md:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <AdminDashboard userRole={profile.role} />
    </main>
  );
}
