import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getDocs, query, where, collection } from "@firebase/firestore";
import useAuth from "../../hooks/useAuth";
import { db } from "../../Services/config";
import { Card } from "react-native-paper";
import HomeHeadNav from "../../Components/HomeHeadNav";
import { getUserRole } from "../../Services/auth";
export default function PassengerTripList({ navigation, route }) {
  const [isLoading, setIsLoading] = useState(true);
  const [tripList, setTripList] = useState([]);
  const [message, setMessage] = useState("");
  const { user, logout } = useAuth();
  const [rerenderTrigger, setRerenderTrigger] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setRerenderTrigger((prevState) => !prevState);
    });

    return unsubscribe;
  }, [navigation]);
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const userData = await getUserRole(user.email);
        //  console.log(userData[0].Nick_Name);

        const q = query(
          collection(db, "Trip_Records"),
          where("driver.DeriverCompleted", "==", false),
          where(`passengers.${userData[0].Nick_Name}.PassengerTime`, "==", "")
          // where(
          //   `passengers.${userData[0].Nick_Name}.Full_Name`,
          //   "==",
          //   userData[0].Full_Name
          // )
        );
        const querySnapshot = await getDocs(q);

        const filteredTripRecords = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          //console.log("sssssssssss",data);
          if (data.passengers && data.passengers[userData[0].Nick_Name]) {
            const newData = {
              TripId: data.TripId,
              driver: data.driver,
              passengers: data.passengers[userData[0].Nick_Name],
            };
            filteredTripRecords.push(newData);
          }
        });

        setTripList(filteredTripRecords);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, rerenderTrigger]);

  const fetchNewData = async () => {
    try {
      const userData = await getUserRole(user.email);
      const q = query(
        collection(db, "Trip_Records"),
        where("driver.DeriverCompleted", "==", false),
        where(`passengers.${userData[0].Nick_Name}.PassengerTime`, "==", "")
        // where(
        //   `passengers.${userData[0].Nick_Name}.Full_Name`,
        //   "==",
        //   userData[0].Full_Name
        // )
      );
      const querySnapshot = await getDocs(q);

      const filteredTripRecords = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.passengers &&
          data.passengers[userData[0].Nick_Name]
          //  &&
          // data.passengers[userData[0].Nick_Name].Full_Name ===
          //   userData[0].Full_Name
        ) {
          const newData = {
            TripId: data.TripId,
            driver: data.driver,
            passengers: data.passengers[userData[0].Nick_Name],
          };
          filteredTripRecords.push(newData);
        }
      });

      setTripList(filteredTripRecords);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setIsLoading(false);
    }
  };
  const renderPassengerCard = ({ item }) => {
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

    const chkTime = () => {
      const minutesDifference = calculateTimeDifference(
        item.driver.TripDate,
        item.driver.TripTime
      );
      // if (minutesDifference <= 0) {
      //   console.log(`The trip is happening now.`);
      // } else
      if (minutesDifference <= 120) {
        //console.log(`The trip is starting in ${minutesDifference} minutes.`);
        navigation.navigate("UsersListScreen", { item: item });
      } else {
        Alert.alert(`The trip will start in more than 2 hours.`);
      }
    };

    return (
      <Card style={styles.cardContainer}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.row}>
            <Text
              style={styles.phoneNumber}
            >{`السائق: ${item.driver.Full_Name}`}</Text>
            <Text
              style={styles.phoneNumber}
            >{`تاريخ الرحلة: ${item.driver.TripDate}`}</Text>
          </View>
          <View style={styles.row}>
            <Text
              style={styles.phoneNumber}
            >{`الهاتف: ${item.driver.Phone_Number}`}</Text>
            <Text
              style={styles.phoneNumber}
            >{`الوقت : ${item.driver.TripTime}`}</Text>
          </View>
        </Card.Content>
        <Card.Actions>
          <View style={styles.messagingContainer}>
            <TextInput
              style={styles.input}
              placeholder="أكتب رسالتك..."
              onChangeText={(text) => setMessage(text)}
              value={message}
            />
            <TouchableOpacity style={styles.sendButton} onPress={chkTime}>
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
  const handleEmpty = () => {
    return (
      <View style={styles.container}>
        <View style={styles.listViewContainer}>
          <Text style={styles.emptyText}>لا توجد رحلة مسجلة الآن</Text>
        </View>
        {/* <TouchableOpacity style={styles.refreshButton} onPress={fetchNewData}>
          <Text style={styles.refreshButtonText}>تحديث</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => logout()}>
          <Text style={styles.logoutButtonText}>تسجيل الخروج</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate("Userprofile")}
        >
          <Text style={styles.logoutButtonText}>تسجيل </Text>
        </TouchableOpacity> */}
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <HomeHeadNav navigation={navigation} />

      <FlatList
        ListEmptyComponent={handleEmpty}
        data={tripList}
        renderItem={renderPassengerCard}
        keyExtractor={(item, index) => index.toString()}
        style={styles.listView}
      />
      <View
        style={{
          padding: 4,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "blue",
        }}
      >
        <TouchableOpacity style={styles.sendButton} onPress={fetchNewData}>
          <Text style={styles.sendButtonText}>تحديث الجدول</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  //////

  backButton: {
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 20,
    marginLeft: 20,
  },

  /////
  listView: {
    flex: 0.5,
    backgroundColor: "#f0f0f0",
    padding: 11,
  },
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 5,
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
    marginTop: 5,
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
