import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { Layout, PageContainer } from '@/components/core';
import { Dashboard, ComponentGallery, ComponentDetail, DesignSystemOverview, TypographyGallery, ColorsGallery, BorderRadiusGallery, Tasks, Transactions, Cards, Recipients, VisualTestPage, BillPay, Command, AccountDetail, Insights } from '@/pages';
import { ToastProvider } from '@/components/ui/toast';
import { DataProvider } from '@/context/DataContext';

function NotFoundRoute() {
  const location = useLocation();

  return (
    <div className="px-6">
      <h1 className="text-title-main">Not Found</h1>
      <p className="text-body text-muted-foreground">No route matched: {location.pathname}</p>
    </div>
  );
}

// Layout wrapper for main app routes
function AppLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  return (
    <DataProvider>
      <ToastProvider>
        <BrowserRouter>
        <Routes>
        {/* Visual test routes - rendered without Layout for isolated Playwright testing */}
        <Route path="/test-components" element={<VisualTestPage />} />
        <Route path="/test-components/:componentId" element={<VisualTestPage />} />
        <Route path="/test-components/:componentId/:variant" element={<VisualTestPage />} />

        {/* Main app routes - wrapped in Layout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={
              <PageContainer fullWidth={true} className="py-8">
                <Dashboard />
              </PageContainer>
            } 
          />
          <Route 
            path="/components" 
            element={
              <PageContainer fullWidth={false} className="py-8">
                <DesignSystemOverview />
              </PageContainer>
            } 
          />
          <Route 
            path="/components/list" 
            element={
              <PageContainer fullWidth={false} className="py-8">
                <ComponentGallery />
              </PageContainer>
            } 
          />
          <Route 
            path="/components/:componentId" 
            element={
              <PageContainer fullWidth={false} className="py-8">
                <ComponentDetail />
              </PageContainer>
            } 
          />
          <Route 
            path="/typography" 
            element={
              <PageContainer fullWidth={false} className="py-8">
                <TypographyGallery />
              </PageContainer>
            } 
          />
          <Route 
            path="/colors" 
            element={
              <PageContainer fullWidth={false} className="py-8">
                <ColorsGallery />
              </PageContainer>
            } 
          />
          <Route 
            path="/border-radius" 
            element={
              <PageContainer fullWidth={false} className="py-8">
                <BorderRadiusGallery />
              </PageContainer>
            } 
          />
          <Route
            path="/tasks"
            element={
              <PageContainer fullWidth={false} className="py-8">
                <Tasks />
              </PageContainer>
            }
          />
          <Route
            path="/transactions"
            element={
              <div className="py-6">
                <Transactions />
              </div>
            }
          />
          <Route
            path="/cards"
            element={
              <PageContainer fullWidth={false} className="py-8">
                <Cards />
              </PageContainer>
            }
          />
          <Route
            path="/insights"
            element={
              <PageContainer fullWidth={false} className="py-8">
                <Insights />
              </PageContainer>
            }
          />
          <Route
            path="/accounts/:accountId"
            element={
              <PageContainer fullWidth={false} className="py-8">
                <AccountDetail />
              </PageContainer>
            }
          />
          <Route
            path="/payments/recipients"
            element={
              <PageContainer fullWidth={false} className="py-8">
                <Recipients />
              </PageContainer>
            }
          />
          <Route
            path="/workflows/bill-pay"
            element={
              <div className="py-6">
                <BillPay />
              </div>
            }
          />
          <Route
            path="/command"
            element={<Command />}
          />
            <Route path="*" element={<NotFoundRoute />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </ToastProvider>
    </DataProvider>
  );
}

export default App;
