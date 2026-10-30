import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/i18n';
import { applyUserSkin } from '@/lib/skin';
import '@/styles/fun.css';
// Add page imports here
import Home from './pages/Home';
import ListView from './pages/ListView';
import JoinList from './pages/JoinList';
import About from './pages/About';
import Contact from './pages/Contact';
import ShoppingHistory from './pages/ShoppingHistory';
import ShoppingSummary from './pages/ShoppingSummary';
import PhotoSuggestions from './pages/PhotoSuggestions';
import PriceReports from './pages/PriceReports';
import SponsoredPlacements from './pages/SponsoredPlacements';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DemoList from './pages/DemoList';
import PremiumMembers from './pages/PremiumMembers';
import Unsubscribe from './pages/Unsubscribe';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Accessibility from './pages/Accessibility';

// Public pages: reachable without login (auth pages + trust pages)
const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/about", "/contact", "/demo", "/unsubscribe", "/terms", "/privacy", "/accessibility"];

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();
  const location = useLocation();
  const isAuthPage = AUTH_PATHS.includes(location.pathname);

  // Redirect to login only when auth is required AND we're not already on an auth page
  // (prevents infinite redirect loop when landing on /join/:code while unauthenticated)
  useEffect(() => {
    if (authError?.type === 'auth_required' && !isAuthPage) {
      navigateToLogin();
    }
  }, [authError, isAuthPage, navigateToLogin]);

  // העיצוב שנשמר על המשתמש עצמו גובר — כך הבחירה עוברת איתו בין מכשירים
  useEffect(() => {
    applyUserSkin(user);
  }, [user]);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required' && !isAuthPage) {
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/demo" element={<DemoList />} />
      <Route path="/unsubscribe" element={<Unsubscribe />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/accessibility" element={<Accessibility />} />
      <Route path="/" element={<Home />} />
      <Route path="/list/:listId" element={<ListView />} />
      <Route path="/join/:shareCode" element={<JoinList />} />
      <Route path="/history/:listId" element={<ShoppingHistory />} />
      <Route path="/summary/:listId" element={<ShoppingSummary />} />
      <Route path="/photo-suggestions" element={<PhotoSuggestions />} />
      <Route path="/price-reports" element={<PriceReports />} />
      <Route path="/sponsored" element={<SponsoredPlacements />} />
      <Route path="/premium-members" element={<PremiumMembers />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App