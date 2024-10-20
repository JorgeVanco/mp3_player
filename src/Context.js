import React, { createContext, useContext, useState } from 'react';

export const MyContext = createContext();

export const MyProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    return (
        <MyContext.Provider value={{ user, setUser }}>
            {children}
        </MyContext.Provider>
    );
};