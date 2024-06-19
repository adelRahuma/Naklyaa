import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Image,
  TextInput,
  Platform,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as XLSX from "xlsx";
import * as DocumentPicker from "expo-document-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
} from "react-native-heroicons/outline";
import { Formik } from "formik";
import * as yup from "yup";
import { signUp } from "../../Services/auth";
import { SelectList } from "react-native-dropdown-select-list";
import SelectDropdown from "react-native-select-dropdown";
import useAuth from "../../hooks/useAuth";

const SignUpScreen = ({ navigation }) => {
  const [signupStatus, setSignupStatus] = useState(null);
  const [selected, setSelected] = useState("");
  const [role, setRole] = useState("");
  const [data, setData] = useState([]);

  const genderOptions = ["ذكر", "أنثى"];
  const rolesrOptions = [
    { key: "1", value: "Operator" },
    { key: "2", value: "Driver" },
    { key: "3", value: "Passenger" },
  ];
  const gender = [
    { key: "1", value: "ذكر" },
    { key: "2", value: "أنثى" },
  ];
  const Roles = ["Operator", "Driver", "Passenger"];
  const { user } = useAuth();

  const validationSchema = yup.object().shape({
    fullName: yup.string().required("الاسم كامل"),
    email: yup
      .string()
      .email("الرجاء إدخال بريد إلكتروني صالح")
      .required("البريد الإلكتروني مطلوب"),
    nickName: yup
      .string()
      .min(3, "لاتقل عن ثلاث حروف")
      .max(3, " لاتزيد عن ثلاث حروف")
      .required("الرمز الثلاثي اجباري"),
    password: yup
      .string()
      .min(6, "كلمة المرور لاتقل عن ستة حروف او ارقام")
      .required("يجب كتابة كلمة المرور"),
    gender: yup
      .string()
      .oneOf(genderOptions, "غير مدرجة")
      .required("تحديد الجنس"),
    location: yup.string().required("هذه الخانة مطلوب ادخالها"),
    phoneNumber: yup
      .string()
      .matches(/^[0-9]+$/, "رقم الهاتف يجب أن يحتوي على أرقام فقط"),
    category: yup.string().required("ارجو كتاب اسم الشركة"),
    role: yup
      .string()
      .oneOf(Roles, "وظيفة غير مدرجة")
      .required("ارجو كتاب الوظيفة"),
  });

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleSignUp = async (values) => {
    try {
      console.log(values);
      await signUp(values);
      setSignupStatus("Success");
    } catch (error) {
      console.error("Sign up error:", error);
      setSignupStatus("Error");
    }
  };

  const handleFile1 = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: false,
        type: [
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ],
      });
      console.log("res ->", res);
      const response = await fetch(res.assets[0].uri);
      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      //console.log("Worksheet:", worksheet);
      setData(json);
      json.forEach((row, index) => {
        console.log(`Row ${index + 1}`);
        console.log(`A: ${row[0]}`);
        console.log(`B: ${row[1]}`);
        console.log(`C: ${row[2]}`);
      });
      json.forEach((row, index) => console.log(row));
    } catch (err) {
      console.error(err);
    }
  };

  const styles = StyleSheet.create({
    inputRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    inputWrapper: {
      flex: 1,
      marginRight: 10,
    },
    input: {
      padding: 12,
      backgroundColor: "#E5E7EB",
      color: "#374151",
      borderRadius: 20,
      textAlign: "right",
    },
    errorText: {
      color: "red",
      fontSize: 16,
    },
    container: {
      flex: 1,
      backgroundColor: "white",
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
      width: 165,
      height: 110,
    },
    formContainer: {
      flex: 1,
      marginHorizontal: 15,
      marginTop: 10,
    },
    form: {
      marginHorizontal: 20,
      marginTop: 20,
    },
    signUpButton: {
      marginVertical: 20,
      backgroundColor: "#FFD700",
      paddingVertical: 12,
      borderRadius: 20,
    },
    signUpButtonText: {
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
      marginTop: 7,
    },
    socialIcon: {
      padding: 2,
      backgroundColor: "#E5E7EB",
      borderRadius: 20,
    },
    haveAccountContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 7,
    },
    haveAccountText: {
      color: "#6B7280",
      fontWeight: "bold",
    },
    loginLink: {
      color: "#FFD700",
      fontWeight: "bold",
    },
    buttonStyle: {
      padding: 12,
      backgroundColor: "#E5E7EB",
      borderRadius: 20,
      marginBottom: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    buttonTextStyle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#666",
    },
    errorText: {
      marginTop: 20,
      color: "red",
      fontSize: 16,
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
    },
    dropdownContainer: {
      marginTop: 10,
      borderWidth: 1,
      borderRadius: 20,
      borderColor: "#E5E7EB",
      backgroundColor: "#E5E7EB",
    },
    dropdownTextStyle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#374151",
      padding: 10,
    },
    dropdownDropdownStyle: {
      backgroundColor: "#E5E7EB",
      borderWidth: 1,
      borderRadius: 20,
      borderColor: "#E5E7EB",
    },
    icon: {
      position: "absolute",
      top: 14,
      right: 12,
    },
  });

  const themeColors = {
    bg: "white",
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: themeColors.bg }}
      >
        <ScrollView className="flex-1 px-4">
          <View className="flex-row justify-start">
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <ArrowLeftIcon size="20" color="black" />
            </TouchableOpacity>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/images/signup.png")}
              style={styles.image}
            />
          </View>
          <TouchableOpacity style={styles.buttonStyle} onPress={handleFile1}>
            <Text style={styles.buttonTextStyle}>تحميل ملف اكسل</Text>
          </TouchableOpacity>
          <View style={styles.formContainer}>
            <Formik
              initialValues={{
                fullName: "",
                nickName: "",
                gender: "",
                phoneNumber: "",
                location: "",
                category: "",
                role: "",
                email: "",
                password: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSignUp}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View style={styles.form}>
                  <View style={styles.inputRow}>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        placeholder="اسم الشركة"
                        style={styles.input}
                        onChangeText={handleChange("category")}
                        onBlur={handleBlur("category")}
                        value={values.category}
                      />
                      {touched.category && errors.category && (
                        <Text style={styles.errorText}>{errors.category}</Text>
                      )}
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        placeholder="رمز المستخدم"
                        style={styles.input}
                        onChangeText={handleChange("nickName")}
                        onBlur={handleBlur("nickName")}
                        value={values.nickName}
                      />
                      {touched.nickName && errors.nickName && (
                        <Text style={styles.errorText}>{errors.nickName}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.inputRow}>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        placeholder="الموقع"
                        style={styles.input}
                        onChangeText={handleChange("location")}
                        onBlur={handleBlur("location")}
                        value={values.location}
                      />
                      {touched.location && errors.location && (
                        <Text style={styles.errorText}>{errors.location}</Text>
                      )}
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        placeholder="رقم الهاتف"
                        style={styles.input}
                        onChangeText={handleChange("phoneNumber")}
                        onBlur={handleBlur("phoneNumber")}
                        value={values.phoneNumber}
                      />
                      {touched.phoneNumber && errors.phoneNumber && (
                        <Text style={styles.errorText}>
                          {errors.phoneNumber}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.inputRow}>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        placeholder="كلمة المرور"
                        style={styles.input}
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                        value={values.password}
                        secureTextEntry
                      />
                      {touched.password && errors.password && (
                        <Text style={styles.errorText}>{errors.password}</Text>
                      )}
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        placeholder="البريد الإلكتروني"
                        style={styles.input}
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                        value={values.email}
                      />
                      {touched.email && errors.email && (
                        <Text style={styles.errorText}>{errors.email}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.inputRow}>
                    <View style={styles.inputWrapper}>
                      <SelectList
                        setSelected={(val) => {
                          setSelected(val);
                          handleChange("role")(val);
                        }}
                        data={Roles}
                        save="value"
                        placeholder="حدد الوظيفة"
                        searchPlaceholder="البحث"
                        inputStyles={styles.dropdownTextStyle}
                        dropdownStyles={styles.dropdownDropdownStyle}
                        boxStyles={styles.dropdownContainer}
                        dropdownTextStyles={styles.dropdownTextStyle}
                      />
                      {touched.role && errors.role && (
                        <Text style={styles.errorText}>{errors.role}</Text>
                      )}
                    </View>

                    <View style={styles.inputWrapper}>
                      <SelectList
                        setSelected={(val) => {
                          setSelected(val);
                          handleChange("gender")(val);
                        }}
                        data={gender}
                        save="value"
                        placeholder="حدد الجنس"
                        searchPlaceholder="البحث"
                        inputStyles={styles.dropdownTextStyle}
                        dropdownStyles={styles.dropdownDropdownStyle}
                        boxStyles={styles.dropdownContainer}
                        dropdownTextStyles={styles.dropdownTextStyle}
                      />
                      {touched.gender && errors.gender && (
                        <Text style={styles.errorText}>{errors.gender}</Text>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.buttonTextStyle}>تسجيل</Text>
                  </TouchableOpacity>
                  {signupStatus === "Success" && (
                    <Text style={{ color: "green", textAlign: "center" }}>
                      تم التسجيل بنجاح
                    </Text>
                  )}
                  {signupStatus === "Error" && (
                    <Text style={styles.errorText}>
                      حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى
                    </Text>
                  )}
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
