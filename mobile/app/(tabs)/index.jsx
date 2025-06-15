import { 
  View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image, StyleSheet, Pressable 
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../../constants/colors'
import { useBookStore } from '../../store/bookStore'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'
import { useRouter } from 'expo-router';

export default function Home() {
  const { logout, token } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { shouldRefresh, resetRefresh } = useBookStore();
  const router = useRouter();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://10.0.2.2:5000/api/books", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setBooks(data.books);
      } else {
        console.log("Error fetching books:", data.message);
      }
    } catch (error) {
      console.log("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBooks()
      if (shouldRefresh) resetRefresh()
    }, [shouldRefresh])
  );

  const renderBookItem = ({ item }) => (
    <Pressable 
      onPress={() => router.push(`/book/${item._id}`)} 
      style={({ pressed }) => [
        styles.bookCard, 
        pressed && { opacity: 0.7 }
      ]}
    >
      {/* Mund t'i shtosh një imazh nëse ke url në item.image */}
      {/* <Image source={{ uri: item.image }} style={styles.bookImage} /> */}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookCaption} numberOfLines={3}>{item.caption}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Book List</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item._id}
          renderItem={renderBookItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>No books found. Add some!</Text>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: COLORS.backgroundLight,
  },
 header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 0, // pa padding ekstra
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  logoutButton: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 30,
    backgroundColor: COLORS.primary, // ngjyra kryesore tëndë
    alignItems: "center",
  },
  logoutText: {
    color: COLORS.white,
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 16,
  },

  bookCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 20,
    marginBottom: 18,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  bookInfo: {
    flex: 1,
    marginRight: 10,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  bookCaption: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 22,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: COLORS.textSecondary,
    fontSize: 18,
  },
  // Nëse do shtosh imazhe për kartela:
  bookImage: {
    width: 60,
    height: 90,
    borderRadius: 12,
    marginRight: 15,
  },
});
