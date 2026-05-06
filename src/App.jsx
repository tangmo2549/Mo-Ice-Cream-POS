import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { HashRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Pages
import Home from './pages/Home';
import Landing from './pages/Landing';
import Register from './pages/Register';
import SignIn from './pages/signin';
import Dashboardlayout from "@/components/dashboard/dashboardlayout.jsx";
import ProductsPage from './pages/ProductsPage';
import StockPage from './pages/StockPage';
import FinancePage from './pages/FinancePage';
import SchoolsPage from './pages/SchoolsPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import SeasonPage from './pages/SeasonPage';
import PackagingPage from './pages/PackagingPage';
import AuditPage from './pages/AuditPage';

// หน้าที่ไม่ต้องรอ auth — แสดงทันที
const isPublic = PUBLIC_PATHS.some(p => location.pathname === p);

const AuthenticatedApp = () => {
  const location = useLocation();
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // ✅ Bypass auth check สำหรับทุก public routes
  const isPublic = PUBLIC_PATHS.some(p => location.pathname === p);
  if (isPublic) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    );
  }

  // Protected routes — ยังรอ auth อยู่
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Dashboard (protected by session check inside Dashboardlayout) */}
      <Route element={<Dashboardlayout />}>
        <Route path="/dashboard" element={<ReportsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/schools" element={<SchoolsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/seasons" element={<SeasonPage />} />
        <Route path="/packaging" element={<PackagingPage />} />
        <Route path="/audit" element={<AuditPage />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App