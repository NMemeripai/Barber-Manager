import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Configuracion from "./pages/Configuracion";
import Servicios from "./pages/Servicios";
import Productos from "./pages/Productos";
import Clientes from "./pages/Clientes";
import Ventas from "./pages/Ventas";
import Agenda from "./pages/Agenda";
import Estadisticas from "./pages/Estadisticas";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracion"
            element={
              <ProtectedRoute>
                <Configuracion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicios"
            element={
              <ProtectedRoute>
                <Servicios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/productos"
            element={
              <ProtectedRoute>
                <Productos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clientes"
            element={
              <ProtectedRoute>
                <Clientes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ventas"
            element={
              <ProtectedRoute>
                <Ventas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agenda"
            element={
              <ProtectedRoute>
                <Agenda />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estadisticas"
            element={
              <ProtectedRoute>
                <Estadisticas />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
