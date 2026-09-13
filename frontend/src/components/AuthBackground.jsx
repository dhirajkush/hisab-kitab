import React from "react";

const AuthBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-24 -left-24 w-72 h-72 bg-teal-300/40 rounded-full blur-3xl" />
    <div className="absolute -bottom-32 -right-16 w-96 h-96 bg-cyan-300/40 rounded-full blur-3xl" />
    <div className="absolute top-1/3 right-1/4 w-56 h-56 bg-amber-200/30 rounded-full blur-3xl" />
  </div>
);

export default AuthBackground;
