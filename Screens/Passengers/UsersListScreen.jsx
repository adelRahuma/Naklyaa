import React, { useState, useRef, useEffect } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  TextInput,
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from "react-native";
//import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DriverTripListScreen from "../Drivers/DriverTripListScreen";
import PassengerScreen from "./PassengerScreen";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import useAuth from "../../hooks/useAuth";
import HomeHeadNav from "../../Components/HomeHeadNav";
import { db } from "../../Services/config";
import {
  getDocs,
  query,
  where,
  collection,
  doc,
  arrayContains,
  updateDoc,
} from "@firebase/firestore";
const Stack = createNativeStackNavigator();

const UsersListScreen = ({ navigation, route }) => {
  const [show, setShow] = useState(false);
  const [destination, setDestination] = useState([]);
  const [grigin, setOrigin] = useState([]);
  const [message, setMessage] = useState("");
  const mapRef = useRef();
  const { user } = useAuth();
  const { item } = route.params;

  const rideConforim = async () => {
    // console.log(item);
    const now = new Date();
    const shortTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const tripQuery = query(
      collection(db, "Trip_Records"),
      where("TripId", "==", item.TripId),
      where(`passengers.${item.passengers.Nick_Name}.PassengerTime`, "==", "")
      // where(
      //   `passengers.${item.passengers.Nick_Name}.Full_Name`,
      //   "==",
      //   item.passengers.Full_Name
      // )
    );
    const tripSnapshot = await getDocs(tripQuery);
    tripSnapshot.forEach(async (doc) => {
      if (doc.exists()) {
        const tripRef = doc.ref; // Reference to the specific trip document
        await updateDoc(tripRef, {
          [`passengers.${item.passengers.Nick_Name}.PassengerTime`]: shortTime,
        });
        navigation.navigate("PassengerTripList");
      } else {
        console.log("Document does not exist.");
      }
    });
    //
  };
  const sendMessage = () => {
    //console.log(item.driver);
    Alert.alert(item.driver.Driver_Email);
  };
  return (
    <>
      <SafeAreaView style={{ flex: 0.75 }}>
        <HomeHeadNav navigation={navigation} />
        <PassengerScreen driverEmail={item.driver.Driver_Email} />
      </SafeAreaView>
      <View
        style={{ flex: 0.25, justifyContent: "center", alignItems: "center" }}
      >
        <View style={styles.messagingContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            onChangeText={(text) => setMessage(text)}
            value={message}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={rideConforim}>
          <Text style={styles.confirmButtonText}>تأكيد الصعود</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    padding: 8,
  },
  infoText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  messagingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 120, // Adjust as needed
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    padding: 8,
  },
  input: {
    flex: 1,
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  sendButton: {
    backgroundColor: "blue",
    padding: 8,
    borderRadius: 8,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  confirmButton: {
    position: "absolute",
    bottom: 16,
    //right: 16,
    backgroundColor: "green",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  button: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    backgroundColor: "blue",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  confirmButtonText: {
    color: "white",
    alignContent: "center",
    fontWeight: "bold",
  },
});

export default UsersListScreen;
