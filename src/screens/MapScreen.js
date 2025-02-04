import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { FontAwesome5 } from '@expo/vector-icons';
import { borders, colors, display, paddings } from '../assets/css/primeflex';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data;
    Location.EventEmitter.emit('locationUpdate', locations[0].coords);
  }
});

const haversine = (coord1, coord2) => {
  const R = 6371;
  const dLat = (coord2.latitude - coord1.latitude) * (Math.PI / 180);
  const dLon = (coord2.longitude - coord1.longitude) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.latitude * (Math.PI / 180)) *
    Math.cos(coord2.latitude * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [pathCoordinates, setPathCoordinates] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const mapRef = useRef(null);
  const trackingRef = useRef(tracking);

  useEffect(() => {
    trackingRef.current = tracking;
  }, [tracking]);

  useEffect(() => {
    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(currentLocation.coords);
    };

    fetchLocation();
    const unsubscribe = navigation.addListener('focus', fetchLocation);

    return () => unsubscribe();
  }, [navigation]);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('mapTheme');
        if (savedTheme !== null) {
          setIsDarkTheme(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Erro ao carregar o tema:', error);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    const handleLocationUpdate = (newLocation) => {
      setLocation(newLocation);

      if (trackingRef.current) {
        setPathCoordinates(prev => {
          const newPoint = {
            latitude: newLocation.latitude,
            longitude: newLocation.longitude
          };

          if (prev.length > 0) {
            const lastCoord = prev[prev.length - 1];
            const distance = haversine(lastCoord, newPoint);
            setTotalDistance(prevDist => prevDist + distance);
          }

          return [...prev, newPoint];
        });

        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }, 1000);
        }
      }
    };

    const subscription = Location.EventEmitter.addListener('locationUpdate', handleLocationUpdate);
    return () => subscription.remove();
  }, []);

  const startTracking = async () => {
    setTracking(true);
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000,
      distanceInterval: 1,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Rastreamento Ativo',
        notificationBody: 'Sua rota está sendo registrada',
      },
    });
  };

  const stopTracking = async () => {
    setTracking(false);
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);

    const data = {
      pathCoordinates,
      totalDistance
    }

    setPathCoordinates([]);
    setTotalDistance(0);
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkTheme;
      setIsDarkTheme(newTheme);
      await AsyncStorage.setItem('mapTheme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Erro ao salvar o tema:', error);
    }
  };

  if (errorMsg) {
    return <View style={styles.container}><Text>{errorMsg}</Text></View>;
  }

  if (!location) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#0000ff" /></View>;
  }

  const darkStyle = [
    { elementType: 'geometry', stylers: [{ color: '#212121' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#303030' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181818' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#383838' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212121' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#484848' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] }
  ];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        customMapStyle={isDarkTheme ? darkStyle : []}
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude
          }}
          tracksViewChanges={false}
        >
          <View style={styles.marker}>
            <FontAwesome5 name="map-marker-alt" size={30} color={colors.red['500']} />
          </View>
        </Marker>

        <Polyline
          coordinates={pathCoordinates}
          strokeColor={colors.blue['500']}
          strokeWidth={4}
        />
      </MapView>

      <View style={[styles.distanceContainer, display.row, display.justifyContentBetween]}>
        <Text style={styles.distanceText}>
          Distância: {totalDistance.toFixed(2)} km
        </Text>
        <TouchableOpacity style={styles.button} onPress={toggleTheme}>
          <FontAwesome5
            name={isDarkTheme ? 'sun' : 'moon'}
            size={20}
            color="#000"
            style={{ marginRight: 5 }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[paddings[4], borders.borderCircle, display.flex, display.alignItemsCenter,
          display.justifyContentCenter, { backgroundColor: tracking ? colors.red['500'] : colors.blue['500'] }]}
          onPress={tracking ? stopTracking : startTracking}
        >
          <FontAwesome5
            name={tracking ? 'stop-circle' : 'play-circle'}
            size={35}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1
  },
  marker: {
    padding: 2,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  distanceContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 999,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});