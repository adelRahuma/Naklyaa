// import React, { useState, useEffect } from "react";
// import MapView, { Marker, Callout } from "react-native-maps";
// import useAuth from "../../../hooks/useAuth";
// import {
//   StyleSheet,
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   FlatList,
//   TextInput,
//   Alert,
//   Image,
// } from "react-native";
// import {
//   collection,
//   doc,
//   updateDoc,
//   getDocs,
//   query,
//   setDoc,
//   where,
//   getDoc,
// } from "firebase/firestore";
// import * as Location from "expo-location";
// import { SafeAreaView } from "react-native-safe-area-context";
// import HomeHeadNav from "../../../Components/HomeHeadNav";
// import { db, auth } from "../../../Services/config";
// import { Card } from "react-native-paper";

// function DriverCard({ item, onConfirmPickup, trip_uid }) {
//   const [isButtonEnabled, setIsButtonEnabled] = useState(false);
//   const [isUpdateSuccessful, setIsUpdateSuccessful] = useState(true);
//   const [message, setMessage] = useState("");

//   const handleSetArrivalTime = async () => {
//     console.log(`Setting arrival time for ${item.Nick_Name}`);
//     const tripQuery = query(
//       collection(db, "Trip_Records"),
//       where("TripId", "==", trip_uid)
//     );

//     const tripSnapshot = await getDocs(tripQuery);
//     // Assuming there's only one document returned
//     const tripDoc = tripSnapshot.docs[0];

//     // Retrieve the passengers array from the document
//     const passengers = tripDoc.data().passengers;
//     const filteredPassenger = passengers[item.Nick_Name];
//     // console.log(filteredPassenger);

//     if (filteredPassenger) {
//       const newDate = new Date();
//       const formattedDate = `${newDate.getDate()}-${
//         newDate.getMonth() + 1
//       }-${newDate.getFullYear()}`;

//       const timestamp = new Date();
//       const shortTime = new Intl.DateTimeFormat("en-US", {
//         timeStyle: "short",
//       }).format(timestamp);
//       passengers[item.Nick_Name].Drarriavl =
//         formattedDate + " --> " + shortTime;
//       await updateDoc(tripDoc.ref, { passengers: passengers })
//         .then(() => {
//           console.log("Passenger updated successfully!");
//           setIsButtonEnabled(true);
//           setIsUpdateSuccessful(false);
//         })
//         .catch((error) => {
//           console.error("Error updating passenger:", error);
//         });
//     } else {
//       console.log("Passenger not found!");
//     }
//   };

//   const handleConfirmPickup = async () => {
//     console.log(item);
//     console.log("Confirm pickup button pressed for item", item.Nick_Name);
//     const tripQuery = query(
//       collection(db, "Trip_Records"),
//       //  where("","",""),
//       where("TripId", "==", trip_uid)
//     );

//     const tripSnapshot = await getDocs(tripQuery);
//     // Assuming there's only one document returned
//     const tripDoc = tripSnapshot.docs[0];
//     // Retrieve the passengers array from the document
//     const passengers = tripDoc.data().passengers;
//     // Find the passenger you want to update
//     const filteredPassenger = passengers[item.Nick_Name];

//     if (filteredPassenger) {
//       const newDate = new Date();
//       const formattedDate = `${newDate.getDate()}-${
//         newDate.getMonth() + 1
//       }-${newDate.getFullYear()}`;

//       const timestamp = new Date();
//       const shortTime = new Intl.DateTimeFormat("en-US", {
//         timeStyle: "short",
//       }).format(timestamp);
//       passengers[item.Nick_Name].DriConfirm =
//         formattedDate + " --> " + shortTime;
//       await updateDoc(tripDoc.ref, { passengers: passengers })
//         .then(async () => {
//           console.log(trip_uid, "Passenger updated successfully!");
//           setIsButtonEnabled(true);
//           setIsUpdateSuccessful(false);

//           onConfirmPickup(item);
//         })
//         .catch((error) => {
//           console.error("Error updating passenger:", error);
//         });
//     } else {
//       console.log("Passenger not found!");
//     }
//     // Call the parent component's function to remove the passenger item
//   };

//   const sendMessage = () => {
//     Alert.alert(item.Nick_Name);
//   };

//   return (
//     <Card style={styles.cardContainer}>
//       <Card.Content style={styles.cardContent}>
//         <View style={styles.row}>
//           <Text style={styles.phoneNumber}>{item.Full_Name}</Text>
//           {/* <Text style={styles.phoneNumber}>{item.Nick_Name}</Text> */}
//           <Image
//             source={
//               item.ImgUrl
//                 ? { uri: item.ImgUrl }
//                 : require("../../../assets/images/login.png")
//             }
//             style={{ width: 50, height: 50, borderRadius: 25 }}
//           />
//           <Text style={styles.phoneNumber}>{item.Phone_Number}</Text>
//         </View>
//         <View style={styles.buttonContainer}>
//           {isUpdateSuccessful && (
//             <TouchableOpacity
//               style={styles.button}
//               onPress={handleSetArrivalTime}
//             >
//               <Text style={styles.buttonText}>وقت الوصول</Text>
//             </TouchableOpacity>
//           )}
//           <TouchableOpacity
//             style={[styles.button, !isButtonEnabled && styles.disabledButton]}
//             disabled={!isButtonEnabled}
//             onPress={handleConfirmPickup}
//           >
//             <Text style={styles.buttonText}>تأكيد الصعود</Text>
//           </TouchableOpacity>
//         </View>
//       </Card.Content>
//       <Card.Actions>
//         <View style={styles.messagingContainer}>
//           <TextInput
//             style={styles.input}
//             // placeholder="Type your message..."
//             // onChangeText={(text) => setMessage(text)}
//             value={item.Location}
//           />
//           <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
//             <Text style={styles.sendButtonText}>الذهاب إلى</Text>
//           </TouchableOpacity>
//         </View>
//       </Card.Actions>
//     </Card>
//   );
// }

// export default function DriversScreen({ navigation, route }) {
//   const [location, setLocation] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [passengersList, setPassengersList] = useState([]);
//   const [refreshFlatList, setRefreshFlatList] = useState(false);
//   const { user, logout } = useAuth();
//   const { trip_uid } = route.params;

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== "granted") {
//           throw new Error("Permission to access location was denied");
//         }

//         const locationData = await Location.getCurrentPositionAsync({});
//         setLocation(locationData);

//         const currentUser = auth.currentUser;
//         const data = {
//           latitude: locationData.coords.latitude,
//           longitude: locationData.coords.longitude,
//         };

//         if (currentUser) {
//           // here to update the driver location
//           const driversCollectionRef = collection(db, "Driver_Locations");
//           const driverDocRef = doc(driversCollectionRef, currentUser?.email);
//           await setDoc(driverDocRef, data, { merge: true });
//           // fetching passengers from a particular tripId
//           const q = query(
//             collection(db, "Trip_Records"),
//             where("TripId", "==", trip_uid)
//           );
//           const querySnapshot = await getDocs(q);
//           const passengersData = querySnapshot.docs.map(
//             (doc) => doc.data().passengers
//           );
//           // Flatten the array of passenger objects into a single array
//           const passengersList = passengersData.flatMap(Object.values);
//           const filteredPassengers = passengersList.filter(
//             (passenger) => passenger.DriConfirm === ""
//           );

//           setPassengersList(filteredPassengers);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);
//   const handleConfirmPickup = (itemToRemove) => {
//     // Remove the passenger item from passengersList
//     setPassengersList((prevPassengers) =>
//       prevPassengers.filter((passenger) => passenger !== itemToRemove)
//     );
//     setRefreshFlatList((prevValue) => !prevValue);
//   };
//   const handleCompletedTrip = async () => {
//     // navigation.goBack();
//     //console.log("item", trip_uid);
//     try {
//       // Query for the document
//       const driverDocRef = doc(collection(db, "Trips"), trip_uid);
//       const driverDocSnapshot = await getDoc(driverDocRef);
//       if (driverDocSnapshot.exists()) {
//         await updateDoc(driverDocRef, {
//           "driver.DeriverCompleted": true,
//         });
//         navigation.navigate("DriverTripListScreen");
//       } else {
//         console.log("Driver's location not found.");
//       }
//     } catch (error) {
//       console.error("Error updating driver's completion status:", error);
//     }
//   };

//   //empty flat list
//   const handleEmpty = () => {
//     return (
//       <View style={styles.listViewContainer}>
//         <Text style={styles.emptyText}>
//           تم بحمد الله إيصال الركاب, الرجاء النقر على زر أكتملت الرحلة
//         </Text>
//         <TouchableOpacity
//           style={styles.completedButton}
//           onPress={handleCompletedTrip}
//         >
//           <Text style={styles.buttonText}>أكتملت الرحلة</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };
//   if (isLoading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <ActivityIndicator size="large" color="#0000ff" />
//         <Text style={styles.loadingText}>Loading...</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <HomeHeadNav navigation={navigation} />
//       {location && (
//         <MapView
//           style={styles.map}
//           initialRegion={{
//             latitude: location.coords.latitude,
//             longitude: location.coords.longitude,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01 * (9 / 16),
//           }}
//         >
//           <Marker
//             coordinate={{
//               latitude: location.coords.latitude,
//               longitude: location.coords.longitude,
//             }}
//           >
//             <Callout style={styles.calloutContainer}>
//               <View>
//                 <Text style={styles.calloutTitle}>Your Location</Text>
//                 <TouchableOpacity>
//                   <Text style={styles.calloutButton}>Go to</Text>
//                 </TouchableOpacity>
//               </View>
//             </Callout>
//           </Marker>
//         </MapView>
//       )}
//       <FlatList
//         ListEmptyComponent={handleEmpty}
//         data={passengersList}
//         renderItem={({ item }) => (
//           <DriverCard
//             item={item}
//             trip_uid={trip_uid}
//             onConfirmPickup={handleConfirmPickup}
//           />
//         )}
//         keyExtractor={(item, index) => `${item.Nick_Name}-${index}`}
//         style={styles.listView}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   listViewContainer: {
//     flex: 1,
//   },
//   map: {
//     flex: 0.5,
//     width: "100%",
//   },
//   listView: {
//     flex: 0.5,
//     backgroundColor: "#f0f0f0",
//     padding: 10,
//   },
//   cardContainer: {
//     backgroundColor: "#ffffff",
//     borderRadius: 8,
//     padding: 4,
//     marginBottom: 10,
//   },
//   disabledButton: {
//     opacity: 0.5,
//   },
//   cardContent: {
//     marginBottom: 10, // Adjust as needed
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     width: "100%",
//   },
//   phoneNumber: {
//     flex: 1,
//     textAlign: "center", // Center the text within each Text component
//     fontSize: 13,
//     fontWeight: "bold",
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },
//   button: {
//     backgroundColor: "#007bff",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: "#ffffff",
//     fontWeight: "bold",
//   },
//   messagingContainer: {
//     backgroundColor: "#fff",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     // paddingHorizontal: 10, // Adjust as needed space-between
//   },
//   input: {
//     flex: 1,
//     height: 40,
//     borderWidth: 1,
//     borderColor: "green",
//     borderRadius: 5,
//     paddingHorizontal: 10,
//   },
//   sendButton: {
//     backgroundColor: "#28a745",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   sendButtonText: {
//     color: "#ffffff",
//     fontWeight: "bold",
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     textAlign: "center",
//     color: "#555",
//   },
//   completedButton: {
//     backgroundColor: "#007bff",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: "#ffffff",
//     fontWeight: "bold",
//   },
//   listView: {
//     flex: 1,
//     backgroundColor: "#f0f0f0",
//     padding: 10,
//   },
// });

import React, { useState, useEffect } from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import useAuth from "../../hooks/useAuth";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  Alert,
  Image,
} from "react-native";
import {
  collection,
  doc,
  updateDoc,
  getDocs,
  query,
  setDoc,
  where,
  getDoc,
} from "@firebase/firestore";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeHeadNav from "../../Components/HomeHeadNav";
import { db, auth } from "../../Services/config";
import { Card } from "react-native-paper";
import { sendNotification } from "../../Services/SendNotification";

function DriverCard({ item, onConfirmPickup, trip_uid }) {
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [isUpdateSuccessful, setIsUpdateSuccessful] = useState(true);
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState([]);
  useEffect(() => {
    // Define a function to fetch user data
    const getUserData = async () => {
      try {
        const q = query(
          collection(db, "Users"),
          where("Nick_Name", "==", item.Nick_Name)
        );
        const querySnapshot = await getDocs(q);
        const User = [];
        querySnapshot.forEach((doc) => {
          const Data = doc.data();
          // console.log(Data);
          User.push(Data);
        });
        setUserData(User);
      } catch (error) {
        console.error("Error getting user data: ", error);
        // Handle error here
      }
    };

    // Call the function to fetch user data when the item prop changes
    getUserData();
  }, [item]);
  const handleSetArrivalTime = async () => {
    console.log(`Setting arrival time for ${item.Nick_Name}`);
    const tripQuery = query(
      collection(db, "Trip_Records"),
      where("TripId", "==", trip_uid)
    );

    const tripSnapshot = await getDocs(tripQuery);
    // Assuming there's only one document returned
    const tripDoc = tripSnapshot.docs[0];

    // Retrieve the passengers array from the document
    const passengers = tripDoc.data().passengers;
    const filteredPassenger = passengers[item.Nick_Name];
    // console.log(filteredPassenger);

    if (filteredPassenger) {
      const newDate = new Date();
      const formattedDate = `${newDate.getDate()}-${
        newDate.getMonth() + 1
      }-${newDate.getFullYear()}`;

      const timestamp = new Date();
      const shortTime = new Intl.DateTimeFormat("en-US", {
        timeStyle: "short",
      }).format(timestamp);
      passengers[item.Nick_Name].Drarriavl =
        formattedDate + " --> " + shortTime;
      await updateDoc(tripDoc.ref, { passengers: passengers })
        .then(() => {
          console.log("Passenger updated successfully!");
          setIsButtonEnabled(true);
          setIsUpdateSuccessful(false);
        })
        .catch((error) => {
          console.error("Error updating passenger:", error);
        });
    } else {
      console.log("Passenger not found!");
    }
  };

  const handleConfirmPickup = async () => {
    console.log(item);
    console.log("Confirm pickup button pressed for item", item.Nick_Name);
    const tripQuery = query(
      collection(db, "Trip_Records"),
      //  where("","",""),
      where("TripId", "==", trip_uid)
    );

    const tripSnapshot = await getDocs(tripQuery);
    // Assuming there's only one document returned
    const tripDoc = tripSnapshot.docs[0];
    // Retrieve the passengers array from the document
    const passengers = tripDoc.data().passengers;
    // Find the passenger you want to update
    const filteredPassenger = passengers[item.Nick_Name];

    if (filteredPassenger) {
      const newDate = new Date();
      const formattedDate = `${newDate.getDate()}-${
        newDate.getMonth() + 1
      }-${newDate.getFullYear()}`;

      const timestamp = new Date();
      const shortTime = new Intl.DateTimeFormat("en-US", {
        timeStyle: "short",
      }).format(timestamp);
      passengers[item.Nick_Name].DriConfirm =
        formattedDate + " --> " + shortTime;
      await updateDoc(tripDoc.ref, { passengers: passengers })
        .then(async () => {
          console.log(trip_uid, "Passenger updated successfully!");
          setIsButtonEnabled(true);
          setIsUpdateSuccessful(false);

          onConfirmPickup(item);
        })
        .catch((error) => {
          console.error("Error updating passenger:", error);
        });
    } else {
      console.log("Passenger not found!");
    }
    // Call the parent component's function to remove the passenger item
  };

  const sendMessage = async () => {
    try {
      const UsersTokensRef = collection(db, "tokens");
      const tokensDocRef = doc(UsersTokensRef, userData[0]?.Nick_Name);

      const docSnapshot = await getDoc(tokensDocRef);
      if (docSnapshot.exists()) {
        const tokenData = docSnapshot.data();
        const token = tokenData.token;
        console.log("Token for user", userData[0]?.Nick_Name + ":", token);
        sendNotification(
          token,
          "مرحبا",
          userData[0]?.Full_Name + " انا في الطريق إليك "
        );
        // Now you have the token for the user
      } else {
        console.log("No token found for user", userData[0]?.Nick_Name);
      }
    } catch (error) {
      console.error("Error retrieving token from Firestore:", error);
    }

    // Alert.alert(item.Nick_Name);
  };

  return (
    <Card style={styles.cardContainer}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.row}>
          <Text style={styles.phoneNumber}>{userData[0]?.Full_Name}</Text>
          {/* <Text style={styles.phoneNumber}>{item.Nick_Name}</Text> */}
          <Image
            source={
              userData[0]?.ImgUrl
                ? { uri: userData[0]?.ImgUrl }
                : require("../../assets/images/login.png")
            }
            style={{ width: 50, height: 50, borderRadius: 25 }}
          />
          <Text style={styles.phoneNumber}>{userData[0]?.Phone_Number}</Text>
        </View>
        <View style={styles.buttonContainer}>
          {isUpdateSuccessful && (
            <TouchableOpacity
              style={styles.button}
              onPress={handleSetArrivalTime}
            >
              <Text style={styles.buttonText}>وقت الوصول</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, !isButtonEnabled && styles.disabledButton]}
            disabled={!isButtonEnabled}
            onPress={handleConfirmPickup}
          >
            <Text style={styles.buttonText}>تأكيد الصعود</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
      <Card.Actions>
        <View style={styles.messagingContainer}>
          <TextInput
            style={styles.input}
            // placeholder="Type your message..."
            // onChangeText={(text) => setMessage(text)}
            value={userData[0]?.Location}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>الذهاب إلى</Text>
          </TouchableOpacity>
        </View>
      </Card.Actions>
    </Card>
  );
}

export default function DriversScreen({ navigation, route }) {
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [passengersList, setPassengersList] = useState([]);
  const [refreshFlatList, setRefreshFlatList] = useState(false);
  const { user, logout } = useAuth();
  const { trip_uid } = route.params;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Permission to access location was denied");
        }

        const locationData = await Location.getCurrentPositionAsync({});
        setLocation(locationData);

        const currentUser = auth.currentUser;
        const data = {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
        };

        if (currentUser) {
          // here to update the driver location
          const driversCollectionRef = collection(db, "Driver_Locations");
          const driverDocRef = doc(driversCollectionRef, currentUser?.email);
          await setDoc(driverDocRef, data, { merge: true });
          // fetching passengers from a particular tripId
          const q = query(
            collection(db, "Trip_Records"),
            where("TripId", "==", trip_uid)
          );
          const querySnapshot = await getDocs(q);
          const passengersData = querySnapshot.docs.map(
            (doc) => doc.data().passengers
          );
          // Flatten the array of passenger objects into a single array
          const passengersList = passengersData.flatMap(Object.values);
          const filteredPassengers = passengersList.filter(
            (passenger) => passenger.DriConfirm === ""
          );

          setPassengersList(filteredPassengers);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  const handleConfirmPickup = (itemToRemove) => {
    // Remove the passenger item from passengersList
    setPassengersList((prevPassengers) =>
      prevPassengers.filter((passenger) => passenger !== itemToRemove)
    );
    setRefreshFlatList((prevValue) => !prevValue);
  };
  const updateDriverCompletionStatus = async (TripId) => {
    try {
      const q = query(
        collection(db, "Trip_Records"),
        where("TripId", "==", TripId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Since TripId is not a UID, it may match multiple documents, so we handle each one
        querySnapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, {
            "driver.DeriverCompleted": true,
          });
          //console.log("Driver completion status updated for TripId:", TripId);
        });
      } else {
        console.log("Trip record with ID", TripId, "does not exist.");
      }
    } catch (error) {
      console.error("Error updating driver completion status:", error);
    }
  };
  const handleCompletedTrip = async () => {
    updateDriverCompletionStatus(trip_uid);
    try {
      // Query for the document
      const driverDocRef = doc(collection(db, "Trips"), trip_uid);
      const driverDocSnapshot = await getDoc(driverDocRef);
      if (driverDocSnapshot.exists()) {
        await updateDoc(driverDocRef, {
          "driver.DeriverCompleted": true,
        });
        navigation.navigate("DriverTripListScreen");
      } else {
        console.log("Driver's location not found.");
      }
    } catch (error) {
      console.error("Error updating driver's completion status:", error);
    }
  };

  //empty flat list
  const handleEmpty = () => {
    return (
      <View style={styles.listViewContainer}>
        <Text style={styles.emptyText}>
          تم بحمد الله إيصال الركاب, الرجاء النقر على زر أكتملت الرحلة
        </Text>
        <TouchableOpacity
          style={styles.completedButton}
          onPress={handleCompletedTrip}
        >
          <Text style={styles.buttonText}>أكتملت الرحلة</Text>
        </TouchableOpacity>
      </View>
    );
  };
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HomeHeadNav navigation={navigation} />
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01 * (9 / 16),
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          >
            <Callout style={styles.calloutContainer}>
              <View>
                <Text style={styles.calloutTitle}>Your Location</Text>
                <TouchableOpacity>
                  <Text style={styles.calloutButton}>Go to</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        </MapView>
      )}
      <FlatList
        ListEmptyComponent={handleEmpty}
        data={passengersList}
        renderItem={({ item }) => (
          <DriverCard
            item={item}
            trip_uid={trip_uid}
            onConfirmPickup={handleConfirmPickup}
          />
        )}
        keyExtractor={(item, index) => `${item.Nick_Name}-${index}`}
        style={styles.listView}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listViewContainer: {
    flex: 1,
  },
  map: {
    flex: 0.5,
    width: "100%",
  },
  listView: {
    flex: 0.5,
    backgroundColor: "#f0f0f0",
    padding: 10,
  },
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 4,
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cardContent: {
    marginBottom: 10, // Adjust as needed
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  phoneNumber: {
    flex: 1,
    textAlign: "center", // Center the text within each Text component
    fontSize: 13,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  messagingContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // paddingHorizontal: 10, // Adjust as needed space-between
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  sendButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  sendButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#555",
  },
  completedButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  listView: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 10,
  },
});
