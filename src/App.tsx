import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Guests from "./pages/Guests";
import Reservations from "./pages/Reservations";
import Layout from "./components/Layout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <Layout>
                <Rooms />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/guests"
          element={
            <ProtectedRoute>
              <Layout>
                <Guests />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reservations"
          element={
            <ProtectedRoute>
              <Layout>
                <Reservations />
              </Layout>
            </ProtectedRoute> 
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
        
export default App;