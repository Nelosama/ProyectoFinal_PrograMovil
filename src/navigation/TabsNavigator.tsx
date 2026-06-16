import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

import HomeScreen from '../screens/HomeScreen';
import VisitorsScreen from '../screens/VisitorsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScanQRScreen from '../screens/ScanQRScreen';
import QueueScreen from '../screens/QueueScreen';
import GraphScreen from '../screens/GraphScreen';

export type TabParamList = {
  Home: undefined;
  Visitors: undefined;
  History: undefined;
  Profile: undefined;
  ScanQR: undefined;
  Queue: undefined;
  Graph: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabsNavigator = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ size }) => {
          const icons: Record<string, string> = {
            Home: '🏠',
            Visitors: '👤',
            History: '📋',
            Profile: '⚙️',
            ScanQR: '📷',
            Queue: '⏳',
            Graph: '🗺️',
          };
          return <Text style={{ fontSize: size - 4 }}>{icons[route.name]}</Text>;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          paddingBottom: 6,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('welcome') }} />

      {/* Residentes y Admin ven visitantes */}
      {(profile?.role === 'residente' || profile?.role === 'admin') && (
        <Tab.Screen name="Visitors" component={VisitorsScreen} options={{ title: t('visitors') }} />
      )}

      {/* Guardias y Admin ven el escáner QR en tabs */}
      {(profile?.role === 'guardia' || profile?.role === 'admin') && (
        <>
          <Tab.Screen name="ScanQR" component={ScanQRScreen} options={{ title: t('scanQR') }} />
          <Tab.Screen name="Queue" component={QueueScreen} options={{ title: 'Cola' }} />
        </>
      )}

      <Tab.Screen name="Graph" component={GraphScreen} options={{ title: 'Mapa' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: t('visitHistory') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('profile') }} />
    </Tab.Navigator>
  );
};

export default TabsNavigator;