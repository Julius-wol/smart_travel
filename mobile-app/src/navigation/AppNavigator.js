import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import ItineraryPlannerScreen from '../screens/ItineraryPlannerScreen';
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
const MainTabNavigator = ({ route, initialTab = 'Booking' }) => {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  // Reserve space for the icon, scaled label and the tab button's own padding.
  const tabBarContentHeight = Math.max(72, 56 + Math.ceil(16 * fontScale));
  const sessionParams = route?.params || {};
  return (
    <Tab.Navigator
      initialRouteName={initialTab}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00685F', // Deep Teal
        tabBarInactiveTintColor: '#475569',
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          height: tabBarContentHeight + insets.bottom,
          minHeight: tabBarContentHeight + insets.bottom,
          flexShrink: 0,
          paddingBottom: 6 + insets.bottom,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          lineHeight: 16,
          marginTop: 2,
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
        initialParams={sessionParams}
        options={{ tabBarLabel: 'Khám phá' }}
      />
      <Tab.Screen
        name="Booking"
        component={BookingDiscoveryScreen}
        initialParams={sessionParams}
        options={{ tabBarLabel: 'Đặt phòng' }}
      />
      <Tab.Screen
        name="Itinerary"
        component={ItineraryPlannerScreen}
        initialParams={sessionParams}
        options={{ tabBarLabel: 'Lịch trình' }}
      />
      <Tab.Screen
        name="Account"
        component={ProfileScreen}
        initialParams={sessionParams}
        options={{ tabBarLabel: 'Tài khoản' }}
      />
    </Tab.Navigator>
  );
};

// Legacy routes enter the shared tabs instead of opening standalone screens.
const HomeTabEntry = (props) => <MainTabNavigator {...props} initialTab="Discovery" />;
const ProfileTabEntry = (props) => <MainTabNavigator {...props} initialTab="Account" />;

// Root Stack Navigator
export const AppNavigator = ({ initialRouteName = 'Login' }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Home" component={HomeTabEntry} />
        <Stack.Screen name="HomeDetails" component={HomeDetailsScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
        <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
        <Stack.Screen name="Profile" component={ProfileTabEntry} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="BookingDiscovery" component={MainTabNavigator} />
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
          name="ItineraryPlanner"
          component={ItineraryPlannerScreen}
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
