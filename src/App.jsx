import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CompleteProfile from "./pages/CompleteProfile";
import UpdatePage from "./pages/UpdatePage";
import AuthCallback from "./pages/AuthCallback";
import InformationProfile from "./pages/InformationProfile";
import OwnerDashboardComponent from "./components/OwnerDashboardComponent";
import { EmployeeDashboardComponent } from "./components/EmployeeDashboardComponent";
import { CustomerDashboardComponent } from "./components/CustomerDashboardComponent";
import Layout from "./components/Layout";
import ProductManageForOwner from "./pages/ownerPages/ProductManageForOwner";
import AddProductForOwner from "./pages/ownerPages/addProductForOwner/AddProductForOwner";
import ProductDetail from "./pages/ownerPages/ProductDetail";
import EmployeeManage from "./pages/ownerPages/EmployeeManage";
import ManageDeletedEmployeeList from "./pages/ownerPages/ManageDeletedEmployeeList";
import CreateUserForOwner from "./pages/ownerPages/CreateUserForOwner";
import EditInfoEmployeeForOwner from "./pages/ownerPages/EditInfoEmployeeForOwner";
import AddRecipeForOwner from "./pages/ownerPages/addRecipeForOwner/AddRecipeForOwner";
import ProductUpdate from "./pages/ownerPages/editProductForOwner/ProductUpdate";

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
    <Layout titleMain="แดชบอร์ด">
      <DashboardPage />
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route
            path="/update"
            element={
              <ProtectedRoute allowIncomplete>
                <UpdatePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complete-profile"
            element={
              <ProtectedRoute allowIncomplete>
                <CompleteProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <InformationProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/information-profile"
            element={
              <ProtectedRoute>
                <InformationProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/product-manage"
            element={
              <ProtectedRoute>
                <ProductManageForOwner />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-product"
            element={
              <ProtectedRoute>
                <AddProductForOwner />
              </ProtectedRoute>
            }
          />

          <Route
            path="/deleted-products"
            element={<Navigate to="/product-manage" replace />}
          />

          <Route
            path="/product-detail/:productId"
            element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-product/:productId"
            element={
              <ProtectedRoute>
                <ProductUpdate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employeeManage"
            element={
              <ProtectedRoute>
                <EmployeeManage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-employee"
            element={
              <ProtectedRoute>
                <CreateUserForOwner />
              </ProtectedRoute>
            }
          />

          <Route
            path="/deleted-employees"
            element={
              <ProtectedRoute>
                <ManageDeletedEmployeeList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/information-profile/:userId"
            element={
              <ProtectedRoute>
                <EditInfoEmployeeForOwner />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-info-employee/:userId"
            element={
              <ProtectedRoute>
                <EditInfoEmployeeForOwner />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-recipes"
            element={
              <ProtectedRoute>
                <AddRecipeForOwner />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-recipes/:newProductId"
            element={
              <ProtectedRoute>
                <AddRecipeForOwner />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ingredient-list"
            element={<Navigate to="/add-recipes" replace />}
          />

          <Route
            path="/add-ingredient"
            element={<Navigate to="/add-recipes" replace />}
          />

          <Route
            path="/ingredient-receive-history"
            element={<Navigate to="/add-recipes" replace />}
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
