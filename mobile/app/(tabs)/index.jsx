import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { useBookStore } from '../../store/bookStore';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

export default function Home() {
  const { logout, token } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const { shouldRefresh, resetRefresh } = useBookStore();
  const router = useRouter();
  const [previousBooks, setPreviousBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://10.0.2.2:5000/api/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBooks(data.books);

        if (previousBooks.length > 0) {
          const newBooks = data.books.filter(
            (book) => !previousBooks.some((prev) => prev._id === book._id)
          );
          setNotificationsCount(newBooks.length);
        }

        setPreviousBooks(data.books);
      } else {
        console.log('Error fetching books:', data.message);
      }
    } catch (error) {
      console.log('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
      if (shouldRefresh) resetRefresh();
    }, [shouldRefresh])
  );

  const handleLogout = () => {
    setNotificationsCount(0);
    setBooks([]);
    setPreviousBooks([]);
    logout();
  };

  const renderBookItem = ({ item }) => (
    <Pressable
      onPress={() => router.push(`/book/${item._id}`)}
      style={({ pressed }) => [
        styles.bookCard,
        pressed && { opacity: 0.7 }
      ]}
    >
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookCaption} numberOfLines={3}>{item.caption}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
    </Pressable>
  );

  // Kërkimi
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.caption.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity
    style={styles.createButton}
    onPress={() => router.push('/create')} // ndrysho path sipas rutës së krijimit të librit
  >
    <Ionicons name="add-circle-outline" size={24} color='green' />
    <Text style={styles.createButtonText}>Create</Text>
  </TouchableOpacity>
        <Text style={styles.title}>Books</Text>
        {notificationsCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>{notificationsCount}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.white} />
          {/* <Text style={styles.logoutText}></Text> */}
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search books..."
        placeholderTextColor={COLORS.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={filteredBooks}
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
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 16,
  },
  notificationBadge: {
    position: 'absolute',
    top: -10,
    right: 100,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 10,
  },
  notificationText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    color: COLORS.primaryDark,
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
});
