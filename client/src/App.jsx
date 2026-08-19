import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Common Loaders & Guards
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { PageLoader } from './components/common/PageLoader';

// Eagerly loaded public pages
import { LandingPage } from './pages/LandingPage';

// Lazy loaded workspaces & auth pages for high performance
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ArticleGeneratorPage = lazy(() => import('./pages/ArticleGeneratorPage').then((m) => ({ default: m.ArticleGeneratorPage })));
const TitleGeneratorPage = lazy(() => import('./pages/TitleGeneratorPage').then((m) => ({ default: m.TitleGeneratorPage })));
const ImageGeneratorPage = lazy(() => import('./pages/ImageGeneratorPage').then((m) => ({ default: m.ImageGeneratorPage })));
const BackgroundRemoverPage = lazy(() => import('./pages/BackgroundRemoverPage').then((m) => ({ default: m.BackgroundRemoverPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Public Only Route: redirects authenticated users directly to /dashboard
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader message="Restoring your workspace..." />;
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <Suspense fallback={<PageLoader message="Loading CreateForge AI..." />}>
                <Routes>
                  {/* Public Marketing & Auth Routes */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route
                      path="/login"
                      element={
                        <PublicOnlyRoute>
                          <LoginPage />
                        </PublicOnlyRoute>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <PublicOnlyRoute>
                          <RegisterPage />
                        </PublicOnlyRoute>
                      }
                    />
                    <Route path="/404" element={<NotFoundPage />} />
                  </Route>

                  {/* Protected SaaS App & AI Workspaces */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/tools/article" element={<ArticleGeneratorPage />} />
                    <Route path="/tools/titles" element={<TitleGeneratorPage />} />
                    <Route path="/tools/image" element={<ImageGeneratorPage />} />
                    <Route
                      path="/tools/background-remove"
                      element={<BackgroundRemoverPage />}
                    />
                    <Route
                      path="/tools/background"
                      element={<Navigate to="/tools/background-remove" replace />}
                    />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>

                  {/* 404 Fallback */}
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Suspense>
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
