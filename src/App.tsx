import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import Orders from "./pages/orders/Orders";
import OrderDetail from "./pages/orders/OrderDetail";
import Catalog from "./pages/catalog/Catalog";
import CatalogDetail from "./pages/catalog/CatalogDetail";
import { CatalogEditor } from "./pages/catalog/CatalogEditor";
import Inventory from "./pages/inventory/Inventory";
import Promotions from "./pages/promotions/Promotions";
import PromotionEditor from "./pages/promotions/PromotionEditor";
import Reports from "./pages/reports/Reports";
import Storefront from "./pages/storefront/Storefront";
import Announcements from "./pages/announcements/Announcements";
import AnnouncementEditor from "./pages/announcements/AnnouncementEditor";
import { useAuth } from "./features/auth/hooks/useAuth";
import { ProtectedLayout } from "./components/protected-layout";
import Category from "./pages/category/Category";

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
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <ProtectedLayout
                  breadcrumbs={[
                    { title: "Dashboard", href: "/" },
                    { title: "Orders", href: "/orders" },
                    { title: "Order Detail" },
                  ]}
                >
                  <OrderDetail />
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
                    { title: "Detail Produk" },
                  ]}
                >
                  <CatalogDetail />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalog/edit/:slug"
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
          <Route
            path="/announcements"
            element={
              <ProtectedRoute>
                <ProtectedLayout
                  breadcrumbs={[
                    { title: "Dashboard", href: "/" },
                    { title: "Announcements" },
                  ]}
                >
                  <Announcements />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements/new"
            element={
              <ProtectedRoute>
                <ProtectedLayout
                  breadcrumbs={[
                    { title: "Dashboard", href: "/" },
                    { title: "Announcements", href: "/announcements" },
                    { title: "Tambah Pengumuman" },
                  ]}
                >
                  <AnnouncementEditor />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements/:id"
            element={
              <ProtectedRoute>
                <ProtectedLayout
                  breadcrumbs={[
                    { title: "Dashboard", href: "/" },
                    { title: "Announcements", href: "/announcements" },
                    { title: "Edit Pengumuman" },
                  ]}
                >
                  <AnnouncementEditor />
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
