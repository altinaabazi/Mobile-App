// import { Stack, useRouter, useSegments } from "expo-router";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import SafeScreen from "../components/SafeScreen";
// import { StatusBar } from "expo-status-bar";
// import { useAuthStore } from "../store/authStore";
// import { useEffect } from "react";
// export default function RootLayout() {
//   const router = useRouter()
//   const segments = useSegments()

//   //console.log("segments:", segments)

//   const {checkAuth, user, token} = useAuthStore()

//   useEffect(() => {
//     checkAuth();
//   },[])

//   useEffect(() => {
//     const inAuthScreen = segments[0] ==="(auth)"
//     const isSignedIn = user && token
    
//     if(!isSignedIn && !inAuthScreen) router.replace("/(auth)")
//     else if(isSignedIn && inAuthScreen) router.replace("/(tabs)")


//   },[user, token, segments])
  
//   return (
//     <SafeAreaProvider>
//       <SafeScreen>
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="(tabs)" />;
//         <Stack.Screen name="(auth)" />;
//       </Stack>
//       </SafeScreen>
//       <StatusBar style="dark"/>
//     </SafeAreaProvider>
//   );
// }
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const { checkAuth, user, token } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Mos navigo derisa të jenë gati segmentet
    if (segments.length === 0) return;

    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;

    if (!isSignedIn && !inAuthScreen) {
      router.replace("/(auth)");
    } else if (isSignedIn && inAuthScreen) {
      router.replace("/(tabs)");
    }
  }, [user, token, segments]);

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
