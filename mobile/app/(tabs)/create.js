import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native'
import React from 'react'
import { useState } from 'react'
import {useRouter} from "expo-router"
import styles from "../../assets/styles/create.styles"
import COLORS from '../../constants/colors'
import {Ionicons} from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"

export default function Create() { 
  
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null); // to display image selected
  const [imageBase64, setImageBase64] = useState(null); // translating  apicture into word that computers can send ijn messages
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const pickImage = async () => {

    try{
      if(Platform.OS !== "web"){
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if( status !== "granted") {
          Alert.alert("Permission Denied", "We need camera roll permission to upload an image");
          return
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4,3],
        quality: 0.5,
        base64: true
      })

      if(!result.canceled){
        // console.log("result is here ",result)
        setImage(result.assets[0].uri);

        if(result.assets[0].base64) {
          setImageBase64(result.assets[0].base64)
        } else{
          //convert to base64
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: FileSystem.EncodingType.Base64,
          })
        }
      }

    }catch (error){
      console.log("Error picking image:",error);
      Alert.alert("Error","There was a problem selecting your image")
    }
  }

  const handleSubmit = async () => {}

  const renderRatingPicker = () => {
    const stars = [];
    for (let i=1; i<=5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={()=> setRating(i)} style={styles.starButton}>
          <Ionicons
           name={i<= rating? "star" : "star-outline"}
           size={32}
           color={i<=rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      )
    }
    return <View style={styles.ratingContainer}>{stars}</View>
  }

  return (
    <KeyboardAvoidingView
      style={{flex:1}}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >

      <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Book Recommendation</Text>
            <Text style={styles.subtitle}>Share your favorite reads with others</Text>

          </View>
          <View style={styles.form}>
            {/**Book title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Title</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                 name="book-outline"
                 size={20}
                 color={COLORS.textSecondary}
                 style={styles.inputIcon}
                />
                <TextInput
                 style={styles.input}
                 placeholder='Enter book title'
                 placeholderTextColor={COLORS.placeholderText}
                 value={title}
                 onChangeText={setTitle}
                 />
              </View>
            </View>
            {/**Rating */}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Rating</Text>
               {renderRatingPicker()}
            </View>

            {/**Image */}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Image</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                  <Image source={{uri: image}} style={styles.previewImage}/>
                ) : (
                  <View style={styles.placeholderContainer}>
                  <Ionicons name="image-outline" size={40} color={COLORS.textSecondary}/>
                  <Text style={styles.placeholderText}>Tap to select image</Text>
                  </View>
                )}
              </TouchableOpacity>

            </View>

            {/**Caption */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Cation</Text>
              <TextInput
                style={styles.textArea}
                placeholder='Write your review or thoughts aabout this book...'
                placeholderTextColor={COLORS.placeholderText}
                value={caption}
                onChangeText={setCaption}
                multiline
              />

            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={COLORS.white}/>
                ) : (
                  <>
                    <Ionicons
                      name='cloud-upload-outline'
                      size={20}
                      color={COLORS.white}
                      style={styles.buttonIcon}
                    />
                  <Text style={styles.buttonText}>Share</Text>
                  </>
                )}
            </TouchableOpacity>
            


          </View>

        </View>


      </ScrollView>
      <Text>Create tab</Text>
    </KeyboardAvoidingView>
  )
}