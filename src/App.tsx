import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import { useAuth } from "./features/auth/hooks/useAuth";
import { ProtectedLayout } from "./components/protected-layout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProtectedLayout breadcrumbs={[{ title: "Dashboard" }]}>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProtectedLayout
                  breadcrumbs={[
                    { title: "Dashboard", href: "/" },
                    { title: "Products" },
                  ]}
                >
                  <Products />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <ProtectedLayout
                  breadcrumbs={[
                    { title: "Dashboard", href: "/" },
                    { title: "Orders" },
                  ]}
                >
                  <Orders />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
