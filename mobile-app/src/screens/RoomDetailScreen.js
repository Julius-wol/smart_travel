import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { fetchRoomDetailApi } from '../services/roomService';

// Both entry points use the same API-backed details, reviews and checkout flow.
export default function RoomDetailScreen({ route, navigation }) {
  const [error, setError] = useState('');
  const { roomId, ...params } = route.params || {};
  useEffect(() => {
    let active = true;
    if (!roomId) { setError('Không tìm thấy phòng.'); return; }
    fetchRoomDetailApi(roomId).then(response => {
      if (!active) return;
      if (!response.data) throw new Error('Không tìm thấy phòng.');
      navigation.replace('HomeDetails', { ...params, homestay: response.data });
    }).catch(failure => { if (active) setError(failure.message || 'Không thể tải phòng.'); });
    return () => { active = false; };
  }, [roomId, navigation]);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {error ? <>
        <Text>{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text>Quay lại</Text></TouchableOpacity>
      </> : <ActivityIndicator color="#00685F" />}
    </View>
  );
}
