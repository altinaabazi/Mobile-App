// import React, { useEffect, useState } from 'react';
// import { Ionicons } from '@expo/vector-icons';
// import { Tabs } from 'expo-router';
// import COLORS from '../../constants/colors';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function TabLayout() {
//   const insets = useSafeAreaInsets();
//   const [newBooksCount, setNewBooksCount] = useState(0);

//   useEffect(() => {
//     async function fetchNewBooksCount() {
//       try {
//         const lastChecked = (await AsyncStorage.getItem('lastCheckedBooks')) || new Date(0).toISOString();
//         const response = await fetch(`http://10.0.2.2:5000/api/books/notifications?lastChecked=${lastChecked}`);
//         const data = await response.json();

//         if (data.newBooksCount) setNewBooksCount(data.newBooksCount);
//       } catch (error) {
//         console.error('Error fetching notifications:', error);
//       }
//     }

//     fetchNewBooksCount();
//   }, []);

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarActiveTintColor: COLORS.primary,
//         headerTitleStyle: {
//           color: COLORS.textPrimary,
//           fontWeight: '600',
//         },
//         headerShadowVisible: false,
//         tabBarStyle: {
//           backgroundColor: COLORS.cardBackground,
//           borderTopWidth: 1,
//           borderTopColor: COLORS.border,
//           paddingTop: 5,
//           paddingBottom: insets.bottom,
//           height: 60 + insets.bottom,
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
//           tabBarBadge: newBooksCount > 0 ? newBooksCount : undefined,
//         }}
//       />
//       <Tabs.Screen
//         name="create"
//         options={{
//           title: 'Create',
//           tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: 'Profile',
//           tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
//         }}
//       />
//     </Tabs>
//   );
// }
import React, { useEffect, useState } from 'react';
import { Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import COLORS from '../../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [newBooksCount, setNewBooksCount] = useState(0);

  useEffect(() => {
    async function fetchNewBooksCount() {
      try {
        const lastChecked = (await AsyncStorage.getItem("lastCheckedBooks")) || new Date(0).toISOString();
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

        const response = await fetch(`${BASE_URL}/api/books/notifications?lastChecked=${lastChecked}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.newBooksCount) setNewBooksCount(data.newBooksCount);
        else setNewBooksCount(0);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }

    fetchNewBooksCount();

    const interval = setInterval(fetchNewBooksCount, 60000); // rifresko çdo 1 minutë

    return () => clearInterval(interval);
  }, []);



  return (
    <>
      {/* Debugging output */}
      {/* <Text style={{ position: 'absolute', top: 50, left: 20, zIndex: 999 }}>
        New Books: {newBooksCount}
      </Text> */}

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          headerTitleStyle: {
            color: COLORS.textPrimary,
            fontWeight: '600',
          },
          headerShadowVisible: false,
          tabBarStyle: {
            backgroundColor: COLORS.cardBackground,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            paddingTop: 5,
            paddingBottom: insets.bottom,
            height: 60 + insets.bottom,
          },
        }}
      >
        <Tabs.Screen
          name="index" // kontrollo që kjo skedë ekziston në `app/(tabs)/index.tsx`
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
          }}
        />
         <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} />,
          tabBarBadge: newBooksCount > 0 ? newBooksCount : undefined,
        }}
      />

        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
