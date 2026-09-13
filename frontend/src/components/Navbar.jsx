import React, { useRef, useState, useEffect } from "react";
import { navbarStyles } from '../assets/dummyStyles';
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User } from 'lucide-react';
import api from '../utils/api';
import Logo from './Logo';

const Navbar = ({ user: propsUser, onLogout }) => {
    const navigate = useNavigate();
    const menuRef = useRef();
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(
        propsUser || { name: "", email: "" }
    );

    // to fetch the user data from server
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await api.get("/user/me");
                const userData = response.data.user || response.data;
                setUser(userData);
            } catch (error) {
                console.error("failed to load profile", error);
            }
        };
        if (!propsUser) {
            fetchUserData();
        }
    }, [propsUser]);

    const toggleMenu = () => setMenuOpen((prev) => !prev);

    const handleLogout=()=>{
        setMenuOpen(false);
        localStorage.removeItem("token");
        onLogout?.();
        navigate("/login");

    };


    //closes the toggle menu if clicked outside the box

     useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  

    return (
        <header className={navbarStyles.header}>
            <div className={navbarStyles.container}>
                {/* logo */}
                <div onClick={() => navigate("/")} className={navbarStyles.logoContainer}>
                    <Logo size={40} />
                    <span className={`${navbarStyles.logoText} ml-2.5`}>Hisab Kitab</span>
                </div>

                {/* if the user is present */}
                {user && (
                    <div className={navbarStyles.userContainer} ref={menuRef}>
                        <button onClick={toggleMenu} className={navbarStyles.userButton}>
                            <div className="relative">
                                <div className={navbarStyles.userAvatar}>
                                    {user?.profilePic ? (
                                        <img src={user.profilePic} alt={user?.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        user?.name?.[0]?.toUpperCase() || "U"
                                    )}
                                </div>
                                <div className={navbarStyles.statusIndicator}></div>
                            </div>
                            <div className={navbarStyles.userTextContainer}>
                                <p className={navbarStyles.userName}>{user?.name || "User"}</p>
                                <p className={navbarStyles.userEmail}>
                                    {user?.email || "user@hisabkitab.com"}
                                </p>
                            </div>
                            <ChevronDown className={navbarStyles.chevronIcon(menuOpen)} />
                        </button>

                        {/* dropdown menu */}
                        {menuOpen && (
                            <div className={navbarStyles.dropdownMenu}>
                                <div className={navbarStyles.dropdownHeader}>
                                    <div className="flex items-center gap-3">
                                        <div className={navbarStyles.dropdownAvatar}>
                                            {user?.profilePic ? (
                                                <img src={user.profilePic} alt={user?.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                user?.name?.[0]?.toUpperCase() || "U"
                                            )}
                                        </div>
                                        <div>
                                            <div className={navbarStyles.dropdownName}>
                                                {user?.name || "User"}
                                            </div>
                                            <div className={navbarStyles.dropdownEmail}>
                                                {user?.email || "user@hisabkitab.com"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={navbarStyles.menuItemContainer}>
                                        <button
                                            onClick={() => {
                                                setMenuOpen(false);
                                                navigate("/profile");
                                            }}
                                            className={navbarStyles.menuItem}
                                        >
                                            <User className="w-4 h-4" />
                                            <span>My Profile</span>
                                        </button>
                                    </div>
                                    <div className={navbarStyles.menuItemBorder}>
                                        <button
                                            onClick={handleLogout  }
                                            className={navbarStyles.logoutButton}
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span> Log Out</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;