import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import useAuth from "../../hooks/useAuth";
import { db, auth } from "../../Services/config";
import { Card } from "react-native-paper";
import HomeHeadNav from "../../Components/HomeHeadNav";
import { useFocusEffect } from "@react-navigation/native";
import { sendNotification } from "../../Services/SendNotification";
export default function DriverTripListScreen({ navigation, route }) {
  const [isLoading, setIsLoading] = useState(true);
  const [forceRender, setForceRender] = useState(false);
  const [tripList, setTripList] = useState([]);
  const [message, setMessage] = useState("");
  const { user, logout } = useAuth();
  const { CurrentUserData } = route.params; // Accessing props from route
  //console.log("it is me", CurrentUserData[0].Nick_Name);
  useFocusEffect(
    React.useCallback(() => {
      const fetchDriversData = async () => {
        try {
          const q = query(
            collection(db, "Trips"),
            where("driver.Nick_Name", "==", CurrentUserData[0].Nick_Name),
            where("driver.DeriverCompleted", "==", false)
          );
          const querySnapshot = await getDocs(q);
          const trips = [];

          for (const doc of querySnapshot.docs) {
            try {
              const tripId = doc.id;
              const tripData = doc.data();

              const q1 = query(
                collection(db, "Trip_Records"),
                where("TripId", "==", tripId)
              );
              const querySnapshot1 = await getDocs(q1);
              const passengersData = querySnapshot1.docs.map(
                (doc2) => doc2.data().passengers
              );
              let totalPassengers = 0;
              passengersData.forEach((passengerMap) => {
                totalPassengers += Object.keys(passengerMap).length;
              });

              trips.push({
                id: tripId,
                data: tripData,
                passNo: totalPassengers,
              });
            } catch (error) {
              console.error("Error fetching passengers data:", error);
              // Handle the error here, maybe skip this trip or log the error
            }
          }

          setTripList(trips);
        } catch (error) {
          console.error("Error fetching trips data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDriversData();

      // Return a cleanup function
      return () => {
        // Perform any cleanup here if needed
      };
    }, [CurrentUserData]) // Dependency array
  ); //CurrentUserData, forceRender Dependency on CurrentUserData prop

  const renderDriverCard = ({ item }) => {
    const calculateTimeDifference = (tripDate, tripTime) => {
      const currentDateTime = new Date();
      const [day, month, year] = tripDate.split("-");
      const [hours, minutes, period] = tripTime.split(/:| /);

      const tripDateTime = new Date(
        year,
        month - 1,
        day,
        period === "PM" ? parseInt(hours) + 12 : parseInt(hours),
        parseInt(minutes)
      );

      const timeDifference = tripDateTime.getTime() - currentDateTime.getTime();
      const minutesDifference = Math.floor(timeDifference / (1000 * 60));

      return minutesDifference;
    };
    // const sendMessage = async () => {
    //   const minutesDifference = calculateTimeDifference(
    //     item.data.driver.TripDate,
    //     item.data.driver.TripTime
    //   );
    //   if (minutesDifference <= 120) {
    //     console.log(
    //       item.id,
    //       `The trip is starting in ${minutesDifference} minutes.`
    //     );
    //     //

    //     const q = query(
    //       collection(db, "Trip_Records"),
    //       where("TripId", "==", item.id)
    //     );
    //     const querySnapshot = await getDocs(q);
    //     const passengersData = querySnapshot.docs.map(
    //       (doc) => doc.data().passengers
    //     );
    //     // Flatten the array of passenger objects into a single array
    //     const passengersList = passengersData.flatMap(Object.values);
    //     const nickNames = passengersList.map((item) => item.Nick_Name);

    //     console.log(nickNames);

    //     navigation.navigate("DriversScreen", { trip_uid: item.id });
    //     //  navigation.navigate("UsersListScreen", { item: item });
    //   } else {
    //     Alert.alert(`The trip will start in more than 2 hours.`);
    //   }

    //   //
    // };

    const sendMessage = async () => {
      try {
        const minutesDifference = calculateTimeDifference(
          item.data.driver.TripDate,
          item.data.driver.TripTime
        );

        if (minutesDifference <= 120) {
          console.log(
            item.id,
            `The trip is starting in ${minutesDifference} minutes.`
          );

          const q = query(
            collection(db, "Trip_Records"),
            where("TripId", "==", item.id)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const passengersData = querySnapshot.docs.map(
              (doc) => doc.data().passengers
            );
            // Flatten the array of passenger objects into a single array
            const passengersList = passengersData.flatMap(Object.values);
            const nickNames = passengersList.map((item) => item.Nick_Name);

            console.log(nickNames);
            /////////////////
            nickNames.map(async (itm) => {
              try {
                const UsersTokensRef = collection(db, "tokens");
                const tokensDocRef = doc(UsersTokensRef, itm);

                const docSnapshot = await getDoc(tokensDocRef);
                if (docSnapshot.exists()) {
                  const tokenData = docSnapshot.data();
                  const token = tokenData.token;
                  console.log("Token for user", itm + ":", token);
                  sendNotification(token, "مرحبا", " بدءت الرحلة  بعون الله");
                  // Now you have the token for the user
                } else {
                  console.log("No token found for user", itm);
                }
              } catch (error) {
                console.error("Error retrieving token from Firestore:", error);
              }
            });
            ///////////////////
            navigation.navigate("DriversScreen", { trip_uid: item.id });
          } else {
            console.log("No trip record found for TripId:", item.id);
            // Handle the case where no trip record is found
          }
        } else {
          Alert.alert(`The trip will start in more than 2 hours.`);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        // Handle other potential errors
        Alert.alert("Error", "Failed to send message. Please try again later.");
      }
    };

    if (isLoading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading...</Text>
        </View>
      );
    }
    //    States <Text style={styles.phoneNumber}>{item.data.driver.TripTime }</Text>
    return (
      <Card style={styles.cardContainer}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.row}>
            <Text
              style={styles.phoneNumber}
            >{` التاريخ ${item.data.driver.TripDate} `}</Text>
            <Text style={styles.nickName}>{item.data.driver.Nick_Name}</Text>
            <Text
              style={styles.phoneNumber}
            >{` الوقت  ${item.data.driver.TripTime}`}</Text>
          </View>
          <Text
            style={styles.phoneNumber}
          >{` عدد الركاب  ${item.passNo}`}</Text>
        </Card.Content>
        <Card.Actions>
          <View style={styles.messagingContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              onChangeText={(text) => setMessage(text)}
              value={message}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>بدء الرحلة</Text>
            </TouchableOpacity>
          </View>
        </Card.Actions>
      </Card>
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
  const fetchNewData = async () => {
    try {
      const q = query(
        collection(db, "Trips"),
        where("driver.Nick_Name", "==", CurrentUserData[0].Nick_Name),
        where("driver.DeriverCompleted", "==", false)
      );
      const querySnapshot = await getDocs(q);
      const trips = [];
      querySnapshot.forEach((doc) => {
        const tripData = doc.data(); // Get the data of the current trip document
        const tripId = doc.id; // Get the document UID
        trips.push({ id: tripId, data: tripData });
      });
      setTripList(trips);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleEmpty = () => {
    return (
      <View style={styles.container}>
        <View style={styles.listViewContainer}>
          <Text style={styles.emptyText}>لا توجد رحلة مسجلة الآن</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchNewData}>
          <Text style={styles.refreshButtonText}>تحديث</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={() => logout()}>
          <Text style={styles.logoutButtonText}>تسجيل الخروج</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate("Userprofile")}
        >
          <Text style={styles.logoutButtonText}>تسجيل </Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <HomeHeadNav navigation={navigation} />
      <FlatList
        ListEmptyComponent={handleEmpty}
        data={tripList}
        renderItem={renderDriverCard}
        keyExtractor={(item) => item.id}
        style={styles.listView}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  listView: {
    flex: 0.5,
    backgroundColor: "#f0f0f0",
    padding: 10,
  },
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4B5563",
  },
  cardContent: {
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  messagingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "blue",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  nickName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "blue",
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
  logoutButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "red",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoutButtonText: {
    fontSize: 18,
    color: "white",
  },
});
