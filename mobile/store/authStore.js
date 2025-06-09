import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,

    register: async (username, email, password) => {
        set({ isLoading: true });
        try {
            const response = await fetch("https://mobile-app-2-3l39.onrender.com/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            });

            const data = await response.json();
            console.log("Response from backend:", data);

            if (!response.ok) throw new Error(data.message || "Something went wrong");

            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.token);

            set({ token: data.token, user: data.user, isLoading: false });

            return { success: true };
        } catch (error) {
            console.log("Registration error:", error.message);
            set({ isLoading: false });
            return { success: false, error: error.message };
        }
    },

    login: async(email,password) => {
        set({isLoading:true});
        try{
           const response = await fetch("https://mobile-app-2-3l39.onrender.com/api/auth/login",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password
            }),
        });
        const data = await response.json();
        console.log("Login response:", data);

        if (!response.ok) throw new Error(data.message || "Login failed");

        // Ruaj token dhe user në AsyncStorage
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("token", data.token);

        // Ruaj në Zustand
        set({
            token: data.token,
            user: data.user,
            isLoading: false,
        });

        return { success: true };
    } catch (error) {
        console.error("Login error:", error.message);
        set({ isLoading: false });
        return { success: false, error: error.message };
    }
    },
    checkAuth: async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const userJson = await AsyncStorage.getItem("user");
            const user = userJson ? JSON.parse(userJson) : null;
            set({ token, user });
        } catch (error) {
            console.log("Auth check failed", error);
        }
    },

    logout: async() =>{
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        set({token:null,user:null});
    }
}));
