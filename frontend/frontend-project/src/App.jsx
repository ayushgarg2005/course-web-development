
// npx tailwindcss -i ./src/components/input.css -o ./src/components/output.css --watch
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/useAuth";
import Homepage from "./components/Homepage";
import SignupForm from "./components/SignupForm";
import SigninForm from "./components/SigninForm";
import PurchasedCourses from "./components/PurchasedCourses";
import CourseDetails from "./components/CourseDetails";
import CartPage from "./components/CartPage";
import Profile from "./components/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CourseDetailPage from "./components/CourseDetailPage";
import Chatbot from "./components/Chatbot";
function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated, handleAuthSuccess } = useAuth();

  return (
    <>
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/signup" element={!isAuthenticated ? <SignupForm onAuthSuccess={handleAuthSuccess} /> : <Navigate to="/" replace />} />
      <Route path="/signin" element={!isAuthenticated ? <SigninForm onAuthSuccess={handleAuthSuccess} /> : <Navigate to="/" replace />} />
      <Route path="/purchased-courses" element={isAuthenticated ? <PurchasedCourses /> : <Navigate to="/" replace />} />
      <Route path="/cart" element={isAuthenticated ? <CartPage /> : <Navigate to="/" replace />} />
      <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/" replace />} />
      <Route path="/courses/:courseId/videos" element={isAuthenticated ? <CourseDetails /> : <Navigate to="/" replace />} /> 
      <Route path="/course-detail/:courseId" element={<CourseDetailPage />} />
    </Routes>
      <Chatbot/>
    </>
  );
}

export default App;


