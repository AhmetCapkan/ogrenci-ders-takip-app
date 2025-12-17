import { StyleSheet } from 'react-native';
import React, { useState, useRef, useEffect } from "react"; // 🔹 eksikler eklendi
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as NavigationBar from "expo-navigation-bar";

import TeacherHome from '../screens/Teacher/TeacherHome';
import TeacherIstatistik from '../screens/Teacher/TeacherIstatistik';
import TeacherProfil from '../screens/Teacher/TeacherProfil';
import Octicons from "@expo/vector-icons/Octicons";
import Foundation from "@expo/vector-icons/Foundation";
import Entypo from "@expo/vector-icons/Entypo";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TeacherMessageScreen from "../screens/Teacher/TeacherMessageScreen";


const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="TeacherHome" 
        options={{ headerShown: false }}
      >
        {(props) => <TeacherHome {...props}/>}
      </HomeStack.Screen>
      <HomeStack.Screen 
        name="TeacherMessage" 
        component={TeacherMessageScreen} 
        options={{ headerShown: false }} 
      />
    </HomeStack.Navigator>
  );
}
export default function TeacherTabs() {
  
  

  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");
  }, []);

  // Navbar gizleme timer’ı
  

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { display: "flex"},
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Home") {
            return <Octicons name="clock" size={size} color={color} />;
          } else if (route.name === "İstatistik") {
            return <Foundation name="list-number" size={size} color={color} />;
          } else if (route.name === "Profil") {
            return <Entypo name="user" size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" options={{ tabBarLabel: "Home" }}>
        {(props) => <HomeStackScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen name="İstatistik">
        {(props) => <TeacherIstatistik {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Profil">
        {(props) => <TeacherProfil {...props} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({})  