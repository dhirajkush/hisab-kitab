import React, { useEffect, useRef } from "react";
import api from "../utils/api";

// true once a real Client ID has been dropped into the .env files (see backend/.env and frontend/.env)
export const isGoogleAuthConfigured = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return Boolean(clientId) && !clientId.startsWith("REPLACE_");
};

const GoogleSignInButton = ({ onSuccess, onError }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let pollId = null;

    const handleCredential = async ({ credential }) => {
      try {
        const { data } = await api.post("/user/google", { credential });
        if (data.success) onSuccess(data.user, data.token, data.refreshToken);
      } catch (err) {
        onError?.(err.response?.data?.message || "Google sign-in failed");
      }
    };

    const init = () => {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredential,
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    };

    if (window.google?.accounts?.id) {
      init();
    } else {
      pollId = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(pollId);
          init();
        }
      }, 200);
    }

    return () => {
      cancelled = true;
      if (pollId) clearInterval(pollId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={buttonRef} className="flex justify-center" />;
};

export default GoogleSignInButton;
