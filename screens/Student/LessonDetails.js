import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { db, auth } from "../../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function LessonDetails({ route }) {
  const { subject } = route.params; // 🔹 İstatistik'ten gelen ders
  const [records, setRecords] = useState([]);

  const formatTime = (totalSeconds) =>{
    const hours = Math.floor(totalSeconds/3600);
    const minutes = Math.floor((totalSeconds%3600)/60);
    const seconds = totalSeconds %60;
    return `${hours} saat ${minutes} dk ${seconds} sn `;
  };

  useEffect(() => {
  if (!auth.currentUser || !subject) return;

  const q = query(
    collection(db, "studentSubjects"),
    where("studentId", "==", auth.currentUser.uid),
    where("dersAdi", "==", subject.name)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    tarih: data.tarih?.toDate().toLocaleString("tr-TR"), // ✅ tarih alanını string yap
    sure: data.sure, // zaten string veya number olmalı
  };
});
    setRecords(list);
  });

  return () => unsubscribe();
}, [subject]);
  

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#eef2f7",marginTop:30 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15 }}>
        📖 {subject.name} Çalışma Geçmişi
      </Text>

      <ScrollView>
        {records.length > 0 ? (
          records.map((rec) => (
            <View key={rec.id} style={styles.card}>
              <Text style={styles.label}>Tarih:</Text>
              <Text style={styles.value}>{rec.tarih}</Text>
              
              <Text style={styles.label}>Süre:</Text>
              <Text style={styles.value}>{formatTime(rec.sure)}</Text>
            </View>
          ))
        ) : (
          <Text>Henüz kayıt yok.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 5,
   },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
