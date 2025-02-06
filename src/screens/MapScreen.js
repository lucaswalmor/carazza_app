import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform
} from "react-native";
import {
    requestForegroundPermissionsAsync,
    getCurrentPositionAsync,
    watchPositionAsync,
    LocationAccuracy,
} from 'expo-location'
import MapView, { Marker, Polyline } from 'react-native-maps'
import { useEffect, useRef, useState } from "react";
import styles from "../assets/css/styles";
import * as TaskManager from 'expo-task-manager';
import { borders, colors, display, fontSize, gap, paddings } from "../assets/css/primeflex";
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import Toast from "../components/Toast";

const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Definir a tarefa em segundo plano
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
        console.error('Erro na tarefa de localização:', error);
        return;
    }
    if (data) {
        const { locations } = data;
    }
});

export default function MapScreen() {
    const [location, setLocation] = useState(null);
    const [initialLocation, setInitialLocation] = useState({ latitude: 0, longitude: 0 });
    const [finalLocation, setFinalLocation] = useState({ latitude: 0, longitude: 0 });
    const [route, setRoute] = useState([]);
    const [routeFinish, setRouteFinish] = useState([]);
    const [trackingFinish, setTrackingFinish] = useState(false);
    const [tracking, setTracking] = useState(false);
    const [distance, setDistance] = useState(0);
    const mapRef = useRef(null);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dados, setDados] = useState({});
    const [toast, setToast] = useState({ visible: false, message: '', position: 'bottom', severity: '' });

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
        requestLocationPermission();
    }, [])

    useEffect(() => {
        watchPositionAsync({
            accuracy: LocationAccuracy.BestForNavigation,
            timeInterval: 1000,
            distanceInterval: 1,
        }, (response) => {
            setLocation(response.coords)

            if (mapRef.current) {
                mapRef.current.animateCamera({
                    center: response.coords,
                    pitch: 50,
                    heading: response.coords.heading || 0,
                });
            }

            if (tracking) {
                setRoute((prevRoute) => {

                    if (prevRoute.length > 0) {
                        const lastPoint = prevRoute[prevRoute.length - 1];
                        const newDistance = calculateDistance(lastPoint, response.coords);
                        setDistance((prevDistance) => prevDistance + newDistance);
                    }

                    return [...prevRoute, response.coords];
                });
            }
        })
    }, [tracking])

    async function requestLocationPermission() {
        const { granted } = await requestForegroundPermissionsAsync();

        if (granted) {
            const location = await getCurrentPositionAsync();

            await requestBackgroundLocationPermission();

            setLocation(location.coords)
        }
    }

    async function requestBackgroundLocationPermission() {
        const { status } = await Location.requestBackgroundPermissionsAsync();
    }

    const calculateDistance = (pointA, pointB) => {
        const R = 6371;
        const dLat = ((pointB.latitude - pointA.latitude) * Math.PI) / 180;
        const dLon = ((pointB.longitude - pointA.longitude) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((pointA.latitude * Math.PI) / 180) *
            Math.cos((pointB.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const startTracking = async () => {
        setTracking(true);

        setInitialLocation(location)

        setFinalLocation({ latitude: 0, longitude: 0 })
        setDistance(0)
        setRoute([])
        setTrackingFinish(false)

        // Iniciar o rastreamento em segundo plano
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
            accuracy: LocationAccuracy.BestForNavigation,
            timeInterval: 1000, // Intervalo de tempo entre atualizações (em milissegundos)
            distanceInterval: 1, // Intervalo de distância entre atualizações (em metros)
            showsBackgroundLocationIndicator: true, // Mostra um indicador ao usuário
            foregroundService: {
                notificationTitle: 'Rastreamento em andamento',
                notificationBody: 'Seu aplicativo está rastreando sua localização.',
            },
        });
    }

    const stopTracking = async () => {
        setTracking(false);

        const data = {
            route: route,
            distance: distance
        }

        setDados(data)
        setRouteFinish(data.route)

        if (route.length > 0) {
            setFinalLocation(route[route.length - 1]); // Define a última localização registrada
        }

        setTrackingFinish(true)
        setDistance(0)
        setRoute([])

        // Parar o rastreamento em segundo plano
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }

    const toggleTheme = async () => {
        try {
            const newTheme = !isDarkTheme;
            setIsDarkTheme(newTheme);
            await AsyncStorage.setItem('mapTheme', newTheme ? 'dark' : 'light');
        } catch (error) {
            console.error('Erro ao salvar o tema:', error);
        }
    };

    const saveRoute = async () => {
        const token = await AsyncStorage.getItem('token');

        try {
            setIsLoading(true)
            const response = await api.post('/user/store/rotas', dados, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            })

            setRoute([])
            setRouteFinish([])
            setInitialLocation({ latitude: 0, longitude: 0 })
            setFinalLocation({ latitude: 0, longitude: 0 })
            
            showToast(response.data.message, 'top', 'success')
        } catch (error) {
            showToast(error.response.data.error, 'top', 'danger')
        } finally {
            setIsLoading(false)
        }
    }

    const showToast = (message, position, severity) => {
        setToast({ visible: true, message, position, severity });

        // Esconde o toast após 3 segundos
        setTimeout(() => setToast({ ...toast, visible: false }), 3000);
    };

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

    if (!location) {
        return <View style={styles.container}><ActivityIndicator size="large" color="#0000ff" /></View>;
    }

    return (
        <View>
            <MapView
                ref={mapRef}
                style={{ height: '100%', width: '100%' }}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001
                }}
                customMapStyle={isDarkTheme ? darkStyle : []}
                showsUserLocation={true}
                followsUserLocation={true}
                showsMyLocationButton={true}
            >
                {initialLocation.latitude != 0 && initialLocation.longitude != 0 && (
                    <Marker
                        coordinate={{
                            latitude: initialLocation?.latitude,
                            longitude: initialLocation?.longitude,
                        }}
                        pinColor="green"
                    />
                )}

                {finalLocation.latitude != 0 && finalLocation.longitude != 0 && (
                    <Marker
                        coordinate={{
                            latitude: finalLocation?.latitude,
                            longitude: finalLocation?.longitude,
                        }}
                    />
                )}

                {tracking && (
                    <Polyline
                        coordinates={route}
                        strokeColor={colors.blue['500']}
                        strokeWidth={7}
                    />
                )}

                {trackingFinish && (
                    <Polyline
                        coordinates={routeFinish}
                        strokeColor={colors.blue['500']}
                        strokeWidth={7}
                    />
                )}
            </MapView>

            <View style={[styles2.distanceContainer, display.row, display.justifyContentBetween]}>
                <Text style={styles2.distanceText}>
                    Distância: {!tracking ? '0.00' : distance.toFixed(2)} km
                </Text>

                <TouchableOpacity onPress={toggleTheme}>
                    <FontAwesome5
                        name={isDarkTheme ? 'sun' : 'moon'}
                        size={20}
                        color="#000"
                        style={{ marginRight: 5 }}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles2.buttonContainer}>
                <View style={[display.row, gap[2]]}>
                    <View>
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

                    {finalLocation.latitude != 0 && finalLocation.longitude != 0 && (
                        <TouchableOpacity
                            style={[paddings[4], borders.borderCircle, display.row, display.alignItemsCenter, gap[4],
                            display.justifyContentBetween, { backgroundColor: colors.indigo['600'] }]}
                            onPress={saveRoute}
                            disabled={isLoading}
                        >
                            <FontAwesome5
                                name={'cloud-upload-alt'}
                                size={20}
                                color="white"
                            />

                            {isLoading ? (
                                <>
                                    <Text style={[fontSize['lg'], { color: colors.alpha[1000] }]}>
                                        Salvando...
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Text style={[fontSize['lg'], { color: colors.alpha[1000] }]}>
                                        Salvar Rota
                                    </Text>
                                </>
                            )}

                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {toast.visible && (
                <Toast
                    message={toast.message}
                    position={toast.position}
                    onClose={() => setToast({ ...toast, visible: false })}
                    severity={toast.severity}
                />
            )}
        </View>
    )
}

const styles2 = StyleSheet.create({
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
        top: 60,
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
