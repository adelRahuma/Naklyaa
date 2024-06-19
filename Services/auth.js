import { auth, db } from "./config";
import {
  collection,
  addDoc,
  query,
  updateDoc,
  doc,
  getDoc,
  where,
  setDoc,
  getDocs,
} from "@firebase/firestore";
import { signOut } from "@firebase/auth";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
} from "@firebase/auth";
import { ADMIN_EMAIL, P_W } from "@env";
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
 
    return { user: user };
  } catch (error) {
    console.error("Error signing in:", error.message);
    return { msg: error.message };
  }
};

export const forgotPassword = async (email) => {
  // Regular expression to validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    console.log("Please enter a valid email address.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent. Please check your email.");
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      alert("This email is not registered.");
    } else {
      console.error("Error sending password reset email:", error.message);
      alert("An error occurred while sending the password reset email.");
    }
  }
};

// Define signUp function
export const signUp = async (newUserDetails) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      newUserDetails.email.toLowerCase(),
      newUserDetails.password
    );
    const uid = userCredential.user.uid;
    var user = auth.currentUser;
    await auth.signOut();

    const adminUserCred = await signInWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      P_W
    );

    const userData = {
      email: newUserDetails.email.toLowerCase(),
      Full_Name: newUserDetails.fullName,
      Nick_Name: newUserDetails.nickName.toUpperCase(),
      Gender: newUserDetails.gender,
      Phone_Number: newUserDetails.phoneNumber,
      Location: newUserDetails.location,
      Category: newUserDetails.category,
      Role: newUserDetails.role,
    };

    const userDocRef = doc(db, "Users", uid);
    await setDoc(userDocRef, userData);
    console.log("Document written with ID: ", userDocRef.id);
    return adminUserCred.user;
  } catch (error) {
    user
      ?.delete()
      .then(() => console.log("User deleted"))
      .catch((error) => console.log(error));
    console.error("Error signing up:", error.message);
    if (error.code === "auth/email-already-in-use") {
      console.error("Email is already in use.");
    } else {
      console.error("Error signing up:", error.message);
    }
    throw error;
  }
};
export const getUserPassengersData = async () => {
  try {
    const q = query(collection(db, "Users"), where("Role", "==", "Passenger"));
    const querySnapshot = await getDocs(q);
    const userData = [];
    querySnapshot.forEach((doc) => {
      userData.push({ ...doc.data() });
    });
    return userData;
  } catch (error) {
    console.error("Error fetching user passengers data:", error.message);
    return []; // Return an empty array if an error occurs
  }
};

export const getUsersData = async () => {
  //const userRole = role; //"Admin";
  const q = query(
    collection(db, "Users")
    // collection(db, "UsersDetails")
    // where("role", "==", userRole)
  );
  const querySnapshot = await getDocs(q);
  const userData = [];
  querySnapshot.forEach((doc) => {
    //console.log(doc.id, " => ", doc.data());
    userData.push({ ...doc.data() });
  });

  return userData;
};
export const getUserRole = async (userEmail) => {
  const q = query(collection(db, "Users"), where("email", "==", userEmail)); // Add where clause to filter by email
  const querySnapshot = await getDocs(q);
  const userData = [];
  querySnapshot.forEach((doc) => {
    const { email, Role, Nick_Name, Full_Name } = doc.data();
    userData.push({ email, Role, Nick_Name, Full_Name });
  });
  // console.log(userData);
  return userData;
};

export const SearchByName = async (text) => {
  try {
    // Query Firestore Users collection for names containing the provided text
    const querySnapshot = query(
      collection(db, "Users"),
      where("Full_Name", ">=", text),
      where("Full_Name", "<=", text + "\uf8ff")
    );
    const result = await getDocs(querySnapshot);
    // Extract names from query result and update passengersList
    const filteredPassengers = [];
    result.docs.forEach((doc) => {
      filteredPassengers.push(doc.data());
    });
    //console.log("filtered -->", filteredPassengers);
    return filteredPassengers;
  } catch (error) {
    console.error("Error searching Firestore Users collection:", error);
  }
};

export const insertDuty = async (driver, passengersArray) => {
  try {
    const driversCollectionRef = collection(db, "drivers");

    // Check if the driver document exists
    const driverDocRef = doc(driversCollectionRef, driver);
    const driverSnapshot = await getDoc(driverDocRef);

    const currentDate = new Date().toISOString().split("T")[0]; // Extracting date part only

    if (driverSnapshot.exists()) {
      const driverData = driverSnapshot.data();
      const dutyNotDone = driverData.dutyNotDone;

      if (dutyNotDone) {
        // If duty not done, update the passengers array
        await updateDoc(driverDocRef, {
          passengers: passengersArray,
        });
        console.log("Passengers array updated for driver:", driver);
      } else {
        // If duty is already done, create a new driver with a unique name
        const newDriverName = `${driver}_${currentDate}`;
        const newDriverDocRef = doc(driversCollectionRef, newDriverName);
        await setDoc(newDriverDocRef, {
          passengers: passengersArray,
          dutyNotDone: true,
          date: currentDate,
        });
        console.log("New document created for driver:", newDriverName);
      }
    } else {
      // If driver document doesn't exist, create a new one with the passengers array and current date
      await setDoc(driverDocRef, {
        passengers: passengersArray,
        dutyNotDone: true, // Assuming a new driver has duty not done
        date: currentDate, // Add the current date to the document
      });
      console.log(
        "New document created for driver:",
        driver,
        "on date:",
        currentDate
      );
    }
  } catch (error) {
    console.error("Error inserting duty:", error.message);
    throw error;
  }
};
