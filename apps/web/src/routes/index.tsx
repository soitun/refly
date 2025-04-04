import { lazy, Suspense } from 'react';
import { Route, Routes, useMatch } from 'react-router-dom';
import { useEffect } from 'react';
import { safeParseJSON } from '@refly-packages/ai-workspace-common/utils/parse';
import { useUserStoreShallow } from '@refly-packages/ai-workspace-common/stores/user';
import { useTranslation } from 'react-i18next';
import { useGetUserSettings } from '@refly-packages/ai-workspace-common/hooks/use-get-user-settings';
import { LOCALE } from '@refly/common-types';
import {
  BetaProtectedRoute,
  RequestAccessRoute,
} from '@refly-packages/ai-workspace-common/components/request-access/protected-route';
import { useHandleUrlParamsCallback } from '@refly-packages/ai-workspace-common/hooks/use-handle-url-params-callback';
import { SuspenseLoading } from '@refly-packages/ai-workspace-common/components/common/loading';
import { HomeRedirect } from '@refly-packages/ai-workspace-common/components/home-redirect';
import { usePublicAccessPage } from '@refly-packages/ai-workspace-common/hooks/use-is-share-page';

// Lazy load components
const Home = lazy(() => import('@/pages/home'));
const Canvas = lazy(() => import('@/pages/canvas'));
const Pricing = lazy(() => import('@/pages/pricing'));
const ShareCanvasPage = lazy(() => import('@/pages/share'));
const ShareCodePage = lazy(() => import('@/pages/code-share'));
const TemplatePreviewPage = lazy(() => import('@/pages/template-preview'));
const SkillResponseSharePage = lazy(() => import('@/pages/skill-response-share'));
const DocumentSharePage = lazy(() => import('@/pages/document-share'));
const ArtifactGalleryPage = lazy(() => import('@/pages/artifact-gallery'));
const UseCasesGalleryPage = lazy(() => import('@/pages/use-cases-gallery'));
const PagesListPage = lazy(() => import('@/pages/pages'));
const PageEditPage = lazy(() => import('@/pages/pages/edit/[pageId]'));
const PagePreviewPage = lazy(() => import('@/pages/pages/preview/[pageId]'));

const prefetchRoutes = () => {
  // Prefetch common routes
  import('@refly-packages/ai-workspace-common/components/request-access');
  import('@/pages/artifact-gallery');
  import('@/pages/use-cases-gallery');
  // 预加载Pages相关组件
  import('@/pages/pages');
  import('@/pages/pages/edit/[pageId]');
  import('@/pages/pages/preview/[pageId]');
};

export const AppRouter = (props: { layout?: any }) => {
  const { layout: Layout } = props;
  const userStore = useUserStoreShallow((state) => ({
    isLogin: state.isLogin,
    userProfile: state.userProfile,
    localSettings: state.localSettings,
    isCheckingLoginStatus: state.isCheckingLoginStatus,
  }));

  // Get storage user profile
  const storageUserProfile = safeParseJSON(localStorage.getItem('refly-user-profile'));
  const notShowLoginBtn = storageUserProfile?.uid || userStore?.userProfile?.uid;

  // Get locale settings
  const storageLocalSettings = safeParseJSON(localStorage.getItem('refly-local-settings'));

  const locale = storageLocalSettings?.uiLocale || userStore?.localSettings?.uiLocale || LOCALE.EN;

  useEffect(() => {
    prefetchRoutes();
  }, []);

  // Check user login status
  useGetUserSettings();

  // Change locale if not matched
  const { i18n } = useTranslation();
  useEffect(() => {
    if (locale && i18n.languages?.[0] !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [i18n, locale]);

  // Handle payment callback
  useHandleUrlParamsCallback();

  const routeLogin = useMatch('/');

  const isPublicAccessPage = usePublicAccessPage();
  const isPricing = useMatch('/pricing');

  if (!isPublicAccessPage && !isPricing) {
    if (!userStore.isCheckingLoginStatus === undefined || userStore.isCheckingLoginStatus) {
      return <SuspenseLoading />;
    }

    if (!notShowLoginBtn && !routeLogin) {
      return <SuspenseLoading />;
    }
  }

  const hasBetaAccess = userStore?.isLogin ? userStore?.userProfile?.hasBetaAccess || false : true;

  return (
    <Suspense fallback={<SuspenseLoading />}>
      <Layout>
        <Routes>
          <Route path="/" element={<HomeRedirect defaultNode={<Home />} />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/share/canvas/:canvasId" element={<ShareCanvasPage />} />
          <Route path="/share/code/:shareId" element={<ShareCodePage />} />
          <Route path="/share/answer/:shareId" element={<SkillResponseSharePage />} />
          <Route path="/share/doc/:shareId" element={<DocumentSharePage />} />
          <Route path="/artifact-gallery" element={<ArtifactGalleryPage />} />
          <Route path="/use-cases-gallery" element={<UseCasesGalleryPage />} />
          <Route path="/preview/canvas/:shareId" element={<TemplatePreviewPage />} />
          <Route
            path="/canvas/:canvasId"
            element={<BetaProtectedRoute component={Canvas} hasBetaAccess={hasBetaAccess} />}
          />
          <Route
            path="/request-access"
            element={<RequestAccessRoute hasBetaAccess={hasBetaAccess} />}
          />
          <Route
            path="/pages"
            element={<BetaProtectedRoute component={PagesListPage} hasBetaAccess={true} />}
          />
          <Route
            path="/pages/edit/:pageId"
            element={<BetaProtectedRoute component={PageEditPage} hasBetaAccess={true} />}
          />
          <Route
            path="/pages/preview/:pageId"
            element={<BetaProtectedRoute component={PagePreviewPage} hasBetaAccess={true} />}
          />
          <Route
            path="/pages/new"
            element={<BetaProtectedRoute component={lazy(() => import('../pages/pages/new'))} hasBetaAccess={true} />}
          />
        </Routes>
      </Layout>
    </Suspense>
  );
};
