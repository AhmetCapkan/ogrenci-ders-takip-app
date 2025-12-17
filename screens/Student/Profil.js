// Profil.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { auth, db, storage } from "../../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Profil({navigation}) {
  const [userData, setUserData] = useState(null);

  // Kullanıcı verilerini Firestore'dan çek
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profil Bilgileri</Text>


      <View style={styles.card}>
        <Text style={styles.label}>İsim</Text>
        <Text style={styles.value}>{userData.name}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Soyisim</Text>
        <Text style={styles.value}>{userData.surname}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{userData.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Okul</Text>
        <Text style={styles.value}>{userData.schoolName}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Sınıf</Text>
        <Text style={styles.value}>{userData.class}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Rol</Text>
        <Text style={styles.value}>{userData.role}</Text>
      </View>

      <TouchableOpacity 
        onPress={()=> navigation.navigate("Inbox")}>
        <View style={[styles.card, styles.row]}>
          <Text style={styles.value}>Gelen Kutusu</Text>
          <MaterialCommunityIcons name="email-newsletter" size={24} color="black" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={()=> navigation.navigate("Homework")}>
        <View style={[styles.card, styles.row]}>
          <Text style={styles.value}>Ödevler</Text>
          <MaterialCommunityIcons name="email-send" size={24} color="black" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#eef2f7",
    marginTop:20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eef2f7",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  icon:{
    
  },
  row: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}
});
