import React, { useEffect, useState } from "react";
import {
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import { db, storage } from "../Services/config";

import {
  collection,
  query,
  getDoc,
  getDocs,
  updateDoc,
  doc,
  where,
} from "@firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

const Userprofile = ({ navigation, route }) => {
  const [image, setImage] = useState(null);
  const [galleryPermission, setGalleryPermission] = useState(false);
  const [userData, setUserData] = useState([]);
  const [updatedUserData, setUpdatedUserData] = useState({
    ImgUrl: "",
    Phone_Number: "",
  });
  const [isImageSelected, setIsImageSelected] = useState(false);
  const { CurrentUserData } = route.params;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "Users"),
          where("Nick_Name", "==", CurrentUserData[0].Nick_Name)
        );
        const querySnapshot = await getDocs(q);
        const userDataArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserData(userDataArray);
        if (userDataArray.length > 0) {
          setUpdatedUserData(userDataArray[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const requestGalleryPermission = async () => {
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setGalleryPermission(galleryStatus.status === "granted");
    };

    requestGalleryPermission();
  }, []);

  const handleChooseImage = async () => {
    if (!galleryPermission) {
      Alert.alert(
        "Permission Required",
        "Please grant access to the gallery to choose an image.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const myImage = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (myImage.cancelled) return;

      const { uri } = myImage.assets[0];

      // Manipulate the image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 80, height: 80 } }],
        { compress: 0.5, format: "png" }
      );
      const metadata = {
        contentType: "image/png",
      };
      // Extract filename from the URI
      const filename = extractFilename(manipulatedImage.uri);

      // Get the download URL of the uploaded image
//{"publicKey":"BEDICcLaey9yB3TcyFIfmS6wwcUYuHltgLz24LQ3G_ZUj6L5lDCEKtEVp2FjWd84LR90Wp0Mod5uaGm61V1nbRc","privateKey":"WkZPHmdBDnAqG3f689zBv0OFrehAAAc2z-QBh4FdRgU"}

      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function () {
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", manipulatedImage.uri, true);
        xhr.send(null);
      });
      const imgRef = ref(storage, `Images/${filename}`);
      await uploadBytes(imgRef, blob, metadata);
      const downloadURL = await getDownloadURL(imgRef);
      // Update state with the download URL
      setImage(downloadURL);
      setUpdatedUserData({
        ...updatedUserData,
        ImgUrl: downloadURL,
      });
      setIsImageSelected(true);
    } catch (error) {
      console.error("Error choosing image:", error);
      Alert.alert("Error", "Failed to choose image.");
    }
  };

  const extractFilename = (uri) => {
    // Split the URI by `/` and take the last part which contains the filename
    return uri.split("/").pop();
  };

  const handleUpdate = async (userId) => {
    try {
      const userRef = doc(db, "Users", userId);
      await updateDoc(userRef, updatedUserData);
      console.log("User updated successfully");
      const updatedData = await getDoc(userRef);
      if (updatedData.exists()) {
        setUpdatedUserData(updatedData.data());
      } else {
        console.error("Document does not exist");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.navButton}>
            <AntDesign name="back" size={24} color="black" />
          </View>
        </TouchableOpacity>
        <View style={styles.container}>
          <View style={styles.profileContainer}>
            {userData.map((user, index) => (
              <View style={styles.userInfo} key={index}>
                {updatedUserData.ImgUrl && (
                  <Image
                    source={{ uri: updatedUserData.ImgUrl }}
                    style={[styles.imagePreview, { width: 100, height: 100 }]}
                    resizeMode="cover"
                    onError={(error) =>
                      console.log("Error loading image:", error)
                    }
                  />
                )}
                <View style={styles.row}>
                  <TextInput
                    style={styles.input}
                    value={updatedUserData?.ImgUrl}
                    onChangeText={(text) =>
                      setUpdatedUserData({ ...updatedUserData, ImgUrl: text })
                    }
                  />
                  <TouchableOpacity onPress={handleChooseImage}>
                    <View style={styles.btn}>
                      <Text style={styles.label}>اختر صورة</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.row}>
                  <TextInput
                    style={styles.input}
                    value={updatedUserData.Phone_Number}
                    onChangeText={(text) =>
                      setUpdatedUserData({
                        ...updatedUserData,
                        Phone_Number: text,
                      })
                    }
                  />
                  <View style={styles.btn}>
                    <Text style={styles.label}>رقم الهاتف</Text>
                  </View>
                </View>
                {isImageSelected && ( // Conditionally render the "تعديل" button
                  <TouchableOpacity onPress={() => handleUpdate(user.id)}>
                    <View style={styles.button}>
                      <Text style={styles.buttonText}>تعديل</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Userprofile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "grey",
    justifyContent: "center",
    alignItems: "center",
  },
  navButton: {
    marginBottom: 20,
  },
  profileContainer: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },
  userInfo: {
    margin: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 10,
    borderRadius: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
    color: "#333",
  },
  button: {
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    alignSelf: "flex-end",
    marginTop: 10,
  },
  btn: {
    backgroundColor: "#dfdfdf",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignSelf: "flex-end",
    marginTop: 10,
  },
  buttonText: {
    color: "#333",
    textAlign: "center",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 289,
    marginBottom: 10,
  },
  input: {
    width: "75%",
    height: 40,
    borderColor: "grey",
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    textAlign: "right",
    color: "#333",
  },
  imagePreview: {
    width: 100,
    height: 100,
    margin: 20,
    borderRadius: 10,
  },
});
