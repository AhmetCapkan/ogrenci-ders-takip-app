import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebaseConfig';
import { collection, query, where, getDocs , doc , getDoc , addDoc ,  serverTimestamp} from 'firebase/firestore'
import { TextInput } from 'react-native-gesture-handler';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
const Stack = createNativeStackNavigator();

export default function TeacherHome() {
  const navigation = useNavigation();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [showSubjects, setShowSubjects] = useState(false);
  const [subjectsModalVisible, setSubjectsModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [homeworkModalVisible, setHomeworkModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [homeworkTopic, setHomeworkTopic] = useState("");
  const [homeworkTime, setHomeworkTime] = useState("");

  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");



  const sendMessage = async (receiverId, messageText) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    await addDoc(collection(db, "messages"), {
      text: messageText,
      senderId: currentUser.uid,
      receiverId: receiverId,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.log("Mesaj gönderme hatası:", error);
  }
};  

const saveHomework = async () => {  
  if (!selectedStudent || !selectedSubject || !homeworkTopic || !hour || !minute) {
    alert("Lütfen tüm bilgileri doldurun!");
    return;
  }

  const formattedTime = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

  try {
    await addDoc(collection(db, "homeworks"), {
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.dersAdi,
      topic: homeworkTopic,
      studyTime: formattedTime,      
      teacherId: userData?.uid || null,
      teacherName: userData?.name || null,
      createdAt: serverTimestamp(),
    });

    console.log("Ödev başarıyla kaydedildi");
    setHomeworkModalVisible(false);
    setHomeworkTopic("");
    setHour("");
    setMinute("");
    alert("Ödev Gönderildi");
  } catch (err) {
    console.error("Ödev kaydetme hatası:", err);
  }
};

  const validateTime = (time) => {
  // HH:MM kontrolü (00-23 saat, 00-59 dakika)
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
};

  const fetchStudentSubjects = async (studentId) => {
  try {
    const q = query(
      collection(db, "studentSubjects"),
      where("studentId", "==", studentId)
    );
    const querySnapshot = await getDocs(q);

    const list = querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setStudentSubjects(list);
    setShowSubjects(true);
  } catch (err) {
    console.error("Ders çekme hatası:", err);
  }
};

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
  // Firestore'dan sadece "role = student" olanları çek
  useEffect(() => {
  const fetchData = async () => {
    try {
      // Önce öğretmen bilgisini al
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log("Öğretmen bulunamadı");
        return;
      }

      const data = docSnap.data();
      setUserData(data);

      // Öğretmenin okul adı varsa öğrencileri çek
      if (data.schoolName) {
        const q = query(
          collection(db, "users"),
          where("role", "==", "öğrenci"),
          where("schoolName", "==", data.schoolName)
        );
        const querySnapshot = await getDocs(q);

        const list = querySnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setStudents(list);
      } else {
        console.log("Öğretmenin okulAdi bilgisi yok!");
      }
    } catch (err) {
      console.error("Veri çekme hatası:", err);
    }
  };

  fetchData();
}, []);

  const handlePress = (student) => {
    setSelectedStudent(student);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.studentBox} 
            onPress={() => handlePress(item)}
          >
            <Text style={styles.studentName}>🧑‍🎓 {item.name}   {item.surname}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedStudent && (
              <>
                <Text style={styles.modalTitle}>{selectedStudent.name}</Text>

                {/* 3 buton */}
                <TouchableOpacity style={styles.actionBtn}
                onPress={() =>{ fetchStudentSubjects(selectedStudent.id);
                setModalVisible(false);
                setSubjectsModalVisible(true);
                }
                }>
                  <Text style={styles.actionText}>📝 Ödev Ver</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} 
                onPress={()=>{
                  setModalVisible(false);
                  navigation.navigate("TeacherMessage", { student:selectedStudent })
                }}>
                  <Text style={styles.actionText}>💬 Mesaj Gönder</Text>
                </TouchableOpacity>

                
              </>
            )}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "white" }}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
  visible={subjectsModalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setSubjectsModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Ders Listesi</Text>

      {studentSubjects.length > 0 ? (
        studentSubjects.map((subj) => (
          <TouchableOpacity
            key={subj.id} 
            style={{ padding: 10, backgroundColor: "#f1f1f1", marginBottom: 8, borderRadius: 8, width: "100%" }}
          onPress={() =>{
            setSelectedSubject(subj);
            setSubjectsModalVisible(false); // dersler modalını kapat
            setHomeworkModalVisible(true);
          }}
          >
            <Text>{subj.dersAdi}</Text>
          </TouchableOpacity>  
          
        ))
      ) : (
        <Text>Bu öğrenci için ders bulunamadı.</Text>
      )}

      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => setSubjectsModalVisible(false)}
      >
        <Text style={{ color: "white" }}>Kapat</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
      {/* Ödev Modalı */}
<Modal
  visible={homeworkModalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setHomeworkModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>
        {selectedSubject ? `${selectedSubject.dersAdi} Ödevi` : "Ödev Oluştur"}
      </Text>

      <Text style={{ alignSelf: "flex-start", marginBottom: 5 }}>Ödev Konusu:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ödev konusunu giriniz"
        value={homeworkTopic}
        onChangeText={setHomeworkTopic}
      />

     <Text style={{ alignSelf: "flex-start", marginTop: 15, marginBottom: 5 }}>
  Konuyu çalışması için saat:
  </Text>

<View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
  {/* Saat */}
  <TextInput
    style={[styles.input, { flex: 1, textAlign: "center" }]}
    placeholder="HH"
    value={hour}
    onChangeText={(text) => {
      let formatted = text.replace(/[^0-9]/g, "");
      if (formatted) {
        let num = parseInt(formatted, 10);
        if (num > 23) num = 23;  // 23’ten büyük olmasın
        formatted = num.toString();
      }
      setHour(formatted);
    }}
    maxLength={2}
    keyboardType="numeric"
  />

  <Text style={{ fontSize: 20, fontWeight: "bold", marginHorizontal: 5 }}>:</Text>

  {/* Dakika */}
  <TextInput
    style={[styles.input, { flex: 1, textAlign: "center" }]}
    placeholder="MM"
    value={minute}
    onChangeText={(text) => {
      let formatted = text.replace(/[^0-9]/g, "");
      if (formatted) {
        let num = parseInt(formatted, 10);
        if (num > 59) num = 59;  // 59’dan büyük olmasın
        formatted = num.toString();
      }
      setMinute(formatted);
    }}
    maxLength={2}
    keyboardType="numeric"
  />
</View>


      <TouchableOpacity 
        style={styles.actionBtn} 
        onPress={() => {
          console.log("Ödev kaydedildi:", {
            subject: selectedSubject,
            topic: homeworkTopic,
            time: homeworkTime,
          });
          setHomeworkModalVisible(false);
          saveHomework();
        }}
      >
        <Text style={styles.actionText}>Kaydet</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => setHomeworkModalVisible(false)}
      >
        <Text style={{ color: "white" }}>Kapat</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 , marginTop:20   },
  studentBox: {
    padding: 15,
    backgroundColor: "#eee",
    marginBottom: 10,
    borderRadius: 10,
  },
  studentName: { fontSize: 16, fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  actionBtn: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    width: "100%",
    alignItems: "center",
  },
  actionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  closeBtn: {
    marginTop: 15,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
});
