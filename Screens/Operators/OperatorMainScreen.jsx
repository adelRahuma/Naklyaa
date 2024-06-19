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
} from "react-native";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getUsersData, insertDuty } from "../../Services/auth";
import useAuth from "../../hooks/useAuth";
import HomeHeadNav from "../../Components/HomeHeadNav";
import { sendNotification } from "../../Services/SendNotification";
const OperatorMainScreen = ({ navigation }) => {
  const [selectedDriver, setSelectedDriver] = useState(null); // Initialize as null
  const [drivers, setDrivers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [error, setError] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const userData = await getUsersData();
        const driverUsers = userData.filter((user) => user.Role === "Driver");
        setDrivers(driverUsers);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };

    fetchDrivers();
  }, []);
  //console.log("====> ", user);
  const handleNavigate = () => {
    if (!selectedDriver || !selectedDate || !selectedTime) {
      setError("Please set the required data before!");
      return;
    } else {
      setError("");

      navigation.navigate("TimeTabeScreen", {
        driver: selectedDriver, // Pass the entire driver object
        date: selectedDate.toISOString(), // Serialize the date as an ISO string
        time: selectedTime.toISOString(), // Serialize the time as an ISO string
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.scrollViewContent}>
          <HomeHeadNav navigation={navigation} />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeftIcon size={20} color="black" />
          </TouchableOpacity>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedDriver ? selectedDriver.Nick_Name : null}
              onValueChange={(itemValue, itemIndex) => {
                const selectedDriverDetails = drivers.find(
                  (driver) => driver.Nick_Name === itemValue
                );
                setSelectedDriver(selectedDriverDetails);
                //  console.log("Nick_Name --->", selectedDriverDetails);
              }}
              style={styles.picker}
            >
              <Picker.Item
                label="Select Driver"
                value={null}
                key="default"
                style={{ ...styles.picker, height: 200 }}
              />
              {drivers.map((driver, index) => (
                <Picker.Item
                  key={driver.Nick_Name || index} // Use driver.id if available, otherwise fallback to index
                  label={`${driver.Full_Name} (${driver.Nick_Name})`}
                  value={driver.Nick_Name}
                />
              ))}
            </Picker>
          </View>
          <View style={styles.DateTimeBox}>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text>{selectedDate.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setSelectedDate(selectedDate);
                  }
                }}
              />
            )}
          </View>
          <View style={styles.DateTimeBox}>
            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
              <Text>{selectedTime.toLocaleTimeString()}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    setSelectedTime(selectedTime);
                  }
                }}
              />
            )}
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleNavigate}>
            <Text style={styles.addButtonLabel}>Create a Trip</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OperatorMainScreen;

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
  pickerContainer: {
    marginBottom: 20,
    padding: 2,
  },
  pickerText: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#374151",
  },
  picker: {
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    borderRadius: 50,
  },
  addButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    borderRadius: 20,
    marginTop: 20,
    alignItems: "center",
  },
  addButtonLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
  },
  errorBox: {
    backgroundColor: "#CCCCCC",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
  },
  DateTimeBox: {
    backgroundColor: "#CCCCCC",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 0,
  },
});
