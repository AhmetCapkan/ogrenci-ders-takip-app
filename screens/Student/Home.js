import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet , TouchableOpacity, Modal ,ScrollView ,ImageBackground} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { TextInput } from 'react-native-gesture-handler';
import { useWindowDimensions } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { auth, db } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';


export default function StopwatchScreen({ resetHideTimer }) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const hideTimerRef = useRef(null);

  const { height, width } = useWindowDimensions();
  const isPortrait = height > width;

  const [mode, setMode] = useState("stopwatch"); 
  const [countdown, setCountdown] = useState(0);
  const [initialCountdown, setInitialCountdown] = useState(0);
  const [now, setNow] = useState(new Date());  

  const [modalVisible, setmodalVisible] = useState(false);
  const [subjects, setsubjects] = useState([]);

  const [selectSubject, setselectSubject] = useState(null);

  async function saveSubjectRecord(dersAdi , sureString) {
    try{
      const sure = parseTimeToSeconds(sureString);
      await addDoc(collection(db ,"studentSubjects"),{
        studentId:auth.currentUser.uid,
        dersAdi:dersAdi,
        tarih: Timestamp.now(),
        sure: sure,
      });
      console.log("Kayıt Başarı ile Eklendi");
    }catch(e){
      console.error("Hata oluştu,Kayıt Eklenmedi");
    }
  };

  function parseTimeToSeconds(timeString){
    if (!timeString) return 0;
  const parts = timeString.split(":").map(Number);
  if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
  if (parts.length === 2) return parts[0]*60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 0;
  } 

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      console.log("Kullanıcı giriş yapmamış!");
      return;
    }

    // subjects koleksiyonundan sadece giriş yapan öğrencinin derslerini al
    const subjectsRef = collection(db, "subjects");
    const q = query(subjectsRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subjects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("Öğrencinin dersleri:", subjects);

      // sadece isimleri yazdırmak istersen:
      subjects.forEach(s => console.log("Ders adı:", s.name));
    }, (error) => {
      console.error("Dersleri çekerken hata:", error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let interval = null;

    if (mode === "stopwatch" && isRunning) {
      interval = setInterval(() => setTime(prev => prev + 1), 1000);
    } else if (mode === "timer" && isRunning) {
  interval = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) {
        setIsRunning(false);
        // sayaç bittiğinde kaydet
        if (selectSubject) {
          saveSubjectRecord(selectSubject, displayTime());
        }
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
}

    return () => interval && clearInterval(interval);
  }, [mode, isRunning]);

  useEffect(() => {
    if (mode === "clock") {
      setNow(new Date()); // hemen güncelle
      const clockInterval = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(clockInterval);
    }
  }, [mode]);


  const handleUserTouch = () => {
    setShowButtons(true);
    resetHideTimer(); // Navbar timer reset
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    hideTimerRef.current = setTimeout(() => setShowButtons(false), 20000);
  };

  const save = () =>{
    
  };
  
  const displayTime = () => {
    if (mode === "stopwatch") {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  } 
  else if (mode === "timer") {
    const h = Math.floor(countdown / 3600);
    const m = Math.floor((countdown % 3600) / 60);
    const s = countdown % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  } 
  else { // clock modu
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  };
  
  const selectMode = (m) => {
    setMode(m);
    setIsRunning(false);
    if (m === "stopwatch") setTime(0);
    if (m === "timer") {
      setCountdown(initialCountdown); // sayaç ilk değerden başlasın
    }
  };

  const setTimerValues = (h, m, s) => {
    const totalSeconds = h * 3600 + m * 60 + s;
    setInitialCountdown(totalSeconds);
    setCountdown(totalSeconds);
  };

  useEffect(() => {
  const q = query(
    collection(db, "subjects"),
    where("userId", "==", auth.currentUser.uid)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    setsubjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
  return unsubscribe;
}, []);

  return (
    <ImageBackground
      source={require('../../assets/motivation7.jpg')}
      style={{flex: 1}}
      resizeMode="contain"
    >
    <View
      style={styles.container}
      onStartShouldSetResponder={() => true}
      onResponderGrant={handleUserTouch} // tüm ekran dokunmalarını yakala
      
    >
      {/* Mod Seçenekleri */}
      {showButtons && (
  <View style={styles.modeContainer}>

    {/* Kronometre */}
    <TouchableOpacity
      onPress={() => { setMode("stopwatch"); setIsRunning(false); }}
      style={[
        styles.modeButton,
        mode === "stopwatch" && styles.activeModeButton
      ]}
    >
      <Text style={[
        styles.modeText,
        mode === "stopwatch" && styles.activeModeText
      ]}>
        Kronometre
      </Text>
    </TouchableOpacity>

    {/* Sayaç */}
    <TouchableOpacity
      onPress={() => { setMode("timer"); setIsRunning(false); }}
      style={[
        styles.modeButton,
        mode === "timer" && styles.activeModeButton
      ]}
    >
      <Text style={[
        styles.modeText,
        mode === "timer" && styles.activeModeText
      ]}>
        Sayaç
      </Text>
    </TouchableOpacity>

    {/* Saat */}
    <TouchableOpacity
      onPress={() => setMode("clock")}
      style={[
        styles.modeButton,
        mode === "clock" && styles.activeModeButton
      ]}
    >
      <Text style={[
        styles.modeText,
        mode === "clock" && styles.activeModeText
      ]}>
        Saat
      </Text>
    </TouchableOpacity>

  </View>
)}

      {/* Sayaç modunda saat/dk/sn giriş alanları */}
      {mode === "timer" && showButtons && !isRunning && (
        <View style={styles.inputContainer}>
          <TextInput style={[styles.input , {width: isPortrait ? 40 : 50 }]} keyboardType="numeric" placeholder="Saat"
            onChangeText={(v) => setTimerValues(Number(v)||0, Math.floor(initialCountdown/60)%60, initialCountdown%60)} />
          <TextInput style={[styles.input , {width: isPortrait ? 40 : 50 }]} keyboardType="numeric" placeholder="Dakika"
            onChangeText={(v) => setTimerValues(Math.floor(initialCountdown/3600), Number(v)||0, initialCountdown%60)} />
          <TextInput style={[styles.input , {width: isPortrait ? 40 : 50 }]} keyboardType="numeric" placeholder="Saniye"
            onChangeText={(v) => setTimerValues(Math.floor(initialCountdown/3600), Math.floor(initialCountdown/60)%60, Number(v)||0)} />
        </View>
      )
      }
      
      {/* Ortadaki zaman */}
      <Text style={[styles.timeText , {fontSize:RFPercentage(isPortrait ? 12 : 15)}]} >{displayTime()}</Text>
      
      {showButtons && mode !== "clock" && (
  <View style={styles.buttonContainer}>
    <Button title={isRunning ? "Durdur" : "Başlat"} onPress={() =>{
    if(mode === "timer" && !isRunning){
      setmodalVisible(true);
    }else{
      setIsRunning(!isRunning)} 
    }}/>
    
    {mode === "stopwatch" && (
      <Button title="Kaydet" onPress={() => setmodalVisible(true)} />
    )}

    <Button title="Sıfırla" onPress={() => {
      setIsRunning(false); 
      if (mode === "stopwatch") setTime(0);
      if (mode === "timer") setCountdown(0);
    }} />
  </View>
)}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setmodalVisible(false)}>
        <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Derslerini Seç</Text>

      <ScrollView>
        {subjects.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.subjectItem} 
            onPress={() => {
              console.log("Seçilen ders:", item.name);
              setselectSubject(item.name);
              setIsRunning(true);
              saveSubjectRecord(item.name,displayTime());
              setmodalVisible(false);
            }}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity onPress={() => setmodalVisible(false)} style={styles.closeButton}>
        <Text style={styles.closeText}>Kapat</Text>
      </TouchableOpacity>
        </View>
        </View>  
      </Modal>
    
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
   // backgroundColor:'#f5f5f5',
    },
  timeText: {
    fontWeight:'bold',
    marginBottom:40 ,
    flexShrink: 1,
  },

  buttonContainer: {
     flexDirection:'row', 
     justifyContent:'space-between', 
     width:'80%', 
     },
  modeContainer: {
    flexDirection: "row",
  justifyContent: "center",
  marginBottom: 20,
  },
  modeText: {
    fontSize: 14,
  fontWeight: "600",
  color: "#333",
  },
  activeMode: {
    color: "blue",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  inputContainer:{
    flexDirection:"row",
    marginBottom:20,
  },
  input:{
    borderWidth:1,
    borderColor:"#ccc",
    padding:5,
    textAlign:"center",
    marginHorizontal:15,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // saydam arka plan
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  subjectItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
  },   
  modeButton: {
  width: 90,
  height: 90,
  borderRadius: 45,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 3,
  borderColor: "#555",
  marginHorizontal: 10,
},
activeModeButton: {
  backgroundColor: "#4A90E2",
  borderColor: "#4A90E2",
},
});
