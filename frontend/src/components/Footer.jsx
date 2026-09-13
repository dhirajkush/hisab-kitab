import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import SupportModal from "./SupportModal";

const LINKS = [
  { text: "Dashboard", path: "/" },
  { text: "Income", path: "/income" },
  { text: "Expenses", path: "/expense" },
  { text: "Profile", path: "/profile" },
];

const Footer = () => {
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <footer className="mt-10 border-t border-gray-200 pt-6 pb-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <div>
            <p className="font-bold text-gray-800 text-sm">Hisab Kitab</p>
            <p className="text-xs text-gray-500">Track income, expenses, and savings — all in one place.</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {LINKS.map(({ text, path }) => (
            <Link key={text} to={path} className="text-sm text-gray-500 hover:text-teal-600 transition-colors">
              {text}
            </Link>
          ))}
          <button
            onClick={() => setShowSupportModal(true)}
            className="text-sm text-gray-500 hover:text-teal-600 transition-colors"
          >
            Support
          </button>
        </nav>
      </div>

      <p className="text-center sm:text-left text-xs text-gray-400 mt-6">
        © {new Date().getFullYear()} Hisab Kitab. All rights reserved.
      </p>

      {showSupportModal && <SupportModal onClose={() => setShowSupportModal(false)} />}
    </footer>
  );
};

export default Footer;
