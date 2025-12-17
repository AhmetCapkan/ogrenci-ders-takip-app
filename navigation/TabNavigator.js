import React, { useEffect, useState, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as NavigationBar from "expo-navigation-bar";

import StopwatchScreen from "../screens/Student/Home";
import Istatistik from "../screens/Student/Istatistik";
import Profil from "../screens/Student/Profil";
import Octicons from "@expo/vector-icons/Octicons";
import Foundation from "@expo/vector-icons/Foundation";
import Entypo from "@expo/vector-icons/Entypo";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const [showTabBar, setShowTabBar] = useState(true);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");
  }, []);

  // Navbar gizleme timer’ı
  const resetHideTimer = () => {
    setShowTabBar(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    hideTimerRef.current = setTimeout(() => {
      setShowTabBar(false);
    }, 20000); // 20 saniye sonra gizle
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { display: showTabBar ? "flex" : "none" },
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
      <Tab.Screen name="Home">
        {(props) => <StopwatchScreen {...props} resetHideTimer={resetHideTimer} />}
      </Tab.Screen>
      <Tab.Screen name="İstatistik">
        {(props) => <Istatistik {...props} resetHideTimer={resetHideTimer} />}
      </Tab.Screen>
      <Tab.Screen name="Profil">
        {(props) => <Profil {...props} resetHideTimer={resetHideTimer} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
