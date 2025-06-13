import { 
  View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image, StyleSheet 
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../../constants/colors' // përdor ngjyrat nga aty
import { useBookStore } from '../../store/bookStore'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'
export default function Home() {
  const { logout, token } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
 const { shouldRefresh, resetRefresh } = useBookStore()

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
)
  const renderBookItem = ({ item }) => (
    <View style={styles.bookCard}>
      {/* Nëse ke imazhe për librat, mund ta shfaqësh me <Image> */}
      {/* <Image source={{ uri: item.imageUrl }} style={styles.bookImage} /> */}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookCaption}>{item.caption}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={COLORS.starYellow} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Book List</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 6,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  bookCaption: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginVertical: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: '600',
    color: COLORS.starYellow,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});
