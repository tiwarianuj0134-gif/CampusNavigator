/**
 * CampusNavigator Application
 * Main routing — Landing is public; all other pages require authentication.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { Toaster } from 'sonner';
import { useThemeStore } from '@/context/themeStore';
import { useAuthStore } from '@/context/authStore';
import { ProtectedRoute, AdminRoute, GuestRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary, OfflineIndicator } from '@/components/common/ErrorBoundary';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/layout/ScrollProgress';
import BackToTop from '@/components/layout/BackToTop';
import AIChatbot from '@/components/common/AIChatbot';
import { PageSkeleton } from '@/components/loaders/Skeleton';

// Lazy-loaded pages
const LandingPage       = lazy(() => import('@/pages/public/LandingPage'));
const SearchPage        = lazy(() => import('@/pages/public/SearchPage'));
const CollegeDetailPage = lazy(() => import('@/pages/public/CollegeDetailPage'));
const ComparePage       = lazy(() => import('@/pages/public/ComparePage'));
const QuestionnairePage = lazy(() => import('@/pages/public/QuestionnairePage'));
const LoginPage         = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage      = lazy(() => import('@/pages/auth/RegisterPage'));
const DashboardLayout      = lazy(() => import('@/pages/dashboard/DashboardLayout'));
const DashboardOverview    = lazy(() => import('@/pages/dashboard/DashboardOverview'));
const BookmarksPage        = lazy(() => import('@/pages/dashboard/BookmarksPage'));
const ApplicationsPage     = lazy(() => import('@/pages/dashboard/ApplicationsPage'));
const RecommendationsPage  = lazy(() => import('@/pages/dashboard/RecommendationsPage'));
const SettingsPage         = lazy(() => import('@/pages/dashboard/SettingsPage'));
const AdminLayout   = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminColleges = lazy(() => import('@/pages/admin/AdminColleges'));
const AdminReviews  = lazy(() => import('@/pages/admin/AdminReviews'));
const NotFoundPage  = lazy(() => import('@/pages/NotFoundPage'));

function Loader() {
  return (
    <div className="min-h-screen pt-16 bg-[#fafafa] dark:bg-[#060612]">
      <PageSkeleton />
    </div>
  );
}

// Main public layout (navbar + footer + floating UI)
function Layout({ children, noFooter = false }: { children: React.ReactNode; noFooter?: boolean }) {
  return (
    <>
      <Navbar />
      <ScrollProgress />
      <main className="min-h-screen">{children}</main>
      {!noFooter && <Footer />}
      <BackToTop />
      <AIChatbot />
    </>
  );
}

export default function App() {
  const { isDark } = useThemeStore();
  const { checkAuth } = useAuthStore();

  useEffect(() => { checkAuth(); }, [checkAuth]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <OfflineIndicator />
        <Toaster
          position="top-right"
          theme={isDark ? 'dark' : 'light'}
          richColors
          closeButton
          toastOptions={{
            style: { borderRadius: '14px', padding: '14px 16px', fontSize: '14px' },
            duration: 3500,
          }}
        />
        <Suspense fallback={<Loader />}>
          <Routes>

            {/* ── Public (no login required) ──────────────────── */}
            <Route path="/" element={
              <Layout>
                <LandingPage />
              </Layout>
            } />

            {/* ── These pages have built-in auth gates (show lock if unauth) ── */}
            <Route path="/search" element={
              <Layout>
                <SearchPage />
              </Layout>
            } />

            <Route path="/college/:id" element={
              <Layout>
                <CollegeDetailPage />
              </Layout>
            } />

            <Route path="/compare" element={
              <Layout>
                <ComparePage />
              </Layout>
            } />

            <Route path="/questionnaire" element={
              <Layout noFooter>
                <QuestionnairePage />
              </Layout>
            } />

            {/* ── Auth routes (redirect dashboard if already logged in) ── */}
            <Route path="/login" element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            } />

            <Route path="/register" element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            } />

            {/* ── Protected dashboard routes ───────────────────── */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout noFooter>
                  <DashboardLayout />
                </Layout>
              </ProtectedRoute>
            }>
              <Route index element={<DashboardOverview />} />
              <Route path="bookmarks" element={<BookmarksPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="recommendations" element={<RecommendationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* ── Admin routes (admin role only) ──────────────── */}
            <Route path="/admin" element={
              <AdminRoute>
                <Layout noFooter>
                  <AdminLayout />
                </Layout>
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="colleges" element={<AdminColleges />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="questions" element={
                <div className="flex items-center justify-center py-24 text-gray-400 dark:text-gray-500">
                  <p>Questions management — coming soon</p>
                </div>
              } />
              <Route path="settings" element={
                <div className="flex items-center justify-center py-24 text-gray-400 dark:text-gray-500">
                  <p>Admin settings — coming soon</p>
                </div>
              } />
            </Route>

            {/* ── 404 ─────────────────────────────────────────── */}
            <Route path="*" element={
              <Layout>
                <NotFoundPage />
              </Layout>
            } />

          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
