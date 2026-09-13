import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { signupStyles as s } from "../assets/dummyStyles";
import api from "../utils/api";
import Logo from "../components/Logo";
import AuthBackground from "../components/AuthBackground";
import GoogleSignInButton, { isGoogleAuthConfigured } from "../components/GoogleSignInButton";

const Signup = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/user/register", form);
      if (data.success) {
        onLoginSuccess(data.user, data.token, data.refreshToken);
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${s.pageContainer} relative overflow-hidden`}>
      <AuthBackground />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`${s.cardContainer} relative z-10`}
      >
        <div className={s.header}>
          <button onClick={() => navigate("/login")} className={s.backButton}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Logo size={72} className="mx-auto mb-4" />
          <h1 className={s.headerTitle}>Create Account</h1>
          <p className={s.headerSubtitle}>Start tracking your budget today</p>
        </div>

        <div className={s.formContainer}>
          {error && <p className={s.apiError}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className={s.label}>Full Name</label>
              <div className={s.inputContainer}>
                <span className={s.inputIcon}>
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className={s.input}
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className={s.label}>Email</label>
              <div className={s.inputContainer}>
                <span className={s.inputIcon}>
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className={s.input}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="mb-2">
              <label className={s.label}>Password</label>
              <div className={s.inputContainer}>
                <span className={s.inputIcon}>
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={handleChange}
                  className={s.passwordInput}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className={s.passwordToggle}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${s.button} ${loading ? s.buttonDisabled : ""} mt-6`}
            >
              {loading && <Loader2 className={s.spinner} />}
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {isGoogleAuthConfigured() && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <GoogleSignInButton
                onSuccess={(user, token, refreshToken) => {
                  onLoginSuccess(user, token, refreshToken);
                  navigate("/");
                }}
                onError={setError}
              />
            </>
          )}

          <div className={s.signInContainer}>
            <span className={s.signInText}>Already have an account? </span>
            <Link to="/login" className={s.signInLink}>
              Log in
            </Link>
          </div>
        </div>
      </motion.div>
      <p className="relative z-10 text-center text-xs text-gray-400 mt-6">
        © {new Date().getFullYear()} Hisab Kitab. All rights reserved.
      </p>
    </div>
  );
};

export default Signup;
