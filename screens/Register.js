import { ImageBackground, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View,Image } from 'react-native'
import React from 'react' 
import { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { auth, db } from '../firebaseConfig';           // firebaseConfig
import { createUserWithEmailAndPassword } from "firebase/auth";  // Authentication fonksiyonu
import { doc, setDoc } from "firebase/firestore"; 

export default function Register({navigation}) {
  
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [isim, setIsim] = useState("");
  const [soyisim, setSoyisim] = useState("");
  const [sinif, setSinif] = useState("");
  const [okul, setokul] = useState("");
  const [open, setOpen] = useState(false);
  const [rol, setRol] = useState("öğrenci");
  const [items, setItems] = useState([
    {label: "Öğrenci", value: "öğrenci"},
    {label: "Öğretmen", value: "öğretmen"}
  ]);

  const handleRegister = async () => {
  if (!isim || !soyisim || !sinif || !email || !sifre || !okul) {
    alert("Lütfen tüm alanları doldurun!");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, sifre);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: isim.trim(),
      surname: soyisim.trim(),
      class: sinif.trim(),
      role: rol,
      email: email.trim(),
      schoolName:okul.trim(),
      createdAt: new Date()
    });

    alert("✅ Kayıt başarılı!");
    navigation.navigate("Login");
  } catch (error) {
    alert("❌ Hata: " + error.message);
  }
};

  return (
    <View style={styles.container}>
      <View>
        <Image source={require('../assets/register.png')}
        style={{width:150, height:150, marginBottom:20}}
        resizeMode="contain"
        />
      </View>
      <Text style={styles.Tittle}>Kayıt Ekranı</Text>
      <View style={styles.TextInputContainer}>
      <TextInput value={isim} onChangeText={setIsim}
      placeholder="İsim" style={styles.TextInput}></TextInput>
      <TextInput value={soyisim} onChangeText={setSoyisim}
      placeholder="Soyisim" style={styles.TextInput}></TextInput>
      <TextInput value={okul} onChangeText={setokul}
      placeholder="Okul" style={styles.TextInput}></TextInput>
      <TextInput value={sinif} onChangeText={setSinif}
      placeholder={ rol==="öğretmen" ? "Alan" : "Sınıf"} style={styles.TextInput}></TextInput>
      <TextInput value={email} onChangeText={setEmail}
      placeholder="Email" style={styles.TextInput}></TextInput>
      <TextInput value={sifre} onChangeText={setSifre}
      placeholder="Şifre" style={styles.TextInput}></TextInput>
      <DropDownPicker style={{backgroundColor:"hsla(173, 60%, 82%, 1.00)"}}
        open={open}
        value={rol}
        items={items}
        setOpen={setOpen}
        setValue={setRol}
        setItems={setItems}
        dropDownContainerStyle={{backgroundColor:"hsla(173, 60%, 82%, 1.00)"}}
      />
      </View>
      <View style={styles.butonContainer}>
      <TouchableOpacity style={[styles.buton , styles.loginButon]} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.buttonText}>Geri Dön</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.buton , styles.registerButon]} onPress={handleRegister} >
        <Text style={styles.buttonText}>Kayıt Ol</Text>
      </TouchableOpacity>
      
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
    justifyContent:'center',
    alignItems:'center',
    padding:20,
    backgroundColor:"rgba(156, 242, 242, 1)"
    },
    Tittle:{
    fontSize:26,
    fontWeight:"bold",
    marginBottom:30,
    color:"#333",
    fontFamily:  Platform.OS === 'ios' ? 'Courier' : 'serif',
    },
    TextInputContainer:{
        width:"100%",
    backgroundColor:"hsla(173, 60%, 82%, 1.00)",
    borderRadius:12,
    padding:20,
    marginBottom:20,
    elevation:3, // Android için gölge
    shadowColor:"#000", // iOS için gölge
    shadowOffset:{width:0, height:2},
    shadowOpacity:0.1,
    shadowRadius:4
    },
    TextInput:{
        borderWidth:1,
    borderColor:"#ccc",
    borderRadius:8,
    padding:12,
    marginBottom:15,
    fontSize:16
    },
    butonContainer:{
      width:'90%',
      borderRadius:20,
      alignItems:'center',
      justifyContent:'center',
      flexDirection:'row',
      padding:10,
      justifyContent:'space-between',
    },
    buton:{
    width:"40%",
    height:'80%',
    padding:15,
    borderRadius:8,
    alignItems:"center",
    marginBottom:10,
    marginVertical:1,
    marginBlock:5,
    },
    registerButon:{
         backgroundColor:"#007AFF",
    },
    loginButon:{
        backgroundColor:"#666",
    },
    buttonText:{
        color:"#fff",
        fontSize:16,
        fontWeight:"bold",
        fontFamily:"BadScript",
    }
})