import { StyleSheet, Text, TextInput, TouchableOpacity, View ,Alert ,ImageBackground, Platform } from 'react-native'
import React, { useState } from 'react'
import { auth } from '../firebaseConfig'; // Firebase config dosyan
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Image } from 'react-native';
import { useFonts } from 'expo-font';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function Login({navigation}) {

  const [email, setEmail] = useState("");
  const [sifre, setsifre] = useState("");

  
  const[fontsLoaded]= useFonts({
    Kalam: require('../assets/fonts/Kalam-Light.ttf'),
  });
  if(!fontsLoaded){
    return <View><Text>Font Yükleniyor...</Text></View>
  } 
    const handleLogin = () => {
    if (!email || !sifre) {
      Alert.alert("Hata", "Email ve şifre boş olamaz!");  
      return;
    }

    signInWithEmailAndPassword(auth, email.trim(), sifre)
      .then((userCredential) => {
        // Giriş başarılı
        const user = userCredential.user;
        console.log("Giriş başarılı:", user.email);
        navigation.navigate("MainApp"); // Ana sayfaya yönlendir
      })
      .catch((error) => {
        // Hata durumları
        if (error.code === "auth/user-not-found" ) {
          Alert.alert("Hata", "Böyle bir kullanıcı bulunamadı!");
        } else if (error.code === "auth/wrong-password" ) {
          Alert.alert("Hata", "Şifre yanlış!");
        } else if (error.code === "auth/invalid-email") {
          Alert.alert("Hata", "Geçersiz email formatı!");
        }else if(error.code === "auth/too-many-requests"){          
          Alert.alert("Hata","Çok fazla giriş denemesi yaptınız.Güvenliğiniz için lütfen biraz bekleyiniz.")
        }else if(error.code ==="auth/invalid-credential"){
          Alert.alert("Hata","Email veya Şifre Hatalı");  
        }else {
          Alert.alert("Hata", error.message);
        }
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
      <Image style={styles.topImage}
       resizeMode="contain"
      source={require("../assets/login2.png")} />
      </View>
       
    {/*  <Image source={require('../assets/login.jpeg')}
      style={styles.topImage}
      resizeMode="cover" /> */}
      <Text style={styles.Tittle}>Kullanıcı Girişi</Text>
      
      
      <View style={styles.TextInputContainer}>

        <View style={styles.input}>
        <MaterialIcons name='email' size={30} > </MaterialIcons>
      <TextInput style={styles.TextInput}   placeholder="Email"  value={email} onChangeText={setEmail}></TextInput>
        </View>

        <View style={styles.input}>
          <MaterialIcons name='lock' size={30}></MaterialIcons>
          <TextInput style={styles.TextInput} secureTextEntry={true} placeholder="Şifre"  value={sifre} onChangeText={setsifre}></TextInput>
        </View>

      </View>

      <TouchableOpacity style={[styles.buton , styles.loginButon]} onPress={handleLogin}>
        <Text style={styles.buttonText} >Giriş Yap</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.buton , styles.registerButon]} onPress={() => navigation.navigate("Register")}>
        <Text style={styles.buttonText}>Kayıt Ol</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    padding:20,
    backgroundColor:"rgba(212, 231, 231, 1)", 
    paddingBottom:102,
    },
    topContainer:{
    backgroundColor: "#4e5de1",
    width: "100%",
    height: 180,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    borderColor:"#4e5de1",  
    },
    Tittle:{
    fontSize:30,
    fontWeight:"bold",
    marginBottom:30,
    color:"#333",
    fontFamily: 'Kalam', 
    },
    TextInputContainer:{
    width:"100%",
    backgroundColor:"rgba(212, 231, 231, 1)",
    borderRadius:14,
    padding:20,
    marginBottom:20,
    elevation:3, // Android için gölge
    shadowColor:"hsla(0, 0%, 0%, 1.00)", // iOS için gölge
    shadowOffset:{width:0, height:2},
    shadowOpacity:0.1,
    shadowRadius:4
    },
    TextInput:{
      flex:1,
    borderWidth:1,
    borderColor:"rgba(122, 167, 226, 0.95)",
    borderRadius:8,
    padding:12,
    marginBottom:0,
    fontSize:16,
    backgroundColor:"rgba(88, 144, 216, 0.95)",
    },
    butonContainer:{

    },
    buton:{
        width:"100%",
    padding:15,
    borderRadius:8,
    alignItems:"center",
    marginBottom:10,
    },
    registerButon:{
         backgroundColor:"#007AFF",
    },
    loginButon:{
        backgroundColor:"rgba(22, 119, 56, 1)",
    },
    buttonText:{
        color:"#efe3e3ff",
        fontSize:16,
        fontWeight:"bold",
    },
    topImage:{
      width: '100%',
      height: 200, // veya istediğin bir değer
    marginBottom: 20,
    },
    input:{
      flexDirection:'row',
      alignItems:'center',
      padding:5,
    
    },
    icon:{
      marginLeft: 10,
       marginRight: 15,
    }
})