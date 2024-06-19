import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import OperatorMainScreen from "./OperatorMainScreen"; // Import your OperatorMainScreen component here

const OperatorHomeScreen = ({ navigation }) => {
  // Sample data for scheduled trips and details
  const scheduledTripsData = [
    {
      id: 1,
      driver: "Driver 1",
      date: "2024-04-30",
      time: "09:00 AM",
    },
    {
      id: 2,
      driver: "Driver 2",
      date: "2024-05-01",
      time: "10:00 AM",
    },
    // Add more data as needed
  ];

  // Render item for scheduled trips in horizontal FlatList
  const renderScheduledTripItem = ({ item }) => (
    <TouchableOpacity style={styles.scheduledTripItem}>
      <Text style={styles.scheduledTripText}>
        {item.driver} - {item.date} {item.time}
      </Text>
    </TouchableOpacity>
  );

  // Render item for trip details in vertical FlatList
  const renderTripDetailsItem = ({ item }) => (
    <View style={styles.tripDetailsItem}>
      <Text style={styles.tripDetailsText}>
        Driver: {item.driver}, Date: {item.date}, Time: {item.time}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scheduledTripsContainer}>
        <Text style={styles.sectionTitle}>Scheduled Trips</Text>
        <FlatList
          data={scheduledTripsData}
          renderItem={renderScheduledTripItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View style={styles.tripDetailsContainer}>
        <Text style={styles.sectionTitle}>Trip Details</Text>
        <FlatList
          data={scheduledTripsData}
          renderItem={renderTripDetailsItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("OperatorMainScreen")}
      >
        <Text style={styles.addButtonLabel}>Create a Trip</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default OperatorHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  scheduledTripsContainer: {
    marginBottom: 20,
  },
  scheduledTripItem: {
    backgroundColor: "#D1D5DB",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  scheduledTripText: {
    fontSize: 16,
  },
  tripDetailsContainer: {
    flex: 1,
  },
  tripDetailsItem: {
    backgroundColor: "#D1D5DB",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  tripDetailsText: {
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: "center",
  },
  addButtonLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
  },
});
