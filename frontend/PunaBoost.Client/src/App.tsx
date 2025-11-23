import { createBrowserRouter, RouterProvider } from 'react-router';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from './store/store';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SidebarProvider } from './contexts/SidebarContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Public Pages
import HomePage from './pages/public/HomePage';
import JobsPage from './pages/public/JobsPage';
import JobDetailsPage from './pages/public/JobDetailsPage';
import PublicCandidateProfilePage from './pages/public/CandidateProfilePage';
import PublicCompanyProfilePage from './pages/public/CompanyProfilePage';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfilePage from './pages/candidate/CandidateProfilePage';
import CandidateApplicationsPage from './pages/candidate/CandidateApplicationsPage';
import HireWithAIPage from './pages/candidate/HireWithAIPage';

// Company Pages
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyJobsPage from './pages/company/CompanyJobsPage';
import CompanyJobCreatePage from './pages/company/CompanyJobCreatePage';
import CompanyJobDetailsPage from './pages/company/CompanyJobDetailsPage';
import CompanyProfilePage from './pages/company/CompanyProfilePage';
import CompanyApplicationsPage from './pages/company/CompanyApplicationsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminIndustriesPage from './pages/admin/AdminIndustriesPage';
import AdminSkillsPage from './pages/admin/AdminSkillsPage';
import AdminCountriesPage from './pages/admin/AdminCountriesPage';
import AdminCitiesPage from './pages/admin/AdminCitiesPage';
import AdminCandidatesPage from './pages/admin/AdminCandidatesPage';
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage';

// Error Pages
import UnauthorizedPage from './pages/UnauthorizedPage';
import { ThemeProvider } from './components/theme-provider';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: '/jobs',
    element: <JobsPage />,
  },
  {
    path: '/jobs/:id',
    element: <JobDetailsPage />,
  },
  {
    path: '/candidates/:id',
    element: (
      <ProtectedRoute allowedRoles={['Company']}>
        <PublicCandidateProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/companies/:id',
    element: <PublicCompanyProfilePage />,
  },
  {
    path: '/candidate/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['Candidate']}>
        <CandidateDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/candidate/profile',
    element: (
      <ProtectedRoute allowedRoles={['Candidate']}>
        <CandidateProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/candidate/applications',
    element: (
      <ProtectedRoute allowedRoles={['Candidate']}>
        <CandidateApplicationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/candidate/hire-with-ai',
    element: (
      <ProtectedRoute allowedRoles={['Candidate']}>
        <HireWithAIPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/company/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['Company']}>
        <CompanyDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/company/jobs',
    element: (
      <ProtectedRoute allowedRoles={['Company']}>
        <CompanyJobsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/company/jobs/create',
    element: (
      <ProtectedRoute allowedRoles={['Company']}>
        <CompanyJobCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/company/jobs/:id',
    element: (
      <ProtectedRoute allowedRoles={['Company']}>
        <CompanyJobDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/company/jobs/:id/edit',
    element: (
      <ProtectedRoute allowedRoles={['Company']}>
        <CompanyJobCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/company/jobs/:id/applications',
    element: (
      <ProtectedRoute allowedRoles={['Company']}>
        <CompanyApplicationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/company/applications',
    element: (
      <ProtectedRoute allowedRoles={['Company']}>
        <CompanyApplicationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/company/profile',
    element: (
      <ProtectedRoute allowedRoles={['Company']}>
        <CompanyProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['Admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/industries',
    element: (
      <ProtectedRoute allowedRoles={['Admin']}>
        <AdminIndustriesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/skills',
    element: (
      <ProtectedRoute allowedRoles={['Admin']}>
        <AdminSkillsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/countries',
    element: (
      <ProtectedRoute allowedRoles={['Admin']}>
        <AdminCountriesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/cities',
    element: (
      <ProtectedRoute allowedRoles={['Admin']}>
        <AdminCitiesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/candidates',
    element: (
      <ProtectedRoute allowedRoles={['Admin']}>
        <AdminCandidatesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/companies',
    element: (
      <ProtectedRoute allowedRoles={['Admin']}>
        <AdminCompaniesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
]);

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <SidebarProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </SidebarProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
