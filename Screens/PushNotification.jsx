import React, { useState, useEffect } from "react";
import { Text, View, Button, Alert, TextInput, Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { collection, doc, setDoc } from "@firebase/firestore";
import { Picker } from "@react-native-picker/picker";

import { db } from "../Services/config";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
const tokenData = [
  {
    id: "token1",
    label: "Token 1",
    value: "ExponentPushToken[QMNZFaKvUUdVJF1drNOlGN]",
  },
  {
    id: "token2",
    label: "Token 2",
    value: "ExponentPushToken[YveBGAFDtTFsIgL4w3xwtG]",
  },
  {
    id: "token3",
    label: "Token 3",
    value: "ExponentPushToken[xy2EExB94coWvp3OoBYWb9]",
  },
  //ExponentPushToken[xy2EExB94coWvp3OoBYWb9] Add more token objects as needed
];
const PushNotification = ({ navigation, route }) => {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [selectedToken, setSelectedToken] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const { CurrentUserData } = route.params;

  useEffect(() => {
    registerForPushNotificationsAsync().then(async (token) => {
      setExpoPushToken(token);
      console.log(token); // Save the token to Firestore
      if (token) {
        try {
          const UsersTokensRef = collection(db, "tokens");
          const tokensDocRef = doc(
            UsersTokensRef,
            CurrentUserData[0]?.Nick_Name
          ); // Use nickname as document ID
          await setDoc(tokensDocRef, {
            token: token,
          });
        } catch (error) {
          console.error("Error adding token to Firestore:", error);
        }
      }
    });
  }, []);

  const registerForPushNotificationsAsync = async () => {
    let token = null;

    // Set up notification channel for Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    // Check if the device is capable of receiving push notifications
    if (Device.isDevice) {
      // Request permission for notifications if not granted already
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // Retrieve the push token
      if (finalStatus === "granted") {
        const tokenResponse = await Notifications.getExpoPushTokenAsync({
          projectId: "a688b0ca-6fa7-4f58-ae02-a9bb8ac2829c",
        });
        token = tokenResponse.data;
        console.log("Push token:", token);
      } else {
        Alert.alert("Failed to get push token for push notification!");
      }
    } else {
      Alert.alert("Must use physical device for Push Notifications");
    }

    return token;
  };

  const sendNotification = async () => {
    console.log(selectedToken, "Sending push notification...");

    // notification message
    const message = {
      to: selectedToken,
      sound: "default",
      title: notificationTitle,
      body: notificationBody,
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        host: "exp.host",
        accept: "application/json",
        "accept-encoding": "gzip, deflate",
        "content-type": "application/json",
      },
      body: JSON.stringify(message),
    });
  };

  return (
    <View style={{ marginTop: 100, alignItems: "center" }}>
      <Text style={{ marginVertical: 30 }}>Expo RN Push Notifications</Text>
      <Button title="Send push notification" onPress={sendNotification} />
      <View style={{ marginTop: 20 }}>
        <Text>Select Token:</Text>
        <Picker
          selectedValue={selectedToken}
          onValueChange={(itemValue) => setSelectedToken(itemValue)}
        >
          {/* Here, you'll map over your token data to create Picker.Item components */}
          {/* For example: */}
          {tokenData.map((token) => (
            <Picker.Item
              key={token.id}
              label={token.label}
              value={token.value}
            />
          ))}
        </Picker>
      </View>
      <View style={{ marginTop: 20 }}>
        <Text>Title:</Text>
        <TextInput
          style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
          onChangeText={(text) => setNotificationTitle(text)}
          value={notificationTitle}
        />
      </View>
      <View style={{ marginTop: 20 }}>
        <Text>Body:</Text>
        <TextInput
          style={{ height: 80, borderColor: "gray", borderWidth: 1 }}
          onChangeText={(text) => setNotificationBody(text)}
          value={notificationBody}
          multiline
        />
      </View>
    </View>
  );
};

export default PushNotification;
