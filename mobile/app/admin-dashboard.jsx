
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminMessage, setAdminMessage] = useState("");
  const [stats, setStats] = useState(null);

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
          headers: { Authorization: `Bearer ${token}` },
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(`http://10.0.2.2:5000/api/books/stats`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Gabim duke marrë statistikat:", error);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007AFF" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.welcome}>👋 Mirësevjen, <Text style={styles.username}>{user?.username}</Text>!</Text>
        <Text style={styles.adminMessage}>{adminMessage}</Text>

        {!stats ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>📊 Statistikat e librave</Text>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>📚 Total libra:</Text>
              <Text style={styles.statValue}>{stats.totalBooks}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>🆕 Libra këtë javë:</Text>
              <Text style={styles.statValue}>{stats.recentBooks}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>⭐ Vlerësimi mesatar:</Text>
              <Text style={styles.statValue}>{stats.avgRating}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backButtonText}>⬅️ Kthehu mbrapa</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#00000040",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 16,
  },
  welcome: {
    fontSize: 18,
    color: "#555",
    marginBottom: 12,
  },
  username: {
    fontWeight: "700",
    color: "#007AFF",
  },
  adminMessage: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  statsContainer: {
    width: "100%",
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 12,
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomColor: "#E0E7FF",
    borderBottomWidth: 1,
  },
  statLabel: {
    fontSize: 16,
    color: "#444",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 25,
  },
  backButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
