import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { auth, db } from "../../firebaseConfig";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
export default function TeacherMessageScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { student } = route.params; // TeacherHome’dan gelen öğrenci
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!student) return;

    const q = query(
      collection(db, "messages"),
      where("senderId", "in", [auth.currentUser.uid, student.id]),
      where("receiverId", "in", [auth.currentUser.uid, student.id]),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(list);
    });

    return unsubscribe;
  }, [student]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      await addDoc(collection(db, "messages"), {
        text: input,
        senderId: auth.currentUser.uid,
        receiverId: student.id,
        createdAt: serverTimestamp(),
      });
      setInput("");
      console.log(input);
      console.log(auth.currentUser.uid);
      console.log(student.id);
      console.log(serverTimestamp());
    } catch (err) {
      console.log("Mesaj gönderme hatası:", err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>🧑‍🏫 {student.name} {student.surname}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>X</Text>
        </TouchableOpacity>
      </View>

      {/* Mesajlar */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.senderId === auth.currentUser.uid ? styles.myMessage : styles.theirMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Mesaj yaz..."
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={{ color: "white" }}>Gönder</Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    
  },
  headerText: { fontSize: 18, fontWeight: "bold",  },
  closeBtn: { fontSize: 18, fontWeight: "bold", color: "white" },

  messageBubble: {
    margin: 8,
    padding: 10,
    borderRadius: 10,
    maxWidth: "70%",
  },
  myMessage: { backgroundColor: "#3498db", alignSelf: "flex-end" },
  theirMessage: { backgroundColor: "#ddd", alignSelf: "flex-start" },
  messageText: { color: "black" },

  inputContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#ccc",
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  sendBtn: {
    backgroundColor: "#3498db",
    padding: 10,
    marginLeft: 5,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
