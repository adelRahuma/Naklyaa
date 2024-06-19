// NotificationService.js

import React, { useState, useEffect } from "react";
import { Text, View, Button, Alert, TextInput, Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { collection, doc, setDoc } from "@firebase/firestore";
import { db } from "./config";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const sendNotification = async (token, title, body) => {
  const message = {
    to: token,
    sound: "default",
    title: title,
    body: body,
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

export const registerForPushNotificationsAsync = async (Nick_Name) => {
  console.log(
    "Email received in registerForPushNotificationsAsync:",
    Nick_Name
  );
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
//console.log("email: -> , email");
      if (token) {
        try  {
          const UsersTokensRef = collection(db, "tokens");
          const tokensDocRef = doc(UsersTokensRef, Nick_Name); // Use nickname as document ID
          await setDoc(tokensDocRef, {
            token: token,
          });
        } catch (error) {
         console.error("Error adding token to Firestore:", error);
        }
      }
    } else {
      Alert.alert("Failed to get push token for push notification!");
    }
  } else {
    Alert.alert("Must use physical device for Push Notifications");
  }

  return token;
};
