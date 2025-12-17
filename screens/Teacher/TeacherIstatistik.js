import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Text,
  Modal,
  ActivityIndicator,
} from "react-native";
import { db,auth } from "../../firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";

export default function TeacherIstatistik() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("desc"); // varsayılan: en çok çalışan

  const sortStudents = (arr, order) => {
  return arr.sort((a, b) => 
    order === "asc" ? a.totalSeconds - b.totalSeconds : b.totalSeconds - a.totalSeconds
  );
};
  // yardımcı: saniyeyi saate (ondalık, 2 basamak) çevir
  const secondsToHours = (secs) => Math.round((secs / 3600) * 100) / 100;

  // yardımcı: saniyeyi hh:mm:ss stringine çevir
  const formatHMS = (secs) => {
    const s = Math.floor(secs % 60);
    const m = Math.floor((secs / 60) % 60);
    const h = Math.floor(secs / 3600);
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };
  
  useEffect(() => {
  const fetchStats = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // 1️⃣ Öğretmen bilgisini al
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return console.log("Öğretmen bulunamadı");
      const teacherData = docSnap.data();
      if (!teacherData.schoolName) return console.log("Öğretmenin schoolName bilgisi yok!");

      // 2️⃣ Aynı okul öğrencilerini al
      const studentsSnap = await getDocs(
        query(collection(db, "users"), 
              where("role", "==", "öğrenci"), 
              where("schoolName", "==", teacherData.schoolName))
      );
      const studentIds = studentsSnap.docs.map(d => d.id);

      // 3️⃣ studentSubjects'i çek ve sadece bu öğrencilere ait olanları filtrele
      const snap = await getDocs(collection(db, "studentSubjects"));
      const raw = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(item => studentIds.includes(item.studentId));

     
      const grouped = {};
      raw.forEach(item => {
        const studentId = item.studentId;
        let seconds = typeof item.sure === "number" ? item.sure : 0;
        const ders = item.dersAdi || "Bilinmeyen";

        if (!grouped[studentId]) grouped[studentId] = { studentId, totalSeconds: 0, subjects: {} };
        grouped[studentId].totalSeconds += seconds;
        grouped[studentId].subjects[ders] = (grouped[studentId].subjects[ders] || 0) + seconds;
      });

      let studentsArr = Object.values(grouped).map(s => ({
        studentId: s.studentId,
        totalSeconds: s.totalSeconds,
        totalHours: secondsToHours(s.totalSeconds),
        totalHMS: formatHMS(Math.round(s.totalSeconds)),
        subjects: Object.keys(s.subjects).map(k => ({
          subject: k,
          seconds: s.subjects[k],
          hours: secondsToHours(s.subjects[k]),
          hms: formatHMS(Math.round(s.subjects[k])),
        })).sort((a,b)=>b.seconds-a.seconds),
        name: null,
      }));

      studentsArr = sortStudents(studentsArr, sortOrder);

      // 4️⃣ users koleksiyonundan isimleri çek
      const withNames = await Promise.all(
        studentsArr.map(async st => {
          try {
            const userDoc = await getDoc(doc(db, "users", st.studentId));
            st.name = userDoc.exists() ? (userDoc.data().name || st.studentId.slice(0,6)) : st.studentId.slice(0,6);
          } catch {
            st.name = st.studentId.slice(0,6);
          }
          return st;
        })
      );

      setStudents(withNames);

    } catch (err) {
      console.error("İstatistik çekme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchStats();
}, []);


  const handlePress = (student) => {
    setSelectedStudent(student);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
  <Text style={styles.studentBox}>✍🏻 Öğrenci Çalışma Süreleri</Text>
  
  <Picker
    selectedValue={sortOrder}
    style={{ height: 80, width: 160 }}
    onValueChange={(value) => {
      setSortOrder(value);
      setStudents((prev) => sortStudents([...prev], value)); // yeniden sırala
    }}
  >
    <Picker.Item label=" 🔝 En Çok Çalışan" value="desc" />
    <Picker.Item label=" 🔚 En Az Çalışan" value="asc" />
  </Picker>
</View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.studentId}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.studentBox} onPress={() => handlePress(item)}>
            <Text style={styles.studentName}>
              {index + 1}. 🧑‍🎓{item.name} —  🕰️ {item.totalHours} saat ({item.totalHMS})
            </Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedStudent && (
              <>
                <Text style={styles.modalTitle}>🧑‍🎓{selectedStudent.name}</Text>
                <Text style={{ marginBottom: 6 }}>
                  Toplam:🕰️ {selectedStudent.totalHours} saat ({selectedStudent.totalHMS})
                </Text>

                {/* Dersleri 1., 2., 3. şeklinde ve yanında saat/hh:mm:ss göster */}
                {selectedStudent.subjects.length === 0 && <Text>Ders bilgisi yok</Text>}
                {selectedStudent.subjects.map((s, i) => (
                  <Text key={i} style={{ marginVertical: 3 }}>
                    {i + 1}.📘 {s.subject} → 🕰️{s.hours} saat ({s.hms})
                  </Text>
                ))}
              </>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={{ color: "white" }}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16,marginTop:20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  studentBox: { padding: 14, backgroundColor: "#f1f1f1", marginBottom: 8, borderRadius: 10 ,fontSize:16,fontWeight:"600",textDecorationLine:"underline"},
  studentName: { fontSize: 16, fontWeight: "600" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.45)" },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 12, width: "85%" },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  closeBtn: { marginTop: 12, backgroundColor: "#e74c3c", padding: 10, borderRadius: 8, alignItems: "center" },
});
  