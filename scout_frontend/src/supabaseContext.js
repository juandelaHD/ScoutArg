import React, { createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

let supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SupabaseContext = createContext();

export const SupabaseProvider = ({ children }) => {
    const login = (userData) => {
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${userData.token}`,
                },
            },
        });
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            localStorage.removeItem("current_user");
            localStorage.removeItem("current_user_data");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <SupabaseContext.Provider value={{ supabase, login, logout }}>
            {children}
        </SupabaseContext.Provider>
    );
};

export const useSupabase = () => useContext(SupabaseContext);
