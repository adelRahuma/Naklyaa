import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import {
  initializeAuth,
  browserLocalPersistence,
  getAuth,
  setPersistence,
  getReactNativePersistence,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  DATABASE_URL,
  STORAGE_BUCKET,
  MESSAGING_ID,
  APP_ID,
} from "@env";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: API_KEY || "AIzaSyDNSITsSWtklYteq25SyMYiqYX552JQTqo",
  authDomain: AUTH_DOMAIN || "AIzaSyBSR0YLAWrFIrjXLEGmxsmjIEPPwYOsyB4",
  projectId: PROJECT_ID || "nakleeya.firebaseapp.co",
  databaseURL: DATABASE_URL || "257745076098",
  storageBucket: STORAGE_BUCKET || "1:257745076098:web:977c8e7fd44fb25c7c599b",
  messagingSenderId: MESSAGING_ID || "admin@tatweer.co.uk",
  appId: APP_ID || "asd123",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
let auth;

if (Platform.OS == "web") {
  auth = getAuth(app);
  auth.setPersistence({ type: "LOCAL" });
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

export { app, auth, db, storage };
