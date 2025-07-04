import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform, // Import për kontroll platforme
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import * as ExpoCalendar from 'expo-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from '../constants/colors';
export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [books, setBooks] = useState([]);
  const [selectedBookTitle, setSelectedBookTitle] = useState('');
  const [userEvents, setUserEvents] = useState([]);

  // Merr librat nga backend me token në header
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.log("Nuk ka token të ruajtur");
          return;
        }
        const response = await fetch('http://10.0.2.2:5000/api/books', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log('📚 Librat e marrë nga API:', data);
        setBooks(data.books || []);
      } catch (error) {
        console.log('Gabim gjatë marrjes së librave:', error);
      }
    };
    fetchBooks();
  }, []);

  // Merr eventet e përdoruesit nga backend për t'i shfaqur në kalendar
  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://10.0.2.2:5000/api/events', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Gabim në marrjen e eventeve');

        const data = await response.json();
        setUserEvents(data.events || []);
      } catch (error) {
        console.error('Gabim në marrjen e eventeve:', error);
      }
    };

    fetchUserEvents();
  }, []);

  // Funksioni për të krijuar ose marrë kalendarin default
  const getDefaultCalendarSource = async () => {
    const calendars = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);
    // Gjej kalendar me leje modifikimi
    let defaultCalendar = calendars.find(cal => cal.allowsModifications);
    if (defaultCalendar) {
      return defaultCalendar;
    }

    // Nëse nuk gjendet, krijo kalendar të ri
    let defaultSource;
    if (Platform.OS === 'ios') {
      const sources = await ExpoCalendar.getSourcesAsync();
      defaultSource = sources.find(source => source.name === 'Default') || sources[0];
    } else {
      // Për Android krijo një burim lokal
      defaultSource = {
        isLocalAccount: true,
        name: 'Expo Calendar',
      };
    }

    const newCalendarId = await ExpoCalendar.createCalendarAsync({
      title: 'Reading Calendar',
      color: '#00adf5',
      entityType: ExpoCalendar.EntityTypes.EVENT,
      sourceId: defaultSource.id,
      source: defaultSource,
      name: 'Reading Calendar',
      ownerAccount: 'personal',
      accessLevel: ExpoCalendar.CalendarAccessLevel.OWNER,
    });

    const newCalendars = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);
    defaultCalendar = newCalendars.find(cal => cal.id === newCalendarId);
    return defaultCalendar;
  };

  // Shto event në kalendar lokal dhe ruaj në backend
  const addReadingEvent = async () => {
    if (!selectedDate || !selectedBookTitle) {
      Alert.alert('Gabim', 'Zgjidh një datë dhe një libër.');
      return;
    }

    try {
      const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Leje e refuzuar', 'Nuk ka leje për kalendar.');
        return;
      }

      const defaultCalendar = await getDefaultCalendarSource();

      if (!defaultCalendar) {
        Alert.alert('Gabim', 'Nuk u gjet kalendari për të shtuar eventin.');
        return;
      }

      const startDate = new Date(selectedDate);
      startDate.setHours(18, 0);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);

      await ExpoCalendar.createEventAsync(defaultCalendar.id, {
        title: `Lexo: ${selectedBookTitle}`,
        startDate,
        endDate,
        timeZone: 'Europe/Tirane',
        notes: 'Lexim i planifikuar nga aplikacioni.',
      });

      // Ruaj eventin në backend
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://10.0.2.2:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Lexo: ${selectedBookTitle}`,
          date: selectedDate,
          note: 'Lexim i planifikuar nga aplikacioni.',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Gabim gjatë ruajtjes së eventit');
      }

      Alert.alert('Sukses', 'Eventi u shtua në kalendar dhe u ruajt!');

      setSelectedDate('');
      setSelectedBookTitle('');

      // Merr përsëri eventet nga backend për t'i shfaqur menjëherë
      const updatedEventsResponse = await fetch('http://10.0.2.2:5000/api/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = await updatedEventsResponse.json();
      setUserEvents(updatedData.events || []);
    } catch (error) {
      console.log('Gabim:', error);
      Alert.alert('Gabim', 'Nuk u shtua dot eventi.');
    }
  };

  // Përgatit markedDates për kalendar me eventet e përdoruesit + zgjedhjen e ditës
  const markedDates = {};

  if (selectedDate) {
    markedDates[selectedDate] = {
      selected: true,
      marked: true,
      selectedColor: 'blue',
    };
    
  }

  userEvents.forEach(event => {
    if (event.date) {
      markedDates[event.date] = {
        ...(markedDates[event.date] || {}),
        marked: true,
        dotColor: 'red',
      };
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zgjidh një libër:</Text>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedBookTitle}
          onValueChange={(value) => setSelectedBookTitle(value)}
        >
          <Picker.Item label="Zgjidh një libër..." value="" />
          {books.map(book => (
            <Picker.Item key={book._id} label={book.title} value={book.title} />
          ))}
        </Picker>
      </View>

      <Text style={styles.title}>Zgjidh një datë për të lexuar:</Text>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: '#00adf5',
          todayTextColor: '#00adf5',
        }}
      />

      {selectedDate !== '' && (
        <Text style={styles.selectedDate}>Ke zgjedhur datën: {selectedDate}</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={addReadingEvent}>
        <Text style={styles.buttonText}>Shto në Kalendar</Text>
      </TouchableOpacity>

      {/* Lista e eventeve */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Eventet e tua:</Text>
        {userEvents.length === 0 && <Text>Nuk ka evente.</Text>}
        {userEvents.map((event) => (
          <View key={event._id} style={{ paddingVertical: 8 }}>
            <Text>{event.date}: {event.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  selectedDate: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
