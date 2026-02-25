import { Navbar } from '@/components/layout/navbar';
import { ProtectedRoute } from '@/components/layout/protected-route';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Navbar />
      {children}
    </ProtectedRoute>
  );
}
