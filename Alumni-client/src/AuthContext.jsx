import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';  // Import UserContext for managing user state

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const { currentUser, setCurrentUser } = useUser();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!currentUser);

    useEffect(() => {
        const storedUserType = localStorage.getItem('user_type');
        const storedUser = localStorage.getItem('currentUser');

        if (storedUserType && storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setCurrentUser(user);
                setIsLoggedIn(true);
                setIsAdmin(storedUserType === 'admin');
            } catch (e) {
                console.error('Error parsing stored user data:', e);
                setIsLoggedIn(false);
                setIsAdmin(false);
                localStorage.removeItem('user_type');
                localStorage.removeItem('currentUser');
            }
        }
    }, [setCurrentUser]);

    const login = (user) => {
        setIsLoggedIn(true);
        setIsAdmin(user.type === 'admin');
        setCurrentUser(user);
        localStorage.setItem('user_type', user.type);
        localStorage.setItem('currentUser', JSON.stringify(user));
    };

    const logout = () => {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setCurrentUser(null);
        localStorage.removeItem('user_type');
        localStorage.removeItem('currentUser');
    };

    // FIX: Add currentUser to the context value as "user"
    return (
        <AuthContext.Provider value={{ isLoggedIn, isAdmin, user: currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};