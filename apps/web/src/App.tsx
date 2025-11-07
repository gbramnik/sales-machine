import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DemoDashboard } from './components/DemoDashboard';
import { CookieBanner } from './components/CookieBanner';

export function App() {
  return (
    <BrowserRouter>
      <CookieBanner />
      <Routes>
        {/* Demo route for development */}
        <Route path="/demo" element={<DemoDashboard />} />
        
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/review-queue" element={<ReviewQueuePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>
        
        {/* Default redirect to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Fallback - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
