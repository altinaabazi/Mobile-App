// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, Image, ActivityIndicator, Platform, StyleSheet } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// type Book = {
//   _id: string;
//   title: string;
//   caption: string;
//   image: string;
//   rating: number;
//   createdAt: string;
//   user?: {
//     username: string;
//   };
// };

// export default function NotificationsScreen() {
//   const [books, setBooks] = useState<Book[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchNotifications() {
//       try {
//         const token = await AsyncStorage.getItem('token');
//         if (!token) {
//           console.warn('No token found');
//           return;
//         }

//         const lastChecked = (await AsyncStorage.getItem('lastCheckedBooks')) || new Date(0).toISOString();
//         const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

//         const response = await fetch(`${BASE_URL}/api/books?since=${lastChecked}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const data = await response.json();
//         setBooks(data.books || []);

//         // Përditëso kohën e fundit të kontrolluar
//         await AsyncStorage.setItem('lastCheckedBooks', new Date().toISOString());
//       } catch (error) {
//         console.error('Error fetching notifications:', error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchNotifications();
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#555" />
//       </View>
//     );
//   }

//   if (books.length === 0) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.emptyText}>Nuk ka libra të rinj.</Text>
//       </View>
//     );
//   }

//   return (
//     <FlatList
//       data={books}
//       keyExtractor={(item) => item._id}
//       renderItem={({ item }) => (
//         <View style={styles.card}>
//           <Image source={{ uri: item.image }} style={styles.image} />
//           <View style={styles.info}>
//             <Text style={styles.title}>{item.title}</Text>
//             <Text style={styles.caption}>{item.caption}</Text>
//             <Text style={styles.rating}>⭐ {item.rating}/5</Text>
//             {item.user && <Text style={styles.user}>Nga: {item.user.username}</Text>}
//           </View>
//         </View>
//       )}
//     />
//   );
// }

// const styles = StyleSheet.create({
//   center: {
//     flex: 1, justifyContent: 'center', alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 16, color: '#555',
//   },
//   card: {
//     flexDirection: 'row',
//     padding: 10,
//     borderBottomColor: '#ddd',
//     borderBottomWidth: 1,
//   },
//   image: {
//     width: 60, height: 90, borderRadius: 8,
//   },
//   info: {
//     marginLeft: 10, justifyContent: 'center', flex: 1,
//   },
//   title: {
//     fontSize: 16, fontWeight: 'bold',
//   },
//   caption: {
//     fontSize: 14, color: '#666',
//   },
//   rating: {
//     fontSize: 12, color: '#888',
//   },
//   user: {
//     fontSize: 12, color: '#aaa', marginTop: 4,
//   },
// });
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationsScreen() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.warn('No token found');
          return;
        }

        const lastChecked =
          (await AsyncStorage.getItem('lastCheckedBooks')) ||
          new Date(0).toISOString();

        const BASE_URL =
          Platform.OS === 'android'
            ? 'http://10.0.2.2:5000'
            : 'http://localhost:5000';

        const response = await fetch(
          `${BASE_URL}/api/books?since=${lastChecked}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        setBooks(data.books || []);
        await AsyncStorage.setItem('lastCheckedBooks', new Date().toISOString());
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  if (books.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Nuk ka libra të rinj.</Text>
      </View>
    );
  }

  return (
  <View style={{ flex: 1 }}>
    <Text style={styles.header}>📚 Njoftimet e Librave të Rinj</Text>
    <FlatList
      data={books}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.caption}>{item.caption}</Text>
            <Text style={styles.rating}>⭐ {item.rating}/5</Text>
            {item.user && (
              <Text style={styles.user}>Nga: {item.user.username}</Text>
            )}
          </View>
        </View>
      )}
    />
  </View>
);
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
  },
  listContainer: {
    padding: 12,
  },
  header: {
  fontSize: 22,
  fontWeight: 'bold',
  textAlign: 'center',
  marginTop: 20,
  marginBottom: 10,
  color: '#222',
},

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: 70,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  info: {
    marginLeft: 12,
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  caption: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  rating: {
    fontSize: 13,
    color: '#444',
  },
  user: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
});
