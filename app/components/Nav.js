"use client";
import React, { useEffect, useState } from 'react';

const Nav = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if the user is logged in by checking the token in localStorage
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        // Clear localStorage and reload the page
        localStorage.clear();
        window.location.reload();
    };

    const handleLogin = () => {
        // Redirect to the login page
        window.location.href = "/";
    };

    return (
        <nav className="w-1/6 h-full bg-white border-r-2 border-purple-100 shadow-lg">
            <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-white">
                <h2 className="text-xl font-bold text-purple-800">Automatic Index Management</h2>
            </div>
            <div className="p-4">
                <ul className="space-y-3">
                    <li>
                        <a href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-100 bg-gray-  transition-all duration-300 group">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                            <span className="font-medium group-hover:text-purple-700">Dashboard</span>
                        </a>
                    </li>
                    <li>
                        <a href="/query" className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-100 bg-gray- transition-all duration-300 group">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            <span className="font-medium group-hover:text-purple-700">Query Logs</span>
                        </a>
                    </li>
                    <li>
                        <a href="/recommend" className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-100 bg-gray- transition-all duration-300 group">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                            Recommendations
                        </a>
                    </li>
                </ul>
            </div>
            <div className="absolute bottom-0 left-3 w-5/6 p-4">
                <div className="flex items-center gap-2">

                    <div>
                        {isLoggedIn ? (
                            <> 
                                <p className="text-sm font-medium">Database Admin</p>
                                <p className="text-xs text-gray-500">RajaUmer@admin.com</p>
                                <button
                                    onClick={handleLogout}
                                    className="mt-2 text-sm text-red-500 hover:underline"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <> 
                             
                                <p className="text-sm font-medium">Guest Mode</p>
                                <button
                                    onClick={handleLogin}
                                    className="mt-2 text-sm text-blue-500 hover:underline"
                                >
                                    Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Nav;