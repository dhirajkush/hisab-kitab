import React, { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expense from "./pages/Expense";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import api from "./utils/api";

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to read stored user:", error);
    return null;
  }
};

const App = () => {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const handleLoginSuccess = (userData, authToken, refreshToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    setUser(userData);
    setToken(authToken);
  };

  const handleUpdateUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await api.post("/user/logout");
    } catch (error) {
      console.error("logout request failed:", error);
    }
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    } catch (error) {
      console.error("clearAuth error:", error);
    }
    setUser(null);
    setToken(null);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
      />
      <Route
        path="/signup"
        element={token ? <Navigate to="/" replace /> : <Signup onLoginSuccess={handleLoginSuccess} />}
      />

      <Route
        element={
          token ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/income" element={<Income />} />
        <Route path="/expense" element={<Expense />} />
        <Route path="/profile" element={<Profile user={user} onUpdateUser={handleUpdateUser} />} />
      </Route>

      <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
    </Routes>
  );
};

export default App;
