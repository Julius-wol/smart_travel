import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import BookingDiscoveryScreen from '../screens/BookingDiscoveryScreen';
import RoomDetailScreen from '../screens/RoomDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import HomeDetailsScreen from '../screens/HomeDetailsScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import BookingSuccessScreen from '../screens/BookingSuccessScreen';
import WriteReviewScreen from '../screens/WriteReviewScreen';
import HostCalendarScreen from '../screens/HostCalendarScreen';
import HostDashboardScreen from '../screens/HostDashboardScreen';
import HostRoomInventoryScreen from '../screens/HostRoomInventoryScreen';
import HostRoomFormScreen from '../screens/HostRoomFormScreen';
import { COLORS, TYPOGRAPHY } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Placeholder screens for other tabs
const ItineraryPlaceholder = () => (
  <View style={styles.centerScreen}>
    <Text style={styles.placeholderEmoji}>🗺️</Text>
    <Text style={styles.placeholderTitle}>Lịch trình du lịch</Text>
    <Text style={styles.placeholderSubtitle}>Lập kế hoạch chuyến đi thông minh với AI</Text>
  </View>
);

// Bottom Tab Navigator (4 tabs theo thiết kế Figma)
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Booking"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00685F', // Deep Teal
        tabBarInactiveTintColor: '#475569',
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
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }

          return <Ionicons name={iconName} size={23} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Discovery"
        component={HomeScreen}
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
        component={ProfileScreen}
        options={{ tabBarLabel: 'Tài khoản' }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
export const AppNavigator = ({ initialRouteName = 'Login' }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="HomeDetails" component={HomeDetailsScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
        <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="BookingDiscovery" component={BookingDiscoveryScreen} />
        <Stack.Screen
          name="RoomDetail"
          component={RoomDetailScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="HostCalendar"
          component={HostCalendarScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="HostDashboard"
          component={HostDashboardScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="HostRoomInventory"
          component={HostRoomInventoryScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="HostRoomForm"
          component={HostRoomFormScreen}
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
