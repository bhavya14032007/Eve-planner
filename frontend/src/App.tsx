import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { FloatingChatbot } from './components/ai/FloatingChatbot';

// Pages
import { HomePage } from './pages/HomePage';
import { ExploreServicesPage } from './pages/ExploreServicesPage';
import { PackagesPage } from './pages/PackagesPage';
import { AiPlannerPage } from './pages/AiPlannerPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { RegisterVendorPage } from './pages/RegisterVendorPage';
import { VendorDashboardPage } from './pages/VendorDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-background text-text-primary selection:bg-primary-subtle selection:text-primary transition-colors">
            {/* Top Navigation */}
            <Navbar />

            {/* Main Application Router Content */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore-services" element={<ExploreServicesPage />} />
                <Route path="/packages" element={<PackagesPage />} />
                <Route path="/ai-planner" element={<AiPlannerPage />} />
                <Route path="/my-bookings" element={<CustomerDashboardPage />} />
                <Route path="/register-with-us" element={<RegisterVendorPage />} />
                <Route path="/vendor-dashboard" element={<VendorDashboardPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            {/* Grounded Floating Gemini AI Concierge */}
            <FloatingChatbot />

            {/* Accessible Footer */}
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
