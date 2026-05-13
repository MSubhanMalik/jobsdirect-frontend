import { lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import AuthInitializer from '@/components/layout/AuthInitializer';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Features } from '@/config/features';

// Layout (always loaded)
import AppLayout from './components/layout/AppLayout';
import ScrollToTop from './components/layout/ScrollToTop';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Jobs = lazy(() => import('./pages/Jobs'));
const JobDetail = lazy(() => import('./pages/JobDetail'));
const Employers = lazy(() => import('./pages/Employers'));
const Employees = lazy(() => import('./pages/Employees'));
const Contact = lazy(() => import('./pages/Contact'));
const Auth = lazy(() => import('./pages/Auth'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Privacy = lazy(() => import('./pages/legal/Privacy'));
const Terms = lazy(() => import('./pages/legal/Terms'));
const Cookies = lazy(() => import('./pages/legal/Cookies'));

const EmployerProfilePage = lazy(() => import('./pages/EmployerProfile'));

// Admin layout + sections (lazy)
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./components/admin/sections/AdminOverview'));
const AdminJobs = lazy(() => import('./components/admin/sections/AdminJobs'));
const AdminEmployers = lazy(() => import('./components/admin/sections/AdminEmployers'));
const AdminEmployees = lazy(() => import('./components/admin/sections/AdminEmployees'));
const AdminApplications = lazy(() => import('./components/admin/sections/AdminApplications'));
const AdminMessages = lazy(() => import('./components/admin/sections/AdminMessages'));
const AdminPayments = lazy(() => import('./components/admin/sections/AdminPayments'));
const AdminUsers = lazy(() => import('./components/admin/sections/AdminUsers'));
const AdminSettings = lazy(() => import('./components/admin/sections/AdminSettings'));

// Dashboard layout + pages (lazy)
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const DashboardOverview = lazy(() => import('./pages/dashboard/DashboardOverview'));
const DashboardProfile = lazy(() => import('./pages/dashboard/DashboardProfile'));
const DashboardJobs = lazy(() => import('./pages/dashboard/DashboardJobs'));
const DashboardApplications = lazy(() => import('./pages/dashboard/DashboardApplications'));
const DashboardApplicationDetail = lazy(() => import('./pages/dashboard/DashboardApplicationDetail'));
const DashboardBilling = lazy(() => import('./pages/dashboard/DashboardBilling'));
const DashboardMessages = lazy(() => import('./pages/dashboard/DashboardMessages'));
const DashboardSavedJobs = lazy(() => import('./pages/dashboard/DashboardSavedJobs'));
const DashboardCVs = lazy(() => import('./pages/dashboard/DashboardCVs'));
const DashboardCVSearch = lazy(() => import('./pages/dashboard/DashboardCVSearch'));
const DashboardCandidateDetail = lazy(() => import('./pages/dashboard/DashboardCandidateDetail'));
const DashboardNotifications = lazy(() => import('./pages/dashboard/NotificationsPage'));
const DashboardJobAlerts = lazy(() => import('./pages/dashboard/DashboardJobAlerts'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthInitializer>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public pages */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/employers" element={<Employers />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/employers/:slug" element={<EmployerProfilePage />} />
              </Route>

              {/* Dashboard (employer/employee) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardOverview />} />
                  <Route path="profile" element={<DashboardProfile />} />
                  <Route path="jobs" element={<DashboardJobs />} />
                  <Route path="applications" element={<DashboardApplications />} />
                  <Route path="applications/:id" element={<DashboardApplicationDetail />} />
                  <Route path="billing" element={<DashboardBilling />} />
                  {Features.fullMessaging && <Route path="messages" element={<DashboardMessages />} />}
                  {Features.fullMessaging && <Route path="messages/:roomId" element={<DashboardMessages />} />}
                  <Route path="saved" element={<DashboardSavedJobs />} />
                  <Route path="cvs" element={<DashboardCVs />} />
                  {Features.cvDatabase && <Route path="cv-search" element={<DashboardCVSearch />} />}
                  {Features.cvDatabase && <Route path="cv-search/:id" element={<DashboardCandidateDetail />} />}
                  <Route path="alerts" element={<DashboardJobAlerts />} />
                  <Route path="notifications" element={<DashboardNotifications />} />
                </Route>
              </Route>

              {/* Admin */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/overview" replace />} />
                  <Route path="overview" element={<AdminOverview />} />
                  <Route path="jobs" element={<AdminJobs />} />
                  <Route path="companies" element={<AdminEmployers />} />
                  <Route path="candidates" element={<AdminEmployees />} />
                  <Route path="applications" element={<AdminApplications />} />
                  <Route path="applications/:id" element={<DashboardApplicationDetail />} />
                  {Features.fullMessaging && <Route path="messages" element={<AdminMessages />} />}
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Route>

              {/* Auth */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </Router>
        <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="light" />
      </AuthInitializer>
    </QueryClientProvider>
  )
}

export default App
