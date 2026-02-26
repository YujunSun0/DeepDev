import { ProtectedRoute } from '@/components/layout/protected-route';

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
