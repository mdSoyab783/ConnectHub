import { Routes, Route } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";

import Home from "../pages/feed/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Profile from "../pages/profile/Profile";
import PublicProfile from "../pages/profile/PublicProfile";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Chat from "../pages/chat/Chat";
const AppRoutes = () => {
  return (
    <Routes>

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Home />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PublicProfile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
<Route
  path="/chat/:conversationId"
  element={
    <ProtectedRoute>
      <MainLayout>
        <Chat />
      </MainLayout>
    </ProtectedRoute>
  }
/>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

    </Routes>
  );
};

export default AppRoutes;