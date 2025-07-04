// import React, { useState } from 'react'
// import {
//   View, Text, TextInput, TouchableOpacity,
//   ScrollView, KeyboardAvoidingView, Platform,
//   Image, Alert, ActivityIndicator, StyleSheet
// } from 'react-native'
// import { Ionicons } from '@expo/vector-icons'
// import * as ImagePicker from 'expo-image-picker'
// import * as FileSystem from 'expo-file-system'
// import COLORS from '../constants/colors'
// import { useRouter } from 'expo-router'
// import { useAuthStore } from '../store/authStore' // nëse ke token për autorizim
// import { useBookStore } from '../store/bookStore'

// export default function Create() {
//   const [title, setTitle] = useState('')
//   const [caption, setCaption] = useState('')
//   const [rating, setRating] = useState(3)
//   const [image, setImage] = useState(null)
//   const [imageBase64, setImageBase64] = useState(null)
//   const [loading, setLoading] = useState(false)
  

//   const router = useRouter()
//   const { token } = useAuthStore() // Nëse ke token, e vendos në header

//   const pickImage = async () => {
//     try {
//       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
//       if (status !== 'granted') {
//         Alert.alert('Permission Denied', 'We need access to your photo library.')
//         return
//       }

//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.5,
//         base64: true,
//       })

//       if (!result.canceled) {
//         setImage(result.assets[0].uri)
//         if (result.assets[0].base64) {
//           setImageBase64(result.assets[0].base64)
//         } else {
//           // Nëse nuk ka base64 direkt, e konvertojmë
//           const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
//             encoding: FileSystem.EncodingType.Base64,
//           })
//           setImageBase64(base64)
//         }
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Could not pick the image.')
//     }
//   }

//   const handleSubmit = async () => {
//     if (!title || !caption || !imageBase64) {
//       Alert.alert('Error', 'Please fill in all fields and select an image.')
//       return
//     }

//     setLoading(true)
//     try {
//       const uriParts = image.split('.')
//       const fileType = uriParts[uriParts.length - 1]
//       const imageType = `image/${fileType.toLowerCase()}`

//       const imageDataUrl = `data:${imageType};base64,${imageBase64}`

//       const response = await fetch('http://10.0.2.2:5000/api/books', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//            Authorization: `Bearer ${token}`,  
//         },
//         body: JSON.stringify({
//           title,
//           caption,
//           rating: rating.toString(),
//           image: imageDataUrl,
//         }),
//       })

//       const data = await response.json()
//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to create book.')
//       }

//       Alert.alert('Success', 'Your book has been shared.')
//       setTitle('')
//       setCaption('')
//       setRating(3)
//       setImage(null)
//       setImageBase64(null)
//       router.push('/') // Kthehu në Home
// useBookStore.getState().triggerRefresh()
// router.push('/')

//     } catch (error) {
//       Alert.alert('Error', error.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const renderRatingPicker = () => {
//     const stars = []
//     for (let i = 1; i <= 5; i++) {
//       stars.push(
//         <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
//           <Ionicons
//             name={i <= rating ? 'star' : 'star-outline'}
//             size={32}
//             color={i <= rating ? COLORS.starYellow : COLORS.textSecondary}
//           />
//         </TouchableOpacity>
//       )
//     }
//     return <View style={styles.ratingContainer}>{stars}</View>
//   }

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: COLORS.backgroundLight }}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//     >
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={styles.heading}>Add a Book Recommendation</Text>

//         <View style={styles.formGroup}>
//           <Text style={styles.label}>Book Title</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter book title"
//             placeholderTextColor={COLORS.placeholderText}
//             value={title}
//             onChangeText={setTitle}
//           />
//         </View>

//         <View style={styles.formGroup}>
//           <Text style={styles.label}>Your Rating</Text>
//           {renderRatingPicker()}
//         </View>

//         <View style={styles.formGroup}>
//           <Text style={styles.label}>Book Image</Text>
//           <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
//             {image ? (
//               <Image source={{ uri: image }} style={styles.imagePreview} />
//             ) : (
//               <View style={styles.placeholder}>
//                 <Ionicons name="image-outline" size={40} color={COLORS.textSecondary} />
//                 <Text style={styles.placeholderText}>Tap to select an image</Text>
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>

//         <View style={styles.formGroup}>
//           <Text style={styles.label}>Caption</Text>
//           <TextInput
//             style={[styles.input, styles.textArea]}
//             placeholder="Write your review or thoughts about this book..."
//             placeholderTextColor={COLORS.placeholderText}
//             value={caption}
//             onChangeText={setCaption}
//             multiline
//           />
//         </View>

//         <TouchableOpacity
//           style={[styles.submitButton, loading && styles.disabledButton]}
//           onPress={handleSubmit}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color={COLORS.white} />
//           ) : (
//             <Text style={styles.submitButtonText}>Share</Text>
//           )}
//         </TouchableOpacity>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     paddingBottom: 40,
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 25,
//     color: COLORS.primaryDark,
//   },
//   formGroup: {
//     marginBottom: 20,
//   },
//   label: {
//     fontWeight: '600',
//     fontSize: 16,
//     marginBottom: 8,
//     color: COLORS.primaryDark,
//   },
//   input: {
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     fontSize: 16,
//     color: COLORS.primaryDark,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },
//   textArea: {
//     height: 100,
//     textAlignVertical: 'top',
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//   },
//   starButton: {
//     marginRight: 8,
//   },
//   imagePicker: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     height: 180,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//   },
//   imagePreview: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 12,
//   },
//   placeholder: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   placeholderText: {
//     marginTop: 10,
//     color: COLORS.textSecondary,
//     fontSize: 14,
//   },
//   submitButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     borderRadius: 30,
//     alignItems: 'center',
//   },
//   disabledButton: {
//     backgroundColor: COLORS.primary + '80', // transparencë në butonin e paaftë
//   },
//   submitButtonText: {
//     color: COLORS.white,
//     fontWeight: '700',
//     fontSize: 18,
//   },
// })
 import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  Image, Alert, ActivityIndicator, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import COLORS from '../constants/colors';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useBookStore } from '../store/bookStore';

export default function Create() {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { token } = useAuthStore();

  const uploadToCloudinary = async (localUri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: localUri,
      type: "image/jpeg",
      name: "book.jpg",
    });
    formData.append("upload_preset", "mobile_upload"); // unsigned preset

    const response = await fetch("https://api.cloudinary.com/v1_1/dqs8z19dr/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error("Failed to upload image");
    return data.secure_url;
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not pick the image.');
    }
  };

  const handleSubmit = async () => {
    if (!title || !caption || !image) {
      Alert.alert('Error', 'Please fill in all fields and select an image.');
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadToCloudinary(image);

      const response = await fetch('http://10.0.2.2:5000/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          caption,
          rating: rating.toString(),
          image: imageUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create book.');
      }

      Alert.alert('Success', 'Your book has been shared.');
      setTitle('');
      setCaption('');
      setRating(3);
      setImage(null);
      useBookStore.getState().triggerRefresh();
      router.push('/');

    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderRatingPicker = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={32}
            color={i <= rating ? COLORS.starYellow : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.backgroundLight }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Add a Book Recommendation</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Book Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter book title"
            placeholderTextColor={COLORS.placeholderText}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Your Rating</Text>
          {renderRatingPicker()}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Book Image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="image-outline" size={40} color={COLORS.textSecondary} />
                <Text style={styles.placeholderText}>Tap to select an image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Caption</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write your review or thoughts about this book..."
            placeholderTextColor={COLORS.placeholderText}
            value={caption}
            onChangeText={setCaption}
            multiline
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Share</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 25,
    color: COLORS.primaryDark,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
    color: COLORS.primaryDark,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.primaryDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  starButton: {
    marginRight: 8,
  },
  imagePicker: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.primary + '80',
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 18,
  },
});
