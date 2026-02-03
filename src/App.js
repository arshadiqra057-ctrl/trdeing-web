import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';
import Nav from './components/Nav';
import Home from './pages/Home';
import About from './pages/About';
import Compliance from './pages/Compliance';
import Support from './pages/Support';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Footer from './components/Footer';
import Contact from './pages/Contact';
import ScrollToTop from './components/ScrollToTop';
import KycSubmission from './pages/KycSubmission';
import PaymentForm from './pages/PaymentForm';
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';
import DepositHistory from './pages/DepositHistory';
import AllStocks from './pages/AllStocks';
import ManageAssets from './pages/ManageAssets';
import TransferBalance from './pages/TransferBalance';
import ManageDeposit from './pages/ManageDeposit';
import ManageWithdraw from './pages/ManageWithdraw';
import TransactionHistory from './pages/TransactionHistory';
import ManageReferrals from './pages/ManageReferrals';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminLogin from './pages/AdminLogin';

import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <ScrollToTop />
                    <Routes>
                        <Route
                            path="*"
                            element={
                                <>
                                    <NavWrapper />
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/about" element={<About />} />
                                        <Route path="/compliance" element={<Compliance />} />
                                        {/* Public Support Page - maybe for FAQs? If same as Dashboard Support, should be protected. Assuming public for now or redirecting */}
                                        {/* <Route path="/support" element={<Support />} /> */}

                                        <Route path="/login" element={<Login />} />
                                        <Route path="/signup" element={<Signup />} />
                                        <Route path="/contact" element={<Contact />} />
                                        <Route path="/forgot-password" element={<ForgotPassword />} />
                                        <Route path="/reset-password" element={<ResetPassword />} />

                                        {/* Protected User Routes */}
                                        <Route element={<ProtectedRoute />}>
                                            <Route path="/kyc" element={<KycSubmission />} />
                                            <Route path="/fund" element={<PaymentForm />} />
                                            <Route path="/deposit-history" element={<DepositHistory />} />
                                            <Route path="/dashboard" element={<Dashboard />} />
                                            <Route path="/stocks" element={<AllStocks />} />
                                            <Route path="/assets" element={<ManageAssets />} />
                                            <Route path="/transfer" element={<TransferBalance />} />

                                            <Route path="/deposit" element={<Navigate to="/deposit/new" replace />} />
                                            <Route path="/deposit/new" element={<ManageDeposit defaultTab="new" />} />
                                            <Route path="/deposit/history" element={<ManageDeposit defaultTab="history" />} />

                                            <Route path="/withdraw" element={<Navigate to="/withdraw/new" replace />} />
                                            <Route path="/withdraw/new" element={<ManageWithdraw defaultTab="new" />} />
                                            <Route path="/withdraw/history" element={<ManageWithdraw defaultTab="history" />} />

                                            <Route path="/transactions" element={<TransactionHistory />} />

                                            <Route path="/support" element={<Navigate to="/support/history" replace />} />
                                            <Route path="/support/new" element={<Support defaultTab="new" />} />
                                            <Route path="/support/history" element={<Support defaultTab="history" />} />

                                            <Route path="/referrals" element={<ManageReferrals />} />
                                            <Route path="/profile" element={<Profile />} />
                                        </Route>
                                    </Routes>
                                    <FooterWrapper />
                                </>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute />
                            }
                        />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

// Protected Admin Route Component
const AdminRoute = () => {
    const { isAdmin, isAuthenticated, loading } = useAuth();
    if (loading) return <div>Loading...</div>;

    // 1. If Admin, show Panel
    if (isAdmin) return <AdminPanel />;

    // 2. If Regular User (Logged in but not Admin), DO NOT show Admin Login. Redirect to User Dashboard.
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;

    // 3. If Guest (Not logged in), show Admin Login Portal
    return <AdminLogin />;
};

// Protected User Route Component
const ProtectedRoute = () => {
    const token = localStorage.getItem('token');
    // We could also check useAuth() here if we imported it, 
    // but checking token is a quick synchronous check to prevent flash.
    // Ideally use useAuth for more robust checking.
    // Let's use useAuth actually, since we are inside AuthProvider.
    return <ProtectedRouteInner />;
};

const ProtectedRouteInner = () => {
    // We need to move useAuth usage to a component inside the provider
    // But ProtectedRoute is used inside Routes which is inside AuthProvider
    // So we can just use useAuth directly in the component used in 'element' prop? 
    // No, <Route element={<ProtectedRoute />}> works fine.

    // However, App is the one rendering AuthProvider.
    // ProtectedRoute is defined outside App? No, inside App file but outside App component?
    // Move components outside App to be clean, or use imports.
    // Since I am editing App.js, I will define it outside.
    return <OutletWithAuth />;
};

const OutletWithAuth = () => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="loading-spinner">Loading...</div>; // Or null
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Simple wrappers to hide on admin route
const NavWrapper = () => {
    const location = useLocation();
    const hiddenRoutes = [
        '/admin',
        '/dashboard',
        '/stocks',
        '/assets',
        '/transfer',
        '/deposit',
        '/withdraw',
        '/transactions',
        '/support',
        '/referrals',
        '/fund',
        '/profile',
        '/kyc',
        '/deposit-history'
    ];

    const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));
    return shouldHide ? null : <Nav />;
};

const FooterWrapper = () => {
    const location = useLocation();
    const hiddenRoutes = [
        '/admin',
        '/dashboard',
        '/stocks',
        '/assets',
        '/transfer',
        '/deposit',
        '/withdraw',
        '/transactions',
        '/support',
        '/referrals',
        '/fund',
        '/profile'
    ];

    // Check if current path starts with any of the hidden routes
    const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));

    return shouldHide ? null : <Footer />;
};

export default App;

