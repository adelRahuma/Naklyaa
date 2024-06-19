import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { Picker } from "@react-native-picker/picker";
import { getUsersData, insertDuty } from "../../Services/auth";

export default function AdminScreen({ navigation }) {
  const [selectedDriver, setSelectedDriver] = useState("");
  const [driver, setDrivers] = useState([]);
  const [users, setUsers] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [passengersList, setPassengersList] = useState([]);
  const [trip, setTrip] = useState({});
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [isDriverMenuOpen, setIsDriverMenuOpen] = useState(false);

  const handleAddPassenger = () => {
    if (!selectedDriver || !selectedPassenger) {
      return;
    }
    if (
      Object.keys(trip).some((driver) =>
        trip[driver]?.includes(selectedPassenger)
      )
    ) {
      // Passenger already allocated to a driver
      return;
    }
    setTrip((prevTrip) => ({
      ...prevTrip,
      [selectedDriver]: [
        ...(prevTrip[selectedDriver] || []),
        selectedPassenger,
      ],
    }));
    setPassengersList((prevPassengersList) =>
      prevPassengersList.filter((passenger) => passenger !== selectedPassenger)
    );
    setSelectedPassenger(null);
  };

  const handleRemovePassenger = (driver, passenger) => {
    const updatedDriverTrip = trip[driver].filter((p) => p !== passenger);
    if (updatedDriverTrip.length === 0) {
      const updatedTrip = { ...trip };
      delete updatedTrip[driver];
      setTrip(updatedTrip);
    } else {
      setTrip((prevTrip) => ({
        ...prevTrip,
        [driver]: updatedDriverTrip,
      }));
    }
    setPassengersList((prevPassengersList) => [
      ...prevPassengersList,
      passenger,
    ]);
  };

  const sendRota = async () => {
    try {
      for (const driver in trip) {
        console.log(`Driver Name --> ${driver}:`);
        const passengersArray = [];
        trip[driver].forEach((passengerName) => {
          const passenger = passengers.find(
            (p) => p.fullName === passengerName
          );
          if (passenger) {
            passengersArray.push({
              name: passengerName,
              location: {
                latitude: passenger.latitude,
                longitude: passenger.longitude,
              },
            });
            console.log(
              `${passengerName}   Passenger Location: ${passenger.latitude}, ${passenger.longitude}`
            );
          }
        });

        // Update Firestore with the driver and their passengers
        // console.log(driver, "collectionArray", ...passengersArray);
        await insertDuty(driver, passengersArray);
      }
      console.log("Rota sent successfully!");
    } catch (error) {
      console.error("Error sending rota:", error);
    }
  };

  useEffect(() => {
    console.log(trip);
  }, [trip]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getUsersData();
        const driverUsers = userData.filter((user) => user.role === "Driver");
        const passengerUsers = userData.filter(
          (user) => user.role === "Passenger"
        );
        setDrivers(driverUsers);
        setPassengers(passengerUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#E5E7EB",
    },
    picker: {
      backgroundColor: "#FFD700",
      paddingVertical: 15,
      borderRadius: 20,
      marginTop: 10,
    },
    addButton: {
      backgroundColor: "#FFD700",
      paddingVertical: 15,
      borderRadius: 20,
      marginTop: 10,
    },
    loginButtonText: {
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      color: "#374151",
    },
    backButton: {
      backgroundColor: "#FFD700",
      padding: 10,
      borderRadius: 20,
      marginLeft: 20,
    },
    row: {
      flexDirection: "row",
      justifyContent: "start",
    },
    rotaButton: {
      backgroundColor: "blue",
      padding: 16,
      marginTop: 10,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
    },
    passengerItem: {
      fontSize: 16,
      color: "blue",
    },
    tripContainer: {
      margin: 10,
      backgroundColor: "#E5E7EB",
      padding: 10,
    },
    driverLabel: {
      color: "blue",
      textAlign: "center",
      padding: 6,
      marginTop: 5,
      backgroundColor: "lightgrey",
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.row}>
            {/* <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeftIcon size="20" color="black" />
            </TouchableOpacity> */}
          </View>

          <TouchableOpacity
            onPress={() => setIsDriverMenuOpen(!isDriverMenuOpen)}
            style={styles.picker}
          >
            <Text style={{ textAlign: "center", fontWeight: "bold" }}>
              {"عرض قائمة السائقين"}
            </Text>
            <Text
              style={{
                textAlign: "center",
                fontSize: 18,
                fontWeight: "bold",
                color: "blue",
              }}
            >
              {selectedDriver || "إسم السائق"}
            </Text>
          </TouchableOpacity>
          <Picker
            selectedValue={selectedDriver}
            onValueChange={(itemValue) => {
              setSelectedDriver(itemValue);
              setIsDriverMenuOpen(false);
            }}
            itemStyle={{
              color: "blue",
              fontSize: 18,
              marginBottom: 5,
            }}
            mode="dropdown"
            style={{
              display: isDriverMenuOpen ? "flex" : "none",
              backgroundColor: "#E5E7EB",
            }}
          >
            <Picker.Item label="اختر من هنا" value={""} enabled={false} />
            {driver?.map((driver, index) => (
              <Picker.Item
                key={index}
                label={driver.fullName}
                value={driver.fullName}
              />
            ))}
          </Picker>

          <Picker
            style={[
              styles.picker,
              { marginTop: 5, backgroundColor: "#E5E7EB" },
            ]}
            selectedValue={selectedPassenger}
            onValueChange={(itemValue) => setSelectedPassenger(itemValue)}
            itemStyle={{
              color: "blue",
              fontSize: 18,
              marginBottom: 5,
            }}
            mode="dropdown"
          >
            <Picker.Item label="اختر راكب" value={null} />
            {passengers.map((passenger, index) => (
              <Picker.Item
                key={index}
                label={passenger.fullName}
                value={passenger.fullName}
                onPress={() => {
                  setSelectedPassenger(passenger.name);
                  handleAddPassenger();
                }}
              />
            ))}
          </Picker>
          {selectedDriver && (
            <View style={styles.addButtonContainer}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddPassenger}
              >
                <Text style={styles.loginButtonText}>إضافة راكب</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.tripContainer}>
            {Object.keys(trip).map((driver) => (
              <View key={driver}>
                <Text style={[styles.label, styles.driverLabel]}>{driver}</Text>
                {trip[driver].map((passenger, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleRemovePassenger(driver, passenger)}
                  >
                    <Text style={styles.passengerItem}>{passenger}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
        {Object.keys(trip).length > 0 && (
          <TouchableOpacity style={styles.addButton} onPress={sendRota}>
            <Text style={styles.loginButtonText}>Send Rota</Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
