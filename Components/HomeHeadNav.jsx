import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import useAuth from "../hooks/useAuth";
import FontAwesome from "react-native-vector-icons/FontAwesome";

//import {colors, titles} from '../globals/style';
const colors = {
  GrisClaro: "#F7F7FF",
  GrisClaroPeroNoTanClaro: "#cccccc",
  Azul: "#028AFF",
  Celeste: "#0275d8",
  Naranja: "#f0ad4e",
  Verde: "#5cb85c",
  Rojo: "#d9534f",
  Gris: "#9d9d9d",
  Blanco: "#fff",
  Negro: "#000",
  Info: "#17a2b8",
};
const HomeHeadNav = ({ navigation }) => {
  const { logout } = useAuth();
  const handleLogout = () => {
    try {
      logout();

      // If logout is successful, you can navigate the user to another screen or perform any other action
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };
  return (
    <View style={styles.container}>
      {/* <FontAwesome name="navicon" size={24} color="red" style={styles.myicon} />
      <View style={styles.containerin}>
        <Text style={styles.mytext}>Profile</Text>
      </View> */}
      <TouchableOpacity onPress={() => navigation.navigate("PushNotification")}>
        <FontAwesome
          name="comments"
          size={26}
          color="black"
          style={styles.myicon}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Userprofile")}>
        <FontAwesome
          name="user-circle"
          size={26}
          color="black"
          style={styles.myicon}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout}>
        <FontAwesome
          name="sign-out" // Change the icon name to a logout icon
          size={26}
          color="black"
          style={styles.myicon}
        />
      </TouchableOpacity>
    </View>
  );
};

export default HomeHeadNav;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 15,
    alignItems: "center",
    backgroundColor: colors.col1,
    elevation: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  containerin: {
    flexDirection: "row",
    alignItems: "center",
  },
  mytext: {
    fontSize: 24,
    marginRight: 7,
  },
  myicon: {
    color: colors.text1,
    fontSize: 24,
  },
});
