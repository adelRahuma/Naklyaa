// import { View, Text, Alert } from "react-native";
// import React, { useEffect, useState } from "react";
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { auth } from "../Services/config";
// export default function useAuth() {
//   const [user, setUser] = useState(null);
//   const [role, setRole] = useState(null);
//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setUser(user);
//         //console.log(user);
//       } else {
//         setUser(null);
//       }
//     });
//     return unsub;
//   }, []);

//   const logout = async () => {
//     try {
//       await signOut(auth);
//       setUser(null);
//     } catch (error) {
//       console.error("Error logging out:", error);
//       throw error;
//     }
//   };

//   return { user, role, logout };
// }

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "@firebase/auth";
import { auth } from "../Services/config";
import { getUserRole } from "../Services/auth";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Fetch and set the user's role
        const userRole = await getUserRole(user.email); // Assuming fetchUserRole is a function to fetch the user's role
        //  console.log("user role auth", userRole);
        setRole(userRole);
      } else {
        setUser(null);
        setRole(null); // Reset role when user is logged out
      }
    });

    return unsub;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null); // Reset role on logout
    } catch (error) {
      console.error("Error logging out:", error);
      // throw error;
    }
  };

  return { user, logout };
}
