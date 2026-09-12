import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { ProjectProvider } from './context/ProjectContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Common Loaders & Guards & Modals
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { PageLoader } from './components/common/PageLoader';
import { OnboardingModal } from './components/common/OnboardingModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Eagerly loaded public pages
import { LandingPage } from './pages/LandingPage';

// Lazy loaded workspaces & tools for optimal bundle size
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const CreativeBriefPage = lazy(() => import('./pages/CreativeBriefPage').then((m) => ({ default: m.CreativeBriefPage })));
const ResearchStudioPage = lazy(() => import('./pages/ResearchStudioPage').then((m) => ({ default: m.ResearchStudioPage })));
const ArticleGeneratorPage = lazy(() => import('./pages/ArticleGeneratorPage').then((m) => ({ default: m.ArticleGeneratorPage })));
const TitleGeneratorPage = lazy(() => import('./pages/TitleGeneratorPage').then((m) => ({ default: m.TitleGeneratorPage })));
const ImageGeneratorPage = lazy(() => import('./pages/ImageGeneratorPage').then((m) => ({ default: m.ImageGeneratorPage })));
const BackgroundRemoverPage = lazy(() => import('./pages/BackgroundRemoverPage').then((m) => ({ default: m.BackgroundRemoverPage })));
const SocialPackPage = lazy(() => import('./pages/SocialPackPage').then((m) => ({ default: m.SocialPackPage })));
const SeoStudioPage = lazy(() => import('./pages/SeoStudioPage').then((m) => ({ default: m.SeoStudioPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const BrandKitPage = lazy(() => import('./pages/BrandKitPage').then((m) => ({ default: m.BrandKitPage })));
const CreativeCanvasPage = lazy(() => import('./pages/CreativeCanvasPage').then((m) => ({ default: m.CreativeCanvasPage })));
const QualityCenterPage = lazy(() => import('./pages/QualityCenterPage').then((m) => ({ default: m.QualityCenterPage })));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage').then((m) => ({ default: m.TemplatesPage })));
const ExportCenterPage = lazy(() => import('./pages/ExportCenterPage').then((m) => ({ default: m.ExportCenterPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Advanced Campaign & Multimodal Workspaces
const CampaignBuilderPage = lazy(() => import('./pages/CampaignBuilderPage').then((m) => ({ default: m.CampaignBuilderPage })));
const CreativeDirectionPage = lazy(() => import('./pages/CreativeDirectionPage').then((m) => ({ default: m.CreativeDirectionPage })));
const MoodboardPage = lazy(() => import('./pages/MoodboardPage').then((m) => ({ default: m.MoodboardPage })));
const VideoBlueprintPage = lazy(() => import('./pages/VideoBlueprintPage').then((m) => ({ default: m.VideoBlueprintPage })));
const PresentationStudioPage = lazy(() => import('./pages/PresentationStudioPage').then((m) => ({ default: m.PresentationStudioPage })));
const AbLabPage = lazy(() => import('./pages/AbLabPage').then((m) => ({ default: m.AbLabPage })));
const WorkflowAutomationPage = lazy(() => import('./pages/WorkflowAutomationPage').then((m) => ({ default: m.WorkflowAutomationPage })));
const LaunchReadinessPage = lazy(() => import('./pages/LaunchReadinessPage').then((m) => ({ default: m.LaunchReadinessPage })));

// Public Only Route
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader message="Restoring your workspace..." />;
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Preserves location.state across redirected routes
const RedirectWithState = ({ to }) => {
  const location = useLocation();
  return <Navigate to={to} state={location.state} replace />;
};

// Resilient fallback for /index.html
const IndexHtmlFallback = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader message="Loading workspace..." />;
  return <Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />;
};

export const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <ProjectProvider>
                <OnboardingModal />
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader message="Preparing your creative workspace..." />}>
                    <Routes>
                      {/* Public Marketing & Auth Routes */}
                      <Route element={<MainLayout />}>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/index.html" element={<IndexHtmlFallback />} />
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
                        <Route path="/workspace" element={<RedirectWithState to="/dashboard" />} />

                        {/* Creative Pipeline */}
                        <Route path="/brief" element={<CreativeBriefPage />} />
                        <Route path="/tools/brief" element={<RedirectWithState to="/brief" />} />
                        <Route path="/research" element={<ResearchStudioPage />} />
                        <Route path="/tools/research" element={<RedirectWithState to="/research" />} />
                        <Route path="/article" element={<ArticleGeneratorPage />} />
                        <Route path="/tools/article" element={<ArticleGeneratorPage />} />
                        <Route path="/titles" element={<TitleGeneratorPage />} />
                        <Route path="/tools/titles" element={<TitleGeneratorPage />} />
                        <Route path="/blog-titles" element={<RedirectWithState to="/titles" />} />
                        <Route path="/image" element={<ImageGeneratorPage />} />
                        <Route path="/tools/image" element={<ImageGeneratorPage />} />
                        <Route path="/image-generator" element={<RedirectWithState to="/image" />} />
                        <Route path="/social-pack" element={<SocialPackPage />} />
                        <Route path="/social" element={<RedirectWithState to="/social-pack" />} />
                        <Route path="/tools/social" element={<RedirectWithState to="/social-pack" />} />
                        <Route path="/seo-studio" element={<SeoStudioPage />} />
                        <Route path="/seo" element={<RedirectWithState to="/seo-studio" />} />
                        <Route path="/tools/seo" element={<RedirectWithState to="/seo-studio" />} />
                        <Route path="/background-remover" element={<BackgroundRemoverPage />} />
                        <Route path="/tools/background-remove" element={<BackgroundRemoverPage />} />
                        <Route path="/tools/background" element={<RedirectWithState to="/background-remover" />} />
                        <Route path="/background-removal" element={<RedirectWithState to="/background-remover" />} />

                        {/* Studio Workspaces & Intelligence */}
                        <Route path="/projects" element={<ProjectsPage />} />
                        <Route path="/canvas" element={<CreativeCanvasPage />} />
                        <Route path="/brand-kit" element={<BrandKitPage />} />
                        <Route path="/brand" element={<RedirectWithState to="/brand-kit" />} />
                        <Route path="/quality-center" element={<QualityCenterPage />} />
                        <Route path="/quality" element={<RedirectWithState to="/quality-center" />} />
                        <Route path="/templates" element={<TemplatesPage />} />
                        <Route path="/export" element={<ExportCenterPage />} />

                        {/* Account & Library */}
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/favorites" element={<HistoryPage initialTab="favorites" />} />
                        <Route path="/library" element={<Navigate to="/history" replace />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/settings" element={<SettingsPage />} />

                        {/* Autonomous Campaign & Multimodal Studios */}
                        <Route path="/campaign-builder" element={<CampaignBuilderPage />} />
                        <Route path="/creative-direction" element={<CreativeDirectionPage />} />
                        <Route path="/moodboard" element={<MoodboardPage />} />
                        <Route path="/video-blueprint" element={<VideoBlueprintPage />} />
                        <Route path="/presentation" element={<PresentationStudioPage />} />
                        <Route path="/ab-lab" element={<AbLabPage />} />
                        <Route path="/workflows" element={<WorkflowAutomationPage />} />
                        <Route path="/launch-readiness" element={<LaunchReadinessPage />} />
                      </Route>

                      {/* 404 Fallback */}
                      <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </ProjectProvider>
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
