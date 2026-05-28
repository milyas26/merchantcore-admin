import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Catalog from "./pages/catalog/Catalog";
import { CatalogEditor } from "./pages/catalog/CatalogEditor";
import Inventory from "./pages/Inventory";
import Promotions from "./pages/Promotions";
import PromotionEditor from "./pages/PromotionEditor";
import Reports from "./pages/Reports";
import Storefront from "./pages/Storefront";
import { useAuth } from "./features/auth/hooks/useAuth";
import { ProtectedLayout } from "./components/protected-layout";
import Category from "./pages/Category";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <ProtectedLayout
                  breadcrumbs={[
                    { title: "Dashboard", href: "/" },
                    { title: "Categories" },
                  ]}
                >
                  <Category />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalog"
            element={
              <ProtectedRoute>
                <ProtectedLayout
                  breadcrumbs={[
                    { title: "Dashboard", href: "/" },
                    { title: "Catalog" },
                  ]}
                >
                  <Catalog />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalog/new"
            element={
              <ProtectedRoute>
                <ProtectedLayout
                  breadcrumbs={[
                    { title: "Dashboard", href: "/" },
                    { title: "Catalog", href: "/catalog" },
                    { title: "Tambah Produk" },
                  ]}
                >
                  <CatalogEditor />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalog/:slug"
            element={
              <ProtectedRoute>
                <ProtectedLayout
                  breadcrumbs={[
                    { title: "Dashboard", href: "/" },
                    { title: "Catalog", href: "/catalog" },
                    { title: "Edit Produk" },
                  ]}
                >
                  <CatalogEditor />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <ProtectedLayout
                  breadcrumbs={[
                    { title: "Dashboard", href: "/" },
                    { title: "Inventory" },
                  ]}
                >
                  <Inventory />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/promotions"
            element={
              <ProtectedRoute>
                <ProtectedLayout
                  breadcrumbs={[
                    { title: "Dashboard", href: "/" },
                    { title: "Promotions" },
                  ]}
                >
                  <Promotions />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/promotions/:id"
            element={
              <ProtectedRoute>
                <ProtectedLayout
                  breadcrumbs={[
                    { title: "Dashboard", href: "/" },
                    { title: "Promotions", href: "/promotions" },
                    { title: "Editor" },
                  ]}
                >
                  <PromotionEditor />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ProtectedLayout
                  breadcrumbs={[
                    { title: "Dashboard", href: "/" },
                    { title: "Reports" },
                  ]}
                >
                  <Reports />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/storefront"
            element={
              <ProtectedRoute>
                <ProtectedLayout
                  breadcrumbs={[
                    { title: "Dashboard", href: "/" },
                    { title: "Storefront" },
                  ]}
                >
                  <Storefront />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <ProtectedLayout
                  breadcrumbs={[
                    { title: "Dashboard", href: "/" },
                    { title: "Customers" },
                  ]}
                >
                  {/* Placeholder for Customers page */}
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold">Customers</h1>
                    <p>Customer management page will be implemented here.</p>
                  </div>
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
