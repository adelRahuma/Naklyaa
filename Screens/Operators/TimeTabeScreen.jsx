import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Image,
  FlatList,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { sendNotification } from "../../Services/SendNotification";
import { SearchByName, getUserPassengersData } from "../../Services/auth";
import { collection, addDoc, doc, getDoc } from "@firebase/firestore";
import { db } from "../../Services/config";
const TimeTabeScreen = ({ navigation, route }) => {
  const { driver, date, time } = route.params;
  const [passengers, setPassengers] = useState([]);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [isDriverMenuOpen, setIsDriverMenuOpen] = useState(false);
  const [isPassengerMenuOpen, setIsPassengerMenuOpen] = useState(false);
  const [passengerName, setPassengerName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const newDate = new Date(date);
  const formattedDate = `${newDate.getDate()}-${
    newDate.getMonth() + 1
  }-${newDate.getFullYear()}`;
  const timestamp = new Date(time);
  const shortTime = new Intl.DateTimeFormat("en-US", {
    timeStyle: "short",
  }).format(timestamp);

  const handleAddPassenger = async () => {
    if (selectedPassengers.length === 0) {
      setErrorMessage("No passengers were selected");
      return;
    }
    try {
      setErrorMessage("");
      const tripData = {
        driver: {
          Nick_Name: driver.Nick_Name,

          TripDate: formattedDate,
          TripTime: shortTime,
          States: false,
          DeriverCompleted: false,
        },
      };

      // Add the trip data to the "Trips" collection
      const tripsCollectionRef = collection(db, "Trips");
      const newTripDocRef = await addDoc(tripsCollectionRef, tripData);
      const tripRecordData = {
        TripId: newTripDocRef.id,
        driver: {
          Nick_Name: driver.Nick_Name,
          Driver_Email: driver.email,
          Full_Name: driver.Full_Name,
          Phone_Number: driver.Phone_Number,
          TripDate: formattedDate,
          TripTime: shortTime,
          Status: false,
          DeriverCompleted: false,
        },
        passengers: selectedPassengers.reduce((passengerMap, passenger) => {
          const { Nick_Name, Full_Name, Phone_Number, Location, ImgUrl } =
            passenger;
          const PassengerTime = "";
          passengerMap[Nick_Name] = {
            Nick_Name,
            Drarriavl: "",
            DriConfirm: "",
            PassengerTime: "",
          };

          return passengerMap;
        }, {}),
      };

      const tripRecordsCollectionRef = collection(db, "Trip_Records");
      const newTripRecord = await addDoc(
        tripRecordsCollectionRef,
        tripRecordData
      );
      console.log("Document written with ID: ", newTripRecord.id);

      for (const key in tripRecordData.passengers) {
        if (Object.hasOwnProperty.call(tripRecordData.passengers, key)) {
          const item = tripRecordData.passengers[key];
          try {
            console.log(item);
            const UsersTokensRef = collection(db, "tokens");
            const tokensDocRef = doc(UsersTokensRef, item.Nick_Name);

            const docSnapshot = await getDoc(tokensDocRef);
            if (docSnapshot.exists()) {
              const tokenData = docSnapshot.data();
              console.log("TokenData", tokenData);
              const token = tokenData.token;
              console.log("Token for user", item.Nick_Name + ":", token);
              sendNotification(
                token,
                "مرحبا",
                " تمت إضافتك إلى رحلة جديدة, الرجاء الدخول للتطبيق "
              );
              // Now you have the token for the user
            } else {
              console.log("No token found for user", item.Nick_Name);
            }
          } catch (error) {
            console.error("Error retrieving token from Firestore:", error);
          }
        }
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error inserting trip data:", error);
      setErrorMessage("Error inserting trip data. Please try again.");
    }
  };

  const togglePassengerSelection = (passenger) => {
    setErrorMessage("");
    setPassengerName(passenger.Full_Name);
    const { Nick_Name, Full_Name, Phone_Number, Location, ImgUrl } = passenger;
    const passengerInfo = {
      Nick_Name,
      Full_Name,
      Phone_Number,
      Location,
      ImgUrl,
    };

    if (selectedPassengers.some((p) => p.Nick_Name === Nick_Name)) {
      setSelectedPassengers((prevSelectedPassengers) =>
        prevSelectedPassengers.filter((p) => p.Nick_Name !== Nick_Name)
      );
    } else {
      setSelectedPassengers((prevSelectedPassengers) => [
        ...prevSelectedPassengers,
        passengerInfo,
      ]);
    }
  };
  const handleSearch = async (text) => {
    setSearchText(text);
    const filteredPassengers = await SearchByName(text);
    // setPassengersList(filteredPassengers);
    setPassengers(filteredPassengers);
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getUserPassengersData();
        setPassengers(userData);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);
  useEffect(() => {
    handleSearch(searchText);
  }, [searchText]);
  // console.log("Passenger Data -->", passengers);
  const handleEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>عفوا! لا يوجد موظفين بهذا الاسم</Text>
      </View>
    );
  };
  const filteredPassengers = passengers.filter(
    (passenger) => passenger.Role === "Passenger"
  );
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.scrollViewContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeftIcon size={20} color="black" />
          </TouchableOpacity>
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => setIsDriverMenuOpen(!isDriverMenuOpen)}
            style={styles.picker}
          >
            <Text
              style={styles.pickerText}
            >{`${formattedDate} تاريخ ووقت الرحلة ${shortTime}`}</Text>
            <Text style={styles.selectedDriverText}>{driver.Full_Name}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsPassengerMenuOpen(!isPassengerMenuOpen)}
            style={styles.picker}
          >
            <Text style={styles.pickerText}>{"اسم اخر راكب تم اختياره"}</Text>
            <Text style={styles.selectedDriverText}>
              {passengerName || "إسم الراكب"}
            </Text>
          </TouchableOpacity>
          <View style={styles.passengerSearchContainer}>
            <TextInput
              style={[styles.passengerSearchInput, { textAlign: "right" }]}
              placeholder="ابحث بالإسم"
              value={searchText}
              onChangeText={handleSearch}
              autoCapitalize="none"
              keyboardType="default"
            />
          </View>
          <View style={styles.passengerListContainer}>
            <FlatList
              ListEmptyComponent={handleEmpty}
              data={filteredPassengers}
              renderItem={({ item }) => (
                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedPassenger(item.Nick_Name);
                      setIsPassengerMenuOpen(false);
                      togglePassengerSelection(item);
                    }}
                    style={styles.passengerItemContainer}
                  >
                    {item.ImgUrl ? (
                      <Image
                        source={{ uri: item.ImgUrl }}
                        style={styles.passengerImage}
                      />
                    ) : (
                      <Image
                        source={require("../../assets/images/login.png")}
                        style={styles.passengerImage}
                      />
                    )}
                    <Text style={styles.passengerName}>{item.Nick_Name}</Text>
                    {selectedPassengers.some(
                      (p) => p.Nick_Name === item.Nick_Name
                    ) && (
                      <Image
                        source={require("../../assets/images/checkmark.png")}
                        style={styles.checkmarkIcon}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
              numColumns={5}
              contentContainerStyle={styles.passengerList}
            />
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPassenger}
          >
            <Text style={styles.addButtonLabel}>إضافة رحلة</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default TimeTabeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  scrollViewContent: {
    padding: 20,
  },
  backButton: {
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  picker: {
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    borderRadius: 20,
    marginTop: 10,
  },
  pickerText: {
    textAlign: "center",
    fontWeight: "bold",
  },
  selectedDriverText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "blue",
  },

  passengerItemContainer: {
    marginRight: 10,
    alignItems: "center",
  },
  passengerImage: {
    width: 40,
    height: 40,
    padding: 5,
    borderRadius: 25,
  },
  passengerName: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: "bold",
  },
  checkmarkIcon: {
    width: 20,
    height: 20,
    position: "absolute",
    top: 5,
    right: 5,
  },
  addButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    borderRadius: 20,
    marginTop: 10,
    alignItems: "center",
  },
  addButtonLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
  },
  tripContainer: {
    marginVertical: 10,
    backgroundColor: "#E5E7EB",
    padding: 10,
  },
  passengerSearchContainer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  passengerSearchInput: {
    fontSize: 16,
    padding: 6,
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
  passengerListContainer: {
    backgroundColor: "lightgrey",
    borderRadius: 19,
    marginTop: 10,
    height: 3.5 * 100,
  },
  passengerList: {
    paddingTop: 9,
    paddingBottom: 9,
  },
  errorContainer: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  errorMessage: {
    color: "white",
    fontWeight: "bold",
  },
});
