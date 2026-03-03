import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import NavBar from "./components/NavBar";
import LoginPage from "./pages/LoginPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import RegisterPage from "./pages/RegisterPage";
import OwnerDashboardComponent from "./components/OwnerDashboardComponent";
import { EmployeeDashboardComponent } from "./components/EmployeeDashboardComponent";
import { CustomerDashboardComponent } from "./components/CustomerDashboardComponent";

function DashboardPage() {
  const { user } = useAuth();

  const role = user?.role?.toLowerCase();

  if (role === "owner") {
    return <OwnerDashboardComponent />;
  }

  if (role === "employee") {
    return <EmployeeDashboardComponent />;
  }

  return <CustomerDashboardComponent />;
}

function DashboardLayout() {
  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <NavBar titleMain="MeawMee Cake" />
      <div style={{ padding: "16px 24px 24px" }}>
        <DashboardPage />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
