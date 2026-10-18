import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BookingDiscoveryScreen from '../screens/BookingDiscoveryScreen';
import RoomDetailScreen from '../screens/RoomDetailScreen';
import { COLORS, TYPOGRAPHY } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Placeholder screens for other tabs
const DiscoveryPlaceholder = () => (
  <View style={styles.centerScreen}>
    <Text style={styles.placeholderEmoji}>🌍</Text>
    <Text style={styles.placeholderTitle}>Khám phá điểm đến</Text>
    <Text style={styles.placeholderSubtitle}>Tính năng đang được phát triển</Text>
  </View>
);

const ItineraryPlaceholder = () => (
  <View style={styles.centerScreen}>
    <Text style={styles.placeholderEmoji}>🗺️</Text>
    <Text style={styles.placeholderTitle}>Lịch trình du lịch</Text>
    <Text style={styles.placeholderSubtitle}>Lập kế hoạch chuyến đi thông minh với AI</Text>
  </View>
);

const AccountPlaceholder = () => (
  <View style={styles.centerScreen}>
    <Text style={styles.placeholderEmoji}>👤</Text>
    <Text style={styles.placeholderTitle}>Tài khoản & Cài đặt</Text>
    <Text style={styles.placeholderSubtitle}>Quản lý thông tin cá nhân và đơn đặt phòng</Text>
  </View>
);

// Bottom Tab Navigator (4 tabs theo thiết kế Figma Node 29:1190)
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Booking"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00685F', // Deep Teal
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName = 'compass-outline';
          if (route.name === 'Discovery') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Booking') {
            iconName = focused ? 'bed' : 'bed-outline';
          } else if (route.name === 'Itinerary') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Discovery"
        component={DiscoveryPlaceholder}
        options={{ tabBarLabel: 'Khám phá' }}
      />
      <Tab.Screen
        name="Booking"
        component={BookingDiscoveryScreen}
        options={{ tabBarLabel: 'Đặt phòng' }}
      />
      <Tab.Screen
        name="Itinerary"
        component={ItineraryPlaceholder}
        options={{ tabBarLabel: 'Lịch trình' }}
      />
      <Tab.Screen
        name="Account"
        component={AccountPlaceholder}
        options={{ tabBarLabel: 'Tài khoản' }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen
          name="RoomDetail"
          component={RoomDetailScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.screenBg,
    padding: 24,
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: TYPOGRAPHY.sizes.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.textBody,
    textAlign: 'center',
  },
});

export default AppNavigator;
