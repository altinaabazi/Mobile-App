// import { useRouter } from "expo-router";
// import { useEffect } from "react";
// import { View, Text } from "react-native";
// import { useAuthStore } from "../../store/authStore";

// export default function AdminDashboard() {
//   const { user } = useAuthStore();
//   const router = useRouter();

//   useEffect(() => {
//     if (user?.role !== "admin") {
//       router.replace("/(tabs)"); // ridrejto në home nëse nuk je admin
//     }
//   }, [user]);

//   if (user?.role !== "admin") {
//     return null; // ose loader
//   }

//   return (
//     <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
//       <Text style={{ fontSize: 24, fontWeight: "bold" }}>
//         Admin Dashboard
//       </Text>
//     </View>
//   );
// }
