import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
} from "react-native";
import { db, auth } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function ChatScreen({ route }) {
  const { teacherId, teacherName } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "messages"),
      where("senderId", "in", [currentUser.uid, teacherId]),
      where("receiverId", "in", [currentUser.uid, teacherId])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [teacherId]);

  // BURAYI DİKKATLİCE KOPYALA – HİÇBİR PARANTEZ EKSİK/FAZLA YOK
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        receiverId: teacherId,
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Mesaj gönderilemedi:", err);
    }
  };

  const scrollToEnd = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Klavye açılınca da scroll et
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", scrollToEnd);
    const hide = Keyboard.addListener("keyboardDidHide", scrollToEnd);
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff",marginTop:20 }}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* 1. HEADER */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 15,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderColor: "#eee",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>🧑‍🏫   {teacherName}</Text>
      </View>

      {/* 2. MESAJ LİSTESİ – flex: 1 ile yukarı itilir */}
      <FlatList
        ref={flatListRef}
        data={messages}
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }} // önemli: alttan boşluk
        keyExtractor={(item) => item.id}
        onContentSizeChange={scrollToEnd}
        onLayout={scrollToEnd}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: item.senderId === currentUser.uid ? "flex-end" : "flex-start",
              backgroundColor: item.senderId === currentUser.uid ? "#007AFF" : "#E5E5EA",
              padding: 12,
              borderRadius: 18,
              marginVertical: 4,
              maxWidth: "78%",
            }}
          >
            <Text style={{ color: item.senderId === currentUser.uid ? "white" : "black", fontSize: 16 }}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {/* 3. INPUT ALANI – flex: 0 olduğu için en alta yapışır! */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          padding: 12,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderColor: "#ddd",
          paddingBottom: 20,
        }}
      >
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Mesaj yaz..."
          multiline
          style={{
            flex: 1,
            backgroundColor: "#f2f2f7",
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 10,
            marginRight: 10,
            maxHeight: 100,
            fontSize: 16,
          }}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={{
            backgroundColor: "#007AFF",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 25,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Gönder</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}