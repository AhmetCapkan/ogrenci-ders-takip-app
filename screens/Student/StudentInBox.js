import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { db, auth } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function StudentInbox({ navigation }) {
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSenders = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Mesaj gönderen öğretmenlerin UID'lerini al
        const q = query(collection(db, "messages"), where("receiverId", "==", user.uid));
        const snapshot = await getDocs(q);

        const senderMap = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          senderMap[data.senderId] = true; // sadece unique
        });

        const senderIds = Object.keys(senderMap);

        // UID'lerden öğretmen bilgilerini çek
        const senderList = [];
        for (const uid of senderIds) {
          const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", uid)));
          userDoc.forEach(u => senderList.push({ uid: u.id, ...u.data() }));
        }

        setSenders(senderList);
      } catch (err) {
        console.error("Gelen mesajlar çekilemedi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSenders();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ flex:1, justifyContent:"center", alignItems:"center" }} />;

  return (
    <View style={{ flex:1, padding:20,marginTop:20 }}>
      <FlatList
        data={senders}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={{ padding:15, backgroundColor:"#eee", marginBottom:10, borderRadius:10 }}
            onPress={() => navigation.navigate("Chat", { teacherId: item.uid, teacherName: item.name })}
          >
            <Text style={{ fontSize:16, fontWeight:"bold" }}>🧑‍🏫{item.name} {item.surname}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
