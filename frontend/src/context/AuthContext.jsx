import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('partner_token');
        const username = localStorage.getItem('partner_user');
        if (token && username) {
            setUser({ username, token });
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        localStorage.setItem('partner_token', userData.access_token);
        localStorage.setItem('partner_user', userData.username);
        setUser({ username: userData.username, token: userData.access_token });
    };

    const logout = () => {
        localStorage.removeItem('partner_token');
        localStorage.removeItem('partner_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
