import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f6ff" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profil Görseli */}
        <View style={styles.headerCircle}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
            }}
            style={styles.avatar}
          />
        </View>

        {/* Başlık */}
        <Text style={styles.loginTitle}>Log In</Text>

        {/* Kullanıcı Adı */}
        <View style={styles.inputContainer}>
          <Icon name="person-outline" size={20} color="#555" />
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="#aaa"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        {/* Şifre */}
        <View style={styles.inputContainer}>
          <Icon name="lock-closed-outline" size={20} color="#555" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Giriş Butonu */}
        <TouchableOpacity style={styles.loginBtn}>
          <Text style={styles.loginBtnText}>Log In</Text>
        </TouchableOpacity>

        {/* Alt Bağlantılar */}

        {/* Ayraç */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Kayıt Ol */}
        <Text style={styles.signupText}>
          Don’t have an account?{" "}
          <Text style={styles.signupLink}>Sign Up</Text>
        </Text>

        
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 40,
  },
  headerCircle: {
    backgroundColor: "#5a6cf3",
    width: 250,
    height: 250,
    borderBottomLeftRadius: 125,
    borderBottomRightRadius: 125,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginTop: 30,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#334",
    marginTop: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6e9ff",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginVertical: 10,
    width: "80%",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 10,
    color: "#333",
  },
  loginBtn: {
    backgroundColor: "#5a6cf3",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    width: "80%",
    alignItems: "center",
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linksRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 10,
  },
  link: {
    color: "#5a6cf3",
    fontSize: 13,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "80%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  orText: {
    marginHorizontal: 10,
    color: "#666",
  },
  signupText: {
    color: "#333",
  },
  signupLink: {
    color: "#5a6cf3",
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    marginTop: 25,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
  },
  activeDot: {
    backgroundColor: "#5a6cf3",
  },
});
