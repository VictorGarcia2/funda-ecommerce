import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { CartProvider } from "./context/CartContext";
import Layout from "./components/layout/Layout";
import { ThemeProvider } from "./hooks/useTheme";

// Lazy loading de componentes
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const CustomizeCase = lazy(() => import("./pages/CustomizeCase"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/admin/Admin"));

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen text-neon-blue">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
};

const App = () => {
  return (
    <ThemeProvider>
    <Router>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-neon-blue">Cargando...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/customize" element={<CustomizeCase />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </Router>
    </ThemeProvider>
  );
};

export default App;
