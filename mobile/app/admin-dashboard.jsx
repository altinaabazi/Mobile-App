import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminMessage, setAdminMessage] = useState("");

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!user) return;

      if (user.role !== "admin") {
        router.replace("/(tabs)");
        return;
      }

      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(`http://10.0.2.2:5000/api/admin-only`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Access denied");
        }

        setAdminMessage(data.message);
      } catch (err) {
        Alert.alert("Gabim", err.message);
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [user]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4B5563" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>👋 Mirësevjen, {user?.username}!</Text>
        <Text style={styles.message}>{adminMessage}</Text>

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>⬅️ Kthehu mbrapa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: "#374151",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    marginTop: 10,
    backgroundColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 14,
  },
});
