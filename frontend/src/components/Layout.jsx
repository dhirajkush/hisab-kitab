import React, { useState } from "react";
import { styles } from "../assets/dummyStyles";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const Layout = ({ onLogout, user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={styles.layout.root}>
      <Navbar user={user} onLogout={onLogout} />
      <Sidebar user ={user}
      isCollapsed ={sidebarCollapsed}
      setIsCollapsed={setSidebarCollapsed}
      onLogout={onLogout}
      />
      <main className={styles.layout.mainContainer(sidebarCollapsed)}>
        <Outlet />
        <Footer />
      </main>
    </div>
  );
};

export default Layout;
