import { StyleSheet, Text, View, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native'
import React ,{useEffect, useState} from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { db, auth } from "../../firebaseConfig";
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, getDocs} from "firebase/firestore";
import { Picker } from '@react-native-picker/picker';

export default function Istatistik({navigation}) {

  const [modalVisible, setModalVisible] = useState(false);
  const [modalDeleteVisible, setmodalDeleteVisible] = useState(false)
  const [inputText, setInputText] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setselectedSubject] = useState(null);
  const [sortOption, setSortOption] = useState("most"); 

  const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const hh = h < 10 ? `0${h}` : h;
  const mm = m < 10 ? `0${m}` : m;
  const ss = s < 10 ? `0${s}` : s;

  return `${hh}:${mm}:${ss}`;
};
  useEffect(() => {
  setSubjects(prev => {
    const sorted = [...prev];
    if (sortOption === "most") {
      sorted.sort((a, b) => (b.studyTime || 0) - (a.studyTime || 0));
    } else if (sortOption === "least") {
      sorted.sort((a, b) => (a.studyTime || 0) - (b.studyTime || 0));
    }
    return sorted;
  });
}, [sortOption]);
  useEffect(() => {
  if (sortOption === "most") {
    setSubjects(prev => [...prev].sort((a, b) => (b.studyCount || 0) - (a.studyCount || 0)));
  } else if (sortOption === "least") {
    setSubjects(prev => [...prev].sort((a, b) => (a.studyCount || 0) - (b.studyCount || 0)));
  }
}, [sortOption]);

  useEffect(() => {
  if (!auth.currentUser) return;

  const q = query(
    collection(db, "subjects"),
    where("userId", "==", auth.currentUser.uid)
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const subjectsList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 🔹 Her ders için studies koleksiyonundan toplam süreyi çek
    const withTimes = await Promise.all(
      subjectsList.map(async (subject) => {
        const studiesQuery = query(
          collection(db, "studentSubjects"), // ders çalışmaları buradaysa
          where("studentId", "==", auth.currentUser.uid),
          where("dersAdi", "==", subject.name)
        );

        let totalTime = 0;
        const snap = await getDocs(studiesQuery);
        snap.forEach(s => {
          totalTime += s.data().sure || 0;
        });

        return { ...subject, studyTime: totalTime };
      })
    );

    setSubjects(withTimes);
  });

  return () => unsubscribe();
}, []); 

  const addSubject = async (name) => {
  try {
    await addDoc(collection(db, "subjects"), {
      name: name,
      userId: auth.currentUser.uid,   
    });
    console.log(" Ders eklendi:", name);
  } catch (error) {
    console.error(" Ders eklenemedi:", error);
  }
};

  const deleteSubject = async (id) => {
  try {
    await deleteDoc(doc(db, "subjects", id));
    console.log(" Ders silindi:", id);
  } catch (error) {
    console.error(" Ders silinemedi:", error);
  }
};
    
  return (
    <View style={styles.container}>

      <View style={styles.header}>
  <Text style={styles.title}>👤 Ders Bilgileri</Text>

  <View style={styles.headerRight}>
    
    <Picker
      prompt='〽️ Sırala'
      selectedValue={sortOption}
      style={styles.dropdown}
      onValueChange={(itemValue) => setSortOption(itemValue)}        
    >
      
      <Picker.Item label="↘️  Çoktan Aza" value="most" />
      <Picker.Item label="↗️  Azdan Çoka" value="least" />
      
    </Picker> 

    <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
      <MaterialCommunityIcons name="plus" size={24} color="black" />
    </TouchableOpacity>
  </View>
</View>
      
        
      <ScrollView style={{flex:1}}>
        {subjects.map((subject)=>(
          <TouchableOpacity key={subject.id} onPress={() => navigation.navigate("LessonDetails" ,{subject})}
           onLongPress={() => {setselectedSubject(subject);  setmodalDeleteVisible(true); }}>
      <View key={subject.id} style={styles.card}>
        <Text style={styles.label}>İsim</Text>
        <Text style={styles.value}>📘{subject.name}</Text>

        <Text style={styles.label}>Toplam Çalışma Süresi</Text>
        <Text style={styles.value}>{formatTime(subject.studyTime || 0)}</Text>
      </View>
      </TouchableOpacity>
      ))}
      </ScrollView>
      
    <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Yeni Ders Ekle</Text>
            
            <TextInput
              style={styles.input}
              onChangeText={setInputText}
              value={inputText}
              placeholder="Buraya yazın..."
              placeholderTextColor="#999"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyle}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.buttonAdd]}
                onPress={() => {
                  console.log("Eklenen metin:", inputText);
                  addSubject(inputText);
                  setModalVisible(!modalVisible);
                  setInputText('');
                }}
              >
                <Text style={styles.textStyle}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    <Modal
        animationType="slide"
        transparent={true}
        visible={modalDeleteVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Ders Silinsin Mi ?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => {
                  if (selectedSubject) {
                   deleteSubject(selectedSubject.id);} // 🔹 seçilen dersi sil
                   setmodalDeleteVisible(false);  }} >
                <Text style={styles.textStyle}>Sil</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.buttonAdd]}
                onPress={() => {
                  console.log("Eklenen metin:", inputText);
                  setmodalDeleteVisible(!modalDeleteVisible);
                }}
              >
                <Text style={styles.textStyle}>Vazgeç</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#eef2f7",
    marginTop:20,
  },
  header:{
    flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
  },
  headerRight: {
  flexDirection: "row",
  alignItems: "center",
  },
  title: {
    fontSize: 22,
  fontWeight: "bold",
  color: "#333",
  },
  dropdown: {
  height: 50,
  width: 120,
  backgroundColor: "#fff",
  borderRadius: 38,
  marginRight: 15,   // 🔹 butonla araya boşluk
  paddingLeft: 8,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 3,
  elevation: 2,
  color:'#000',
  fontSize:4,
},
  addButton:{
    padding: 8,
  borderRadius: 20,
  backgroundColor: '#fff',
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 3,
  elevation: 2, 

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
},
 centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    minWidth: 100,
  },
  buttonCancel: {
    backgroundColor: "#e74c3c",
  },
  buttonAdd: {
    backgroundColor: "#2ecc71",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },   
})