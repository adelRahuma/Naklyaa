import React, { useState, useEffect } from "react";
import { loginWithEmailAndPassword, forgotPassword } from "../Services/auth";
import {
  View,
  SafeAreaView,
  Text,
  Keyboard,
  Platform,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { registerForPushNotificationsAsync } from "../Services/SendNotification";

import { ArrowLeftIcon } from "react-native-heroicons/solid";

export default function LoginScreen_1({ navigation, route }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { CurrentUserData } = route.params;
  useEffect(() => {
    const timer = setTimeout(() => {
      setError(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
    } else {
      setError(null);
    }
  }, [email]);
  const handleLogin = async () => {
    if (email && password) {
      try {
        const response = await loginWithEmailAndPassword(email, password);

        await registerForPushNotificationsAsync(CurrentUserData[0].Nick_Name);

        if (!response.user) {
          setError(response.msg);
          return;
        }
        Alert(response.msg);
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleForgotPassword = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (email) {
      console.log(email);
      try {
        await forgotPassword(email);
        alert("Check your email to reset the password!.");
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleSignUp = async () => {
    navigation.navigate("SignUpScreen");
  };

  const themeColors = {
    bg: "white",
  };

  const styles = {
    container: {
      flex: 1,
      backgroundColor: themeColors.bg,
    },
    //safeAreaView: {
    //   flex: 1,
    // },
    row: {
      flexDirection: "row",
      justifyContent: "start",
    },
    backButton: {
      backgroundColor: "#FFD700",
      padding: 10,
      borderRadius: 20,
      marginLeft: 20,
    },
    imageContainer: {
      flexDirection: "row",
      justifyContent: "center",
    },
    image: {
      width: 200,
      height: 200,
    },
    form: {
      marginHorizontal: 20,
      marginTop: 20,
    },
    input: {
      padding: 15,
      backgroundColor: "#E5E7EB",
      color: "#374151",
      borderRadius: 20,
      marginBottom: 10,
    },
    forgotPasswordText: {
      color: "#374151",
      marginBottom: 20,
    },
    loginButton: {
      backgroundColor: "#FFD700",
      paddingVertical: 15,
      borderRadius: 20,
      marginTop: 40,
    },
    loginButtonText: {
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      color: "#374151",
    },
    orText: {
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      color: "#374151",
      marginVertical: 20,
    },
    socialIconsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginHorizontal: 20,
    },
    socialIcon: {
      padding: 10,
      backgroundColor: "#E5E7EB",
      borderRadius: 20,
    },
    signUpTextContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 40,
    },
    signUpText: {
      color: "#6B7280",
      fontWeight: "bold",
    },
    signUpLink: {
      color: "#FFD700",
      fontWeight: "bold",
    },
    errorText: {
      marginTop: 20,
      color: "red",
      fontSize: 16,
      justifyContent: "center",
      alignItems: "center",
    },
  };
  const [keyboardSpace, setKeyboardSpace] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        setKeyboardSpace(event.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardSpace(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        style={{ paddingBottom: keyboardSpace }}
      >
        <View style={styles.container}>
          <SafeAreaView style={styles.safeAreaView}>
            <View style={styles.row}>
              {/* <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <ArrowLeftIcon size="20" color="black" />
              </TouchableOpacity> */}
            </View>
            <View style={styles.imageContainer}>
              <Image
                source={require("../assets/images/login.png")}
                style={styles.image}
              />
            </View>

            <View style={styles.form}>
              {error && <Text style={styles.errorText}>{error}</Text>}
              <Text style={styles.inputLabel}>Email:</Text>
              <TextInput
                style={[styles.input, { textAlign: "left" }]}
                placeholder="Email"
                placeholderTextColor="gray"
                value={email}
                keyboardType="email-address"
                onChangeText={(text) => setEmail(text)}
                textContentType="emailAddress"
                autoCompleteType="email"
                autoCapitalize="none"
                textInputMode="email"
              />
              <Text style={styles.inputLabel}>Password:</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="password"
                value={password}
                onChangeText={(text) => setPassword(text)}
              />
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>نسيت كلمة المرور?</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Text style={styles.loginButtonText}>تسجيل الدخول </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
