import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import useAuth from "../../hooks/useAuth";

export default function Home({ navigation }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // If logout is successful, you can navigate the user to another screen or perform any other action
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("SignUpScreen")}
      >
        
        <Text style={styles.buttonText}> تسجيل موظف جديد </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleLogout()}>
        <Text style={styles.buttonText}>تسجيل خروج</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});
