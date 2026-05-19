import { Navigate, Route, Routes } from "react-router-dom";

import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { useAuth } from "./auth/AuthContext";

import Landing from "./pages/Landing";
import Directory from "./pages/Directory";
import ProfileDetail from "./pages/ProfileDetail";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import MagicLinkLand from "./pages/MagicLinkLand";
import MyProfile from "./pages/MyProfile";
import Admin from "./pages/Admin";

function ProtectedRoute({ children, admin }: { children: JSX.Element; admin?: boolean }) {
  const { me, loading } = useAuth();
  if (loading) return null;
  if (!me) return <Navigate to="/sign-in" replace />;
  if (admin && !me.is_admin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/directory/:id" element={<ProfileDetail />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/auth/callback" element={<MagicLinkLand />} />
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute admin>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
