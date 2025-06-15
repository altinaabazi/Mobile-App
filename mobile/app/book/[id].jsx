import { View, Text, ActivityIndicator, StyleSheet, Image, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import COLORS from '../../constants/colors'; // ngjyrat

export default function BookDetails() {
  const { id } = useLocalSearchParams();
  const { token } = useAuthStore();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`http://10.0.2.2:5000/api/books/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setBook(data.book);
        } else {
          console.log("Gabim:", data.message);
        }
      } catch (err) {
        console.log("Gabim:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBook();
  }, [id]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;
  }

  if (!book) {
    return <Text style={{ textAlign: "center", marginTop: 20, fontSize: 16, color: COLORS.textSecondary }}>Libri nuk u gjet.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {book.image && (
        <Image source={{ uri: book.image }} style={styles.bookImage} resizeMode="cover" />
      )}
      <View style={styles.card}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.caption}>{book.caption}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>Vlerësimi:</Text>
          <Text style={styles.rating}>{book.rating}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.backgroundLight,
    alignItems: "center",
  },
  bookImage: {
    width: "100%",
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
    backgroundColor: COLORS.backgroundMedium,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 25,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    marginBottom: 15,
  },
  caption: {
    fontSize: 18,
    color: COLORS.textSecondary,
    lineHeight: 26,
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginRight: 10,
  },
  rating: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.starYellow,
  },
});
