


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

import { API_URL } from "../../constants/api";
import COLORS from "../../constants/colors";

const Profile = () => {
  const router = useRouter();

  // ──────────────────────── state ────────────────────────
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState({});

  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileImage, setProfileImage] = useState(null);

  const [booksModalVisible, setBooksModalVisible] = useState(false);
  const [books, setBooks] = useState([]);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editBookId, setEditBookId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editRating, setEditRating] = useState("");

  // ──────────────────── helpers / api calls ────────────────────
  // const pickImage = async () => {
  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (status !== "granted") {
  //     Alert.alert("Leje e refuzuar", "S’ke dhënë leje për qasje në galeri.");
  //     return;
  //   }

  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [1, 1],
  //     quality: 1,
  //   });

  //   if (!result.canceled) {
  //     const imageUri = result.assets[0].uri;
  //     const formData = new FormData();
  //     formData.append("file", {
  //       uri: imageUri,
  //       type: "image/jpeg",
  //       name: "profile.jpg",
  //     });
  //     formData.append("upload_preset", "preset_i_sakte"); // ← zëvendëso
  //     try {
  //       const res = await fetch(
  //         "https://api.cloudinary.com/v1_1/emri_real/image/upload",
  //         { method: "POST", body: formData }
  //       );
  //       const data = await res.json();
  //       if (data.secure_url) {
  //         setProfileImage(data.secure_url);
  //         setUpdatedData((prev) => ({ ...prev, profileImage: data.secure_url }));
  //       } else {
  //         Alert.alert("Gabim", "Nuk u mor URL e fotos.");
  //       }
  //     } catch (err) {
  //       Alert.alert("Gabim gjatë ngarkimit të fotos", err.message);
  //     }
  //   }
  // };

   const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Leje e refuzuar", "S’ke dhënë leje për qasje në galeri.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true, // <-- Kjo e bën të mundur marrjen e base64
    });

    if (!result.canceled) {
      // Konverto në data URL (base64)
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfileImage(base64Img);

      // Përditëso edhe updatedData me këtë foto (e dërgojmë në backend)
      setUpdatedData((prev) => ({ ...prev }));
    }
  };

  // const fetchProfile = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem("token");
  //     if (!token) {
  //       Alert.alert("Error", "No token found.");
  //       return;
  //     }
  //     const res = await fetch(`${API_URL}/api/users/profile`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.message);
  //     setUser(data.user);
  //     setUpdatedData({
  //       username: data.user.username,
  //       email: data.user.email,
  //     });
  //   } catch (err) {
  //     Alert.alert("Error", err.message || "Profile fetch failed.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No token found.");
        return;
      }
      const res = await fetch(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUser(data.user);
      setUpdatedData({
        username: data.user.username,
        email: data.user.email,
      });
      setProfileImage(data.user.profileImage || null);
    } catch (err) {
      Alert.alert("Error", err.message || "Profile fetch failed.");
    } finally {
      setLoading(false);
    }
  };

  // const handleUpdate = async () => {
  //   try {
  //     if (!updatedData.email.includes("@"))
  //       return Alert.alert("Gabim", "Shkruaj një email të vlefshëm.");
  //     const token = await AsyncStorage.getItem("token");
  //     const res = await fetch(`${API_URL}/api/users/update`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  //       body: JSON.stringify({
  //         username: updatedData.username,
  //         email: updatedData.email,
  //         profileImage,
  //       }),
  //     });
  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.message);
  //     Alert.alert("Sukses", "Profili u përditësua me sukses");
  //     setEditing(false);
  //     fetchProfile();
  //   } catch (err) {
  //     Alert.alert("Gabim", err.message);
  //   }
  // };
const handleUpdate = async () => {
    try {
      if (!updatedData.email.includes("@"))
        return Alert.alert("Gabim", "Shkruaj një email të vlefshëm.");

      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: updatedData.username,
          email: updatedData.email,
          profileImage, // kjo mund të jetë ose data URL (base64) ose URL e Cloudinary në backend
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      Alert.alert("Sukses", "Profili u përditësua me sukses");
      setEditing(false);
      fetchProfile(); // rifresko të dhënat për të marrë URL-në e re të fotos
    } catch (err) {
      Alert.alert("Gabim", err.message);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6)
      return Alert.alert("Gabim", "Fjalëkalimi duhet të jetë të paktën 6 karaktere.");
    if (newPassword !== confirmPassword)
      return Alert.alert("Gabim", "Fjalëkalimet nuk përputhen.");

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      Alert.alert("Sukses", "Fjalëkalimi u ndryshua me sukses.");
      setChangingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      Alert.alert("Gabim", err.message);
    }
  };

  // ───────────── books helpers (shkurtesë pa dublim fetch) ─────────────
  const fetchBooks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/books/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBooks(data);
    } catch (err) {
      Alert.alert("Gabim", err.message);
    }
  };

  const deleteBook = async (id) => {
    Alert.alert("Konfirmo", "A je i sigurt që dëshiron të fshish librin?", [
      { text: "Anulo", style: "cancel" },
      {
        text: "Fshi",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/books/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Nuk u fshi libri");
            setBooks((prev) => prev.filter((b) => b._id !== id));
            Alert.alert("Sukses", "Libri u fshi me sukses");
          } catch (err) {
            Alert.alert("Gabim", err.message);
          }
        },
      },
    ]);
  };
    const saveEdit = async () => {
    if (!editTitle.trim()) {
      Alert.alert("Gabim", "Titulli nuk mund të jetë bosh.");
      return;
    }
    const ratingNumber = parseFloat(editRating);
    if (isNaN(ratingNumber) || ratingNumber < 0 || ratingNumber > 5) {
      Alert.alert("Gabim", "Rating duhet të jetë numër nga 0 në 5.");
      return;
    }

    const token = await AsyncStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/books/${editBookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          caption: editCaption,
          rating: ratingNumber,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Nuk u përditësua libri");
      }

      const updatedBook = await res.json();
      setBooks((prev) =>
        prev.map((book) => (book._id === editBookId ? updatedBook : book))
      );
      setEditModalVisible(false);
      Alert.alert("Sukses", "Libri u përditësua me sukses");
    } catch (error) {
      Alert.alert("Gabim", error.message);
    }
  };

  // ───────────────────────── lifecycle ─────────────────────────
  useEffect(() => {
    fetchProfile();
  }, []);

  // ─────────────────────────── render ──────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No user data found.</Text>
      </View>
    );
  }

  const avatarSrc = profileImage || user.profileImage;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─────────────── avatar ─────────────── */}
        <View style={styles.avatarWrapper}>
          {avatarSrc ? (
            <Image source={{ uri: avatarSrc }} style={styles.image} />
          ) : (
            <Ionicons name="person" size={80} color={COLORS.primary} />
          )}

          <TouchableOpacity onPress={pickImage} style={styles.editAvatarButton}>
            <Ionicons name="camera" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* ──────────── content (varying) ──────────── */}
        {editing ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={updatedData.username}
              onChangeText={(t) => setUpdatedData({ ...updatedData, username: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={updatedData.email}
              keyboardType="email-address"
              onChangeText={(t) => setUpdatedData({ ...updatedData, email: t })}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.buttonPrimary} onPress={handleUpdate}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonCancel}
              onPress={() => setEditing(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : changingPassword ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Fjalëkalimi i ri"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Konfirmo fjalëkalimin"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={handleChangePassword}
            >
              <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonCancel}
              onPress={() => setChangingPassword(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.text}>
              Username: <Text style={styles.info}>{user.username}</Text>
            </Text>
            <Text style={styles.text}>
              Email: <Text style={styles.info}>{user.email}</Text>
            </Text>

            {/* ─────────── general buttons ─────────── */}
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={() => setEditing(true)}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonSecondary, { marginTop: 12 }]}
              onPress={() => setChangingPassword(true)}
            >
              <Text style={styles.buttonTextSecondary}>Change Password</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonSecondary, { marginTop: 12 }]}
              onPress={() => {
                setBooksModalVisible(true);
                if (!books.length) fetchBooks();
              }}
            >
              <Text style={styles.buttonTextSecondary}>Show Books</Text>
            </TouchableOpacity>
        <TouchableOpacity
  style={[styles.buttonSecondary, { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
  onPress={() => router.push('/calendar')}
>
  <Ionicons name="calendar" size={20} color="green" style={{ marginRight: 8 }} />
  <Text style={styles.buttonTextSecondary}>My Events</Text>
</TouchableOpacity>



            {/* ──────────── admin button ──────────── */}
            {user.role === "admin" && (
  <TouchableOpacity
    style={[
      styles.buttonPrimary,
      { marginTop: 20, backgroundColor: "#2e7d32" },
    ]}
    onPress={() => router.push("/admin-dashboard")}
  >
    
    <Text style={styles.buttonText}>Dashboard</Text>
  </TouchableOpacity>
)}

          </>
        )}

        {/* ──────────── modals për librat ──────────── */}
        {booksModalVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.booksModal}>
              <Text style={styles.modalTitle}>My Books</Text>
              <ScrollView>
                {books.map((b) => (
                  <View key={b._id} style={styles.bookCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bookTitle}>{b.title}</Text>
                      <Text>{b.caption}</Text>
                      <Text>Rating: {b.rating}</Text>
                    </View>
                    <View style={styles.iconsContainer}>
                      <TouchableOpacity
                        onPress={() =>
                          (setEditBookId(b._id),
                          setEditTitle(b.title),
                          setEditCaption(b.caption),
                          setEditRating((b.rating || "").toString()),
                          setEditModalVisible(true))
                        }
                      >
                        <Ionicons name="pencil" size={22} color={COLORS.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteBook(b._id)}>
                        <Ionicons name="trash" size={22} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={[styles.buttonCancel, { marginTop: 20 }]}
                onPress={() => setBooksModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ──────────── modal edit book ──────────── */}
        {editModalVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.editModal}>
              <Text style={styles.modalTitle}>Edit Book</Text>
              <TextInput
                placeholder="Titulli"
                value={editTitle}
                onChangeText={setEditTitle}
                style={styles.input}
              />
              <TextInput
                placeholder="Përshkrimi"
                value={editCaption}
                onChangeText={setEditCaption}
                style={styles.input}
              />
              <TextInput
                placeholder="Rating (0-5)"
                value={editRating}
                onChangeText={setEditRating}
                keyboardType="numeric"
                style={styles.input}
              />
              <TouchableOpacity style={styles.buttonPrimary} onPress={saveEdit}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonCancel}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Profile;

/* ────────────────────────── styles ────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  loadingWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },

  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 7,
    position: "relative",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 5,
  },

  text: { fontSize: 20, color: COLORS.primaryDark, marginBottom: 8, fontWeight: "600" },
  info: { color: COLORS.secondary, fontWeight: "bold" },

  input: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 18,
    fontSize: 16,
  },

  buttonPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  buttonSecondary: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  buttonCancel: {
    backgroundColor: "#e53935",
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  buttonTextSecondary: { color: COLORS.primary, fontWeight: "700", fontSize: 16 },
  error: { fontSize: 16, color: "red" },

  /* books + modal */
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  booksModal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    width: "100%",
    maxHeight: "80%",
  },
  editModal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    width: "100%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },

  bookCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    alignItems: "flex-start",
    position: "relative",
  },
  bookTitle: { fontWeight: "bold", fontSize: 16 },
  iconsContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    gap: 15,
  },
});
