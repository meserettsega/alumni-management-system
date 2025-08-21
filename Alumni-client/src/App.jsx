import React from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "./styles/style.css";
import "react-toastify/dist/ReactToastify.css";
import Home from './components/Home';
import Footer from './components/Footer';
import Header from "./components/Header";
import AlumniList from "./components/AlumniList";
import Careers from "./components/Careers";
import Forum from "./components/Forum";
import About from "./components/About";
import Login from "./components/Login";
import Signup from "./components/Signup";
import MyAccount from "./components/MyAccount";
import Dashboard from "./admin/Dashboard";
import AdminHome from "./admin/AdminHome";
import AdminCourses from "./admin/AdminCourses";
import AdminUsers from "./admin/AdminUsers";
import AdminDonation from "./admin/AdminDonation";
import AdminSettings from "./admin/AdminSettings";
import AdminEvents from "./admin/AdminEvents";
import AdminForum from "./admin/AdminForum";
import AdminAlumni from "./admin/AdminAlumni";
import AdminJobs from "./admin/AdminJobs";
import ManageJobs from "./admin/save/ManageJobs";
import View_Event from "./components/view/View_Event";
import ManageEvents from "./admin/save/ManageEvents";
import View_Forum from "./components/view/View_Forum";
import ManageForum from "./admin/save/ManageForum";
import ManageUser from "./admin/save/ManageUser";
import ViewAlumni from "./admin/view/ViewAlumni";
import AdminMessage from "./admin/AdminMessage";
import ViewMessage from "./admin/view/ViewMessage";
import ManageMessage from "./admin/save/ManageMessage";
import ManageAlumni from './admin/save/ManageAlumni'; // Import the ManageAlumni component
import { AuthProvider, useAuth } from './AuthContext';
import { UserProvider } from './UserContext';
import ScrollToTop from "./components/ScrollToTop";
import 'react-quill/dist/quill.snow.css';
import { ThemeProvider } from "./ThemeContext";
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./components/NotFound";
import MessageChat from "./components/MessageChat";
import Donation from "./components/Donation";
import Event from "./components/Event";
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword'; // Import the ResetPassword component



// Import the new FAQ components
import FAQPostJob from "./components/FAQPostJob";
import FAQPostEvent from "./components/FAQPostEvent";
import FAQContactSupport from "./components/FAQContactSupport";

// Import the BackToTop component
import BackToTop from "./components/BackToTop";
import PaymentSuccess from "./components/PaymentSuccess";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <UserProvider>
          <AuthProvider>
            <ScrollToTop />
            <AppRouter />
          </AuthProvider>
        </UserProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

function AppRouter() {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboardRoute && <Header />}
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Home />} />
        <Route path="/alumni" element={<AlumniList />} />
        <Route path="/donations" element={<Donation />} />
        <Route path="/jobs" element={<Careers />} />
        <Route path="/forums" element={<Forum />} />
        <Route path="/events" element={<Event />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
 {/* Add this route */}


        {/* FAQ Routes */}
        <Route path="/faq/post-job" element={<FAQPostJob />} />
        <Route path="/faq/post-event" element={<FAQPostEvent />} />
        <Route path="/faq/contact-support" element={<FAQContactSupport />} />

        {isLoggedIn && isAdmin && (
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="" element={<AdminHome />} />
            <Route path="/dashboard/courses" element={<AdminCourses />} />
            <Route path="/dashboard/users" element={<AdminUsers />} />
            <Route path="/dashboard/donations" element={<AdminDonation />} />
            <Route path="/dashboard/settings" element={<AdminSettings />} />
            <Route path="/dashboard/events" element={<AdminEvents />} />
            <Route path="/dashboard/forum" element={<AdminForum />} />
            <Route path="/dashboard/alumnilist" element={<AdminAlumni />} />
            <Route path="/dashboard/jobs" element={<AdminJobs />} />
            <Route path="/dashboard/jobs/manage" element={<ManageJobs />} />
            <Route path="/dashboard/events/manage" element={<ManageEvents />} />
            <Route path="/dashboard/forum/manage" element={<ManageForum />} />
            <Route path="/dashboard/users/manage" element={<ManageUser />} />
            <Route path="/dashboard/alumni/manage" element={<ManageAlumni />} /> {/* Add this route */}
            <Route path="/dashboard/alumni/view" element={<ViewAlumni />} />
            <Route path="/dashboard/messages" element={<AdminMessage />} />
            <Route path="/dashboard/messages/view" element={<ViewMessage />} />
            <Route path="/dashboard/messages/manage" element={<ManageMessage />} />
          </Route>
        )}

        <Route path="events/view" element={<View_Event />} />
        {isLoggedIn && <Route path="account" element={<MyAccount />} />}
        <Route path="forum/view" element={<View_Forum />} />
        <Route path="jobs/add" element={<ManageJobs />} />
        {isLoggedIn && <Route path="/messages" element={<MessageChat />} />}
      </Routes>
      {!isDashboardRoute && <Footer />}
      <BackToTop /> {/* Add the BackToTop component here */}
    </>
  );
}

export default App;