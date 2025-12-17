import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";


// Ekranlar
import Index from "./screens/IndexScreen";
import Login from "./screens/Login";
import TabNavigator from "./navigation/TabNavigator"; // ayrı dosya
import TeacherTabs from "./navigation/TeacherTabs"; 
import Register from "./screens/Register";
import StudentInbox from "./screens/Student/StudentInBox";
import ChatScreen from "./screens/Student/ChatScreen";
import LessonDetails from "./screens/Student/LessonDetails";
import Homework from "./screens/Student/Homework";
import TeacherHomeworkBox from "./screens/Teacher/TeacherHomeworkBox";
import { useFonts } from "expo-font";
import { useFonts as useBadScriptFonts, BadScript_400Regular } from '@expo-google-fonts/bad-script'
import { useCallback } from "react";
const Stack = createNativeStackNavigator();

export default function App() {

  const [badScriptLoaded] = useBadScriptFonts({
    BadScript_400Regular,
  });
  const onLayoutRootView = useCallback(async () => {
    if (badScriptLoaded) {
      await SplashScreen.hideAsync(); //only do this if you have SplashScreen, else Skip
    }
  }, [badScriptLoaded]);

  
  const [role, setRole] = useState(null);
  
  const [fontsLoaded] = useFonts({
    BadScript: require("./assets/fonts/BadScript-Regular.ttf"), 
  });
  if(!fontsLoaded){
    console.log("Fonts Yüklenemedi");
  }
  
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setRole(userSnap.data().role); // "student" veya "teacher"
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);
  if (!badScriptLoaded) {
    return null;
  }
  return (
    <GestureHandlerRootView style={{flex:1}}>
    <NavigationContainer>
     <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        /> 
        <Stack.Screen name="Register" component={Register} options={{headerShown:false}}></Stack.Screen>
        <Stack.Screen
          name="MainApp"
          component={role ==="öğretmen" ?TeacherTabs:TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="LessonDetails" component={LessonDetails} options={{headerShown:false}} ></Stack.Screen>
        <Stack.Screen name="Inbox"  component={StudentInbox}  options={{ headerShown: false }}/>
        <Stack.Screen  name="Chat"  component={ChatScreen}  options={{ headerShown: false }}/>
        <Stack.Screen name="Homework" component={Homework} options={{headerShown:false}} />
        <Stack.Screen name="TeacherHomeworkBox" component={TeacherHomeworkBox} options={{headerShown:false}}/>
      </Stack.Navigator>
    </NavigationContainer> 
    </GestureHandlerRootView> 
  );
}
