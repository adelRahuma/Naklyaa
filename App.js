import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import AppNavigation from "./Navigation/appNavigation";
//import FontAwesome from "@expo/vector-icons/FontAwesome";

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your app!</Text>
//       <StatusBar style="auto" />
//       <FontAwesome
//             name="picture-o"
//             size={18}
//             color="#25292e"
//             style={styles.buttonIcon}
//           />
//     </View>
//   );
// }
export default function App() {
  return <AppNavigation />;
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
