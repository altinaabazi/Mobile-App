import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, TextInput, Button, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import COLORS from "@/constants/colors";

export default function EditBook() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`http://10.0.2.2:5000/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setBook(data.book);
        setTitle(data.book.title);
        setCaption(data.book.caption);
        setRating(data.book.rating.toString());
      } else {
        Alert.alert("Gabim", data.message || "Nuk u gjet libri");
      }
      setLoading(false);
    };

    if (id) fetchBook();
  }, [id]);

  const handleUpdate = async () => {
    // Kontroll inputeve
    if (!title.trim() || !caption.trim() || !rating.trim()) {
      Alert.alert("Gabim", "Ju lutem plotësoni të gjitha fushat!");
      return;
    }

    const ratingNumber = parseFloat(rating);
    if (isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      Alert.alert("Gabim", "Vlerësimi duhet të jetë numër nga 1 deri në 5.");
      return;
    }

    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`http://10.0.2.2:5000/api/books/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, caption, rating: ratingNumber }),
    });

    if (res.ok) {
      Alert.alert("Sukses", "Libri u përditësua me sukses!", [
        {
          text: "OK",
          onPress: () => router.replace("/admin-dashboard"), // Ose mund të përdorësh router.back()
        },
      ]);
    } else {
      const data = await res.json();
      Alert.alert("Gabim", data.message || "Nuk u përditësua libri");
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Titulli</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Përshkrimi</Text>
      <TextInput style={styles.input} value={caption} onChangeText={setCaption} />

      <Text style={styles.label}>Vlerësimi</Text>
      <TextInput
        style={styles.input}
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
        maxLength={3} // opsionale: për të limituar inputin
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Ruaj Ndryshimet" onPress={handleUpdate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    flex: 1,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
    marginTop: 12,
    color: COLORS.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F9FAFB",
  },
});
