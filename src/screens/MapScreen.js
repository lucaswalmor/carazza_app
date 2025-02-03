import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Button, NativeEventEmitter, NativeModules, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { FontAwesome5 } from '@expo/vector-icons'; // Importando o FontAwesome5
import { borders, colors, display, paddings } from '../assets/css/primeflex';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const LOCATION_TASK_NAME = 'background-location-task';
const eventEmitter = new NativeEventEmitter(NativeModules.UIManager);

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data;
    locations.forEach(location => {
      eventEmitter.emit('locationUpdate', location.coords);
    });
  }
});

// NOVO: Função para cálculo de distância
const haversine = (coord1, coord2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLon = (coord2.lng - coord1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
    Math.cos(coord2.lat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância em km
};

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [pathCoordinates, setPathCoordinates] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const webViewRef = useRef(null);
  const trackingRef = useRef(tracking);

  // Corrigido: Efeito separado para sincronizar a referência
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
    const handleLocationUpdate = (newLocation) => {
      setLocation(newLocation);

      // Corrigido: Usar trackingRef.current em vez de tracking
      if (webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({
            lat: newLocation.latitude,
            lng: newLocation.longitude,
            tracking: trackingRef.current
          })
        );
      }

      // Corrigido: Verificação usando a referência atualizada
      if (trackingRef.current) {
        setPathCoordinates(prev => {
          // Corrigido: Usar coordenadas do newLocation diretamente
          const newPoint = {
            lat: newLocation.latitude,
            lng: newLocation.longitude
          };

          if (prev.length > 0) {
            const lastCoord = prev[prev.length - 1];
            const distance = haversine(lastCoord, newPoint);
            setTotalDistance(prevDist => prevDist + distance);
          }
          return [...prev, newPoint];
        });
      }
    };

    const subscription = eventEmitter.addListener('locationUpdate', handleLocationUpdate);
    return () => subscription.remove();
  }, []); // Removidas dependências desnecessárias

  // Corrigido: Função totalmente reescrita para evitar estado obsoleto
  // const startTracking = async () => {
  //   setTracking(true);

  //   // 3. Iniciar atualizações de localização
  //   await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
  //     accuracy: Location.Accuracy.High,
  //     timeInterval: 1000,
  //     distanceInterval: 1,
  //     showsBackgroundLocationIndicator: true,
  //     foregroundService: {
  //       notificationTitle: 'Rastreamento Ativo',
  //       notificationBody: `Sua rota está sendo registrada ${totalDistance}`
  //     },
  //   });
  // };
  const startTracking = async () => {
    setTracking(true);

    // 1. Solicitar permissões para notificações
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permissão para notificações negada!');
    }

    // 2. Configurar canal de notificação (Android)
    await Notifications.setNotificationChannelAsync('tracking', {
      name: 'Atualizações de Rastreamento',
      importance: Notifications.AndroidImportance.LOW,
      sound: false,
      enableLights: false,
      enableVibration: false,
      showBadge: false,
    });

    // 3. Iniciar serviço de localização
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000,
      distanceInterval: 1,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Rastreamento Ativo',
        notificationBody: `Distância: 0.00 km`, // Valor inicial
        notificationColor: '#2196f3',
        notificationChannelId: 'tracking', // Usar canal configurado
      },
    });

    // 4. Iniciar notificação dinâmica
    await Notifications.scheduleNotificationAsync({
      identifier: 'distance-updates',
      content: {
        title: 'Rastreamento em Progresso',
        body: `Distância percorrida: 0.00 km`,
      },
      trigger: null,
      channelId: 'tracking',
    });
  };

  // Atualize este useEffect para modificar APENAS o foreground service
  useEffect(() => {
    const updateNotification = async () => {
      if (tracking) {
        // Para e reinicia o serviço com nova notificação
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'Rastreamento Ativo',
            notificationBody: `Distância: ${totalDistance.toFixed(2)} km`,
            notificationColor: '#2196f3',
            notificationChannelId: 'tracking',
          },
        });
      }
    };

    updateNotification();
  }, [totalDistance, tracking]);

  const stopTracking = async () => {
    setTracking(false);

    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);

    // Remover notificações
    await Notifications.dismissNotificationAsync('distance-updates');
    await Notifications.dismissAllNotificationsAsync();

    // Corrigido: Delay para garantir finalização
    setTimeout(() => {
      console.log('Rota salva:', { pathCoordinates, totalDistance });

      setPathCoordinates([]);
      setTotalDistance(0);
      webViewRef.current.injectJavaScript(`
      if (window.currentPolyline) {
        window.map.removeLayer(window.currentPolyline);
        window.currentPolyline = null;
      }
      true;
    `);
    }, 200);
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style> 
          html, body, #map { 
            height: 100%; 
            width: 100%; 
            margin: 0; 
            padding: 0; 
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          var map;
          var marker;
          var polyline;
          var currentPolyline = null;

          window.onload = function() {
            map = L.map('map', {
              zoomControl: false,
              attributionControl: false
            }).setView([0, 0], 13);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              detectRetina: true
            }).addTo(map);

            marker = L.marker([0, 0]).addTo(map);

            document.addEventListener('message', function(e) {
              var data = JSON.parse(e.data);
              var newLatLng = [data.lat, data.lng];
              
              // Atualiza marcador sempre
              marker.setLatLng(newLatLng);

              map.setView(newLatLng, 17, { animate: true });
              // Atualiza view inicial
              if(data.initial) {
                map.setView(newLatLng, 17, { animate: false });
              }
              
              // Cria/atualiza polyline apenas quando em tracking
              if(data.tracking) {
                if(!currentPolyline) {
                  currentPolyline = L.polyline([], { color: 'blue' }).addTo(map);
                }
                currentPolyline.addLatLng(newLatLng);
              } else {
                if(currentPolyline) {
                  map.removeLayer(currentPolyline);
                  currentPolyline = null;
                }
              }
            });
          };
        </script>
      </body>
    </html>
  `;

  if (errorMsg) {
    return <View style={styles.container}><Text>{errorMsg}</Text></View>;
  }

  if (!location) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#0000ff" /></View>;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* NOVO: Display da distância */}
      <View style={styles.distanceContainer}>
        <Text style={styles.distanceText}>
          Distância: {totalDistance.toFixed(2)} km
        </Text>
      </View>

      <WebView
        ref={webViewRef}
        originWhitelist={['*', 'https://*.openstreetmap.org']} // Modificado
        source={{ html: htmlContent }}
        style={styles.webview}
        onLoad={() => {
          // Quando o WebView for carregado, enviar a localização inicial
          if (location) {
            webViewRef.current.postMessage(
              JSON.stringify({ lat: location.latitude, lng: location.longitude, initial: true })
            );
          }
        }}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[paddings[4], borders.borderCircle, display.flex, display.alignItemsCenter, display.justifyContentCenter, { backgroundColor: tracking ? colors.red['500'] : colors.blue['500'] }]}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  // NOVO: Estilos para o contêiner da distância
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
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});