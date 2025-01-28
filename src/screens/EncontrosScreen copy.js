import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from 'expo-location';

export default function EncontrosScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distance, setDistance] = useState(0);
  const [watchId, setWatchId] = useState(null);
  const [startPosition, setStartPosition] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialPosition = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão de localização necessária!');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      if (location.coords.latitude && location.coords.longitude) {
        setInitialRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLoading(false);
      }
    };

    loadInitialPosition();
  }, []);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleStart = async () => {
    // Resetar todos os estados para nova corrida
    const location = await Location.getCurrentPositionAsync({});
    setStartPosition(location.coords);
    setRouteCoordinates([location.coords]);
    setDistance(0);
    setIsTracking(true);

    const id = await Location.watchPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 1000,
      distanceInterval: 5,
    }, (newLocation) => {
      setRouteCoordinates(prev => {
        if (prev.length > 0) {
          const last = prev[prev.length - 1];
          const newDistance = getDistance(
            last.latitude,
            last.longitude,
            newLocation.coords.latitude,
            newLocation.coords.longitude
          );
          if (newDistance > 0.0005) {
            setDistance(prevDist => prevDist + newDistance);
          }
        }
        return [...prev, newLocation.coords];
      });
    });

    setWatchId(id);
  };

  const handleStop = () => {
    setIsTracking(false);
    setDistance(0);
    console.log(routeCoordinates)
    // setRouteCoordinates([]);
    setStartPosition(null);

    if (watchId) {
      Location.stopLocationUpdatesAsync(watchId);
      setWatchId(null);
    }
  };

  // ... (mantenha o restante do código igual até o return)

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        followsUserLocation={true}
        region={initialRegion}
      >
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#FF0000"
            strokeWidth={6}
          />
        )}
        {startPosition && (
          <Marker
            coordinate={startPosition}
            title="Início do Trajeto"
            pinColor="green"
          />
        )}
      </MapView>

      <View style={styles.controls}>
        <Text style={styles.distance}>
          Distância: {distance.toFixed(3)} km
        </Text>

        <TouchableOpacity
          style={[styles.button, isTracking && styles.stopButton]}
          onPress={isTracking ? handleStop : handleStart}
        >
          <Text style={styles.buttonText}>
            {isTracking ? 'Parar' : 'Iniciar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    height: '100%'
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    elevation: 3,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  distance: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});