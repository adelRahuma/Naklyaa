import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../Screens/Admin/HomeScreen";
import LoginScreen from "../Screens/LoginScreen";
import SignUpScreen from "../Screens/Admin/SignUpScreen";
import AdminScreen from "../Screens/Admin/AdminSceen";
import TimeTabeScreen from "../Screens/Operators/TimeTabeScreen";
import DriverTripListScreen from "../Screens/Drivers/DriverTripListScreen";
import DriversScreen from "../Screens/Drivers/DriversScreen";
import PassengerTripList from "../Screens/Passengers/PassengerTripList";
import PassengerScreen from "../Screens/Passengers/PassengerScreen";
import PushNotification from "../Screens/PushNotification";
import UsersListScreen from "../Screens/Passengers/UsersListScreen";
import Userprofile from "../Screens/Userprofile";
import OperatorMainScreen from "../Screens/Operators/OperatorMainScreen";
import "react-native-reanimated";
import OperatorHomeScreen from "../Screens/Operators/OperatorHomeScreen";
import { ADMIN_EMAIL } from "@env";
import useAuth from "../hooks/useAuth";
import { getUserRole } from "../Services/auth";
const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  const [role, setRole] = useState(null);
  const [userDat, setUserDat] = useState([]);
  const { user } = useAuth();
  const email = user?.email;

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        // if (email != "admin@tatweer.co.uk") {
        if (email != ADMIN_EMAIL) {
          try {
            const result = await getUserRole(user.email);
            setUserDat(result);
            setRole(result[0]?.Role);
          } catch (error) {
            console.error("Error fetching user role:", error);
          }
        }
      };

      fetchData();
    }
  }, [email]);
  if (user?.email == ADMIN_EMAIL) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            options={{ headerShown: true }}
            component={HomeScreen}
          />
          <Stack.Screen
            name="SignUpScreen"
            options={{ headerShown: false }}
            component={SignUpScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else if (user && role == "Operator") {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="OperatorHomeScreen">
          <Stack.Screen
            name="OperatorHomeScreen"
            options={{ headerShown: false }}
            component={OperatorHomeScreen}
          />
          <Stack.Screen
            name="OperatorMainScreen"
            options={{ headerShown: false }}
            component={OperatorMainScreen}
          />
          <Stack.Screen
            name="TimeTabeScreen"
            options={{ headerShown: false }}
            component={TimeTabeScreen}
          />
          <Stack.Screen
            name="Userprofile"
            options={{ headerShown: false }}
            component={Userprofile}
            initialParams={{ CurrentUserData: userDat }}
          />

          <Stack.Screen
            name="PushNotification"
            options={{ headerShown: false }}
            component={PushNotification}
            initialParams={{ CurrentUserData: userDat }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else if (user && role == "Passenger") {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="PassengerTripList">
          <Stack.Screen
            name="PassengerTripList"
            options={{ headerShown: false }}
            component={PassengerTripList}
            initialParams={{ CurrentUserData: role }}
          />
          <Stack.Screen
            name="UsersListScreen"
            options={{ headerShown: false }}
            component={UsersListScreen}
          />
          {/* <Stack.Screen
            name="PassengerScreen"
            options={{ headerShown: false }}
            component={PassengerScreen}
          /> */}
          <Stack.Screen
            name="Userprofile"
            options={{ headerShown: false }}
            component={Userprofile}
            initialParams={{ CurrentUserData: userDat }}
          />
          <Stack.Screen
            name="PushNotification"
            options={{ headerShown: false }}
            component={PushNotification}
            initialParams={{ CurrentUserData: userDat }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else if (user && role == "Driver") {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="DriverTripListScreen">
          <Stack.Screen
            name="DriverTripListScreen"
            options={{ headerShown: false }}
            // Pass the component class/function directly, without instantiating it
            component={DriverTripListScreen}
            // Pass props using the initialParams property
            initialParams={{ CurrentUserData: userDat }}
          />
          <Stack.Screen
            name="DriversScreen"
            options={{ headerShown: false }}
            component={DriversScreen}
          />
          <Stack.Screen
            name="Userprofile"
            options={{ headerShown: false }}
            component={Userprofile}
            initialParams={{ CurrentUserData: userDat }}
          />
          <Stack.Screen
            name="PushNotification"
            options={{ headerShown: false }}
            component={PushNotification}
            initialParams={{ CurrentUserData: userDat }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="LoginScreen"
            options={{ headerShown: false }}
            component={LoginScreen}
            initialParams={{ CurrentUserData: userDat }}

          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
