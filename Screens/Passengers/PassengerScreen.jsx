// import React, { useState, useEffect, useRef } from "react";
// import {
//   StyleSheet,
//   View,
//   ActivityIndicator,
//   Text,
//   TouchableOpacity,
// } from "react-native";
// import MapView, { Marker } from "react-native-maps";
// import MapViewDirections from "react-native-maps-directions";
// import { GOOGLE_MAPS_API_KEY } from "@env";
// import * as Location from "expo-location";
// import { collection, doc, getDoc } from "@firebase/firestore";
// import { db } from "../../Services/config";
// import useAuth from "../../hooks/useAuth";

// export default function PassengerScreen({ navigation, driverEmail }) {
//   const [passengerLocation, setPassengerLocation] = useState(null);
//   const [driverLocation, setDriverLocation] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [distance, setDistance] = useState(null);
//   const [duration, setDuration] = useState(null);
//   const [showInfo, setShowInfo] = useState(true);
//   const mapRef = useRef();
//   const { user, logout } = useAuth();

//   useEffect(() => {
//     const fetchPassengerLocation = async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         console.log("Permission to access location was denied");
//         return;
//       }

//       let location = await Location.getCurrentPositionAsync({});
//       setPassengerLocation(location);
//       // console.log("Passenger Location: ", location);
//     };

//     const fetchDriverLocation = async () => {
//       const driverDocRef = doc(collection(db, "Driver_Locations"), driverEmail);
//       const driverDocSnapshot = await getDoc(driverDocRef);
//       if (driverDocSnapshot.exists()) {
//         setDriverLocation(driverDocSnapshot.data());
//         //  console.log("driverDocSnapshot Location: ", driverLocation);
//       } else {
//         console.log("Driver's location not found.");
//       }
//     };

//     // Initial fetch
//     fetchPassengerLocation();
//     fetchDriverLocation();

//     // Fetch driver's location every 5 minutes
//     const interval = setInterval(() => {
//       fetchDriverLocation();
//     }, 2 * 60 * 1000); // 5 minutes in milliseconds

//     // Clean up the interval on unmount
//     return () => clearInterval(interval);
//   }, []);

//   if (!passengerLocation || !driverLocation) {
//     return (
//       <View style={styles.container}>
//         <ActivityIndicator size="large" color="#ff00ff" />
//       </View>
//     );
//   }
//   const animateToRegion = () => {
//     let region = {
//       latitude: driverLocation.latitude, //destination.coords.latitude,
//       longitude: driverLocation.longitude, //destination.coords.longitude,
//       latitudeDelta: 1,
//       longitudeDelta: 1,
//     };

//     mapRef.current.animateToRegion(region, 2000);
//   };
//   return (
//     <View style={styles.container}>
//       <MapView style={styles.map} ref={mapRef}>
//         <Marker
//           coordinate={{
//             latitude: passengerLocation.coords.latitude,
//             longitude: passengerLocation.coords.longitude,
//           }}
//           title="Passenger"
//         />
//         {driverLocation && (
//           <Marker
//             coordinate={{
//               latitude: driverLocation.latitude,
//               longitude: driverLocation.longitude,
//             }}
//             title="Driver"
//           />
//         )}
//         <MapViewDirections
//           origin={{
//             latitude: passengerLocation.coords.latitude,
//             longitude: passengerLocation.coords.longitude,
//           }}
//           destination={{
//             latitude: driverLocation ? driverLocation.latitude : 0,
//             longitude: driverLocation ? driverLocation.longitude : 0,
//           }}
//           apikey={GOOGLE_MAPS_API_KEY}
//           // strokeColor="black"
//           strokeColor="rgba(12, 248, 138, 0.9)"
//           strokeWidth={4}
//           mode={"TRANSIT"}
//           onError={(errorMessage) => {
//             console.log("Error on route request:", errorMessage);
//             if (errorMessage === "ZERO_RESULTS") {
//               setDistance(null);
//               setDuration(null);
//               alert(
//                 "No route found. Please try again with different locations."
//               );
//             } else {
//               // Handle other types of errors
//               alert("Error fetching directions. Please try again later.");
//             }
//           }}
//           onReady={(result) => {
//             setDistance(result.distance);
//             setDuration(result.duration);
//             animateToRegion();
//           }}
//         />
//       </MapView>
//       {showInfo && distance !== null && duration !== null && (
//         <View style={styles.infoContainer}>
//           <Text style={styles.infoText}>
//             المسافة: {Math.round(distance * 100) / 100} كم
//           </Text>
//           <Text style={styles.infoText}>
//             الزمن: {Math.round(duration)} دقيقة
//           </Text>
//         </View>
//       )}
//       <TouchableOpacity
//         style={styles.button}
//         onPress={() => setShowInfo(!showInfo)}
//       >
//         <Text style={styles.buttonText}>
//           {showInfo ? "إخفاء المعلومات" : "إظهار المعلومات"}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   infoContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     position: "absolute",
//     bottom: 16,
//     left: 16,
//     right: 16,
//     backgroundColor: "rgba(255, 255, 255, 0.8)",
//     borderRadius: 8,
//     padding: 8,
//   },
//   infoText: {
//     fontSize: 11,
//     fontWeight: "bold",
//   },
//   button: {
//     position: "absolute",
//     bottom: 16,
//     alignSelf: "center",
//     backgroundColor: "blue",
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   buttonText: {
//     color: "white",
//     fontWeight: "bold",
//   },

//   sendButtonText: {
//     color: "white",
//     fontWeight: "bold",
//   },
//   sendButton: {
//     backgroundColor: "blue",
//     padding: 8,
//     borderRadius: 8,
//   },
// });

import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_API_KEY } from "@env";
import * as Location from "expo-location";
import { collection, doc, getDoc } from "@firebase/firestore";
import { db } from "../../Services/config";
import useAuth from "../../hooks/useAuth";

export default function PassengerScreen({ navigation, driverEmail }) {
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  const mapRef = useRef();
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchPassengerLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setPassengerLocation(location);
    };

    const fetchDriverLocation = async () => {
      const driverDocRef = doc(collection(db, "Driver_Locations"), driverEmail);
      const driverDocSnapshot = await getDoc(driverDocRef);
      if (driverDocSnapshot.exists()) {
        setDriverLocation(driverDocSnapshot.data());
      } else {
        console.log("Driver's location not found.");
      }
    };

    // Initial fetch
    fetchPassengerLocation();
    fetchDriverLocation();

    // Fetch driver's location every 5 minutes
    const interval = setInterval(() => {
      fetchDriverLocation();
    }, 2 * 60 * 1000); // 5 minutes in milliseconds

    // Clean up the interval on unmount
    return () => clearInterval(interval);
  }, []);

  const animateToRegion = () => {
    let region = {
      latitude: driverLocation.latitude,
      longitude: driverLocation.longitude,
      latitudeDelta: 1,
      longitudeDelta: 1,
    };

    mapRef.current.animateToRegion(region, 2000);
  };

  if (!passengerLocation || !driverLocation) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff00ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} ref={mapRef}>
        <Marker
          coordinate={{
            latitude: passengerLocation.coords.latitude,
            longitude: passengerLocation.coords.longitude,
          }}
          title="Passenger"
        />
        {driverLocation && (
          <Marker
            coordinate={{
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
            }}
            title="Driver"
          />
        )}
        <MapViewDirections
          origin={{
            latitude: passengerLocation.coords.latitude,
            longitude: passengerLocation.coords.longitude,
          }}
          destination={{
            latitude: driverLocation ? driverLocation.latitude : 0,
            longitude: driverLocation ? driverLocation.longitude : 0,
          }}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeColor="rgba(12, 248, 138, 0.9)"
          strokeWidth={4}
          mode={"TRANSIT"}
          onError={(errorMessage) => {
            console.log("Error on route request:", errorMessage);
            if (errorMessage === "ZERO_RESULTS") {
              setDistance(null);
              setDuration(null);
              alert(
                "No route found. Please try again with different locations."
              );
            } else {
              // Handle other types of errors
              alert("Error fetching directions. Please try again later.");
            }
          }}
          onReady={(result) => {
            setDistance(result.distance);
            setDuration(result.duration);
            animateToRegion();
          }}
        />
      </MapView>
      {showInfo && distance !== null && duration !== null && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            المسافة: {Math.round(distance * 100) / 100} كم
          </Text>
          <Text style={styles.infoText}>
            الزمن: {Math.round(duration)} دقيقة
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowInfo(!showInfo)}
      >
        <Text style={styles.buttonText}>
          {showInfo ? "إخفاء المعلومات" : "إظهار المعلومات"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

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
});
