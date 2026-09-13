import React from "react";
import { Wallet } from "lucide-react";

const Logo = ({ size = 40, className = "" }) => (
  <div
    className={`relative flex items-center justify-center rounded-[28%] bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600 shadow-lg shadow-teal-500/40 ring-1 ring-white/50 ${className}`}
    style={{ width: size, height: size, flexShrink: 0 }}
  >
    {/* glossy top highlight for depth */}
    <div className="absolute inset-0 rounded-[28%] bg-gradient-to-b from-white/35 via-white/5 to-transparent pointer-events-none" />
    {/* soft inner glow */}
    <div
      className="absolute rounded-full bg-white/20 blur-md pointer-events-none"
      style={{ width: size * 0.55, height: size * 0.55, top: size * -0.05, left: size * -0.05 }}
    />

    <Wallet
      className="relative text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]"
      style={{ width: size * 0.5, height: size * 0.5 }}
      strokeWidth={2.3}
    />

    <span
      className="absolute flex items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-teal-900 font-extrabold leading-none shadow-md ring-2 ring-white"
      style={{
        width: size * 0.42,
        height: size * 0.42,
        fontSize: size * 0.22,
        bottom: size * -0.09,
        right: size * -0.09,
      }}
    >
      ₹
    </span>
  </div>
);

export default Logo;
