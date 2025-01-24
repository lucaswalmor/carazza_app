import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const LOCATION_TASK_NAME = 'background-location-task';

export default function RotaScreen() {
    const [route, setRoute] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [distance, setDistance] = useState(0);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [startMarker, setStartMarker] = useState(null);
    const [endMarker, setEndMarker] = useState(null);
    const [routeData, setRouteData] = useState(null);
    const mapRef = useRef(null);

    // Permissão de localização e configuração do watchPositionAsync
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'Precisamos de acesso à sua localização.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            setCurrentLocation(location.coords);

            const subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Highest,
                    timeInterval: 1000,
                    distanceInterval: 1,
                },
                (response) => {
                    setCurrentLocation(response.coords);

                    if (mapRef.current) {
                        mapRef.current.animateCamera({
                            center: response.coords,
                            pitch: 50,
                            heading: response.coords.heading || 0,
                        });
                    }

                    if (isRecording) {
                        setRoute((prevRoute) => {
                            if (prevRoute.length > 0) {
                                const lastPoint = prevRoute[prevRoute.length - 1];
                                const newDistance = calculateDistance(lastPoint, response.coords);
                                setDistance((prevDistance) => prevDistance + newDistance);
                            }
                            return [...prevRoute, response.coords];
                        });
                    }
                }
            );

            return () => subscription?.remove();
        })();

        (async () => {
            if (!(await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME))) {
                await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                    accuracy: Location.Accuracy.Highest,
                    timeInterval: 1000,
                    distanceInterval: 1,
                    showsBackgroundLocationIndicator: true,
                    foregroundService: {
                        notificationTitle: 'Rastreamento Ativo',
                        notificationBody: 'Acompanhe sua rota em segundo plano.',
                    },
                });
            }
        })();
    }, [isRecording]);

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

    const startRecording = () => {
        setRoute([]);
        setDistance(0);
        setStartMarker(currentLocation);
        setEndMarker(null);
        setIsRecording(true);
        Alert.alert('Gravação iniciada', 'Estamos gravando sua rota.');
    };

    const stopRecording = async () => {
        setIsRecording(false);
        setEndMarker(currentLocation);

        const data = {
            startLocation: startMarker,
            endLocation: currentLocation,
            distance,
            coordinates: route,
        };
        setRouteData(data);

        Alert.alert(
            'Rota concluída',
            `Distância total: ${distance.toFixed(2)} km.`,
            [
                {
                    text: 'Finalizar',
                    onPress: resetRoute,
                },
            ]
        );

        // Parar o serviço de localização em segundo plano
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    };

    const resetRoute = () => {
        setRoute([]);
        setStartMarker(null);
        setEndMarker(null);
        setDistance(0);
        setRouteData(null);
        Alert.alert('Rota resetada', 'Você pode iniciar uma nova rota.');
    };

    return (
        <View style={stylesMap.container}>
            {currentLocation ? (
                <MapView
                    style={stylesMap.map}
                    initialRegion={{
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        latitudeDelta: 0.006,
                        longitudeDelta: 0.006,
                    }}
                    showsUserLocation
                    followsUserLocation
                    ref={mapRef}
                >
                    {route.length > 0 && isRecording && (
                        <Polyline
                            coordinates={route}
                            strokeColor="blue"
                            strokeWidth={5}
                        />
                    )}
                    {startMarker && (
                        <Marker
                            coordinate={{
                                latitude: startMarker.latitude,
                                longitude: startMarker.longitude,
                            }}
                            title="Início"
                            pinColor="green"
                        />
                    )}
                    {endMarker && (
                        <Marker
                            coordinate={{
                                latitude: endMarker.latitude,
                                longitude: endMarker.longitude,
                            }}
                            title="Fim"
                            pinColor="red"
                        />
                    )}
                </MapView>
            ) : (
                <Text style={stylesMap.loadingText}>Carregando localização...</Text>
            )}
            <View style={stylesMap.info}>
                <LinearGradient
                    colors={['#3b5998', '#001933']}
                    style={stylesMap.gradientContainer}
                >
                    <View style={stylesMap.controlsContainer}>
                        <View style={stylesMap.controls}>
                            {isRecording ? (
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                    <Text style={stylesMap.timer}>Distância: {distance.toFixed(2)} km</Text>
                                    <TouchableOpacity
                                        style={[stylesMap.button, { backgroundColor: isRecording ? "#f00" : "#80bdff" }]}
                                        onPress={stopRecording}
                                    >
                                        <MaterialIcons name="stop" size={24} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                    <TouchableOpacity
                                        style={[stylesMap.button, { backgroundColor: !isRecording ? "#007BFF" : "#80bdff" }]}
                                        onPress={startRecording}
                                    >
                                        <MaterialIcons name="play-arrow" size={24} color="white" />
                                    </TouchableOpacity>
                                    <Text style={stylesMap.timer}>
                                        Iniciar
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
}

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
        console.error(error);
        return;
    }
    if (data) {
        const { locations } = data;
        const location = locations[0];
        if (location) {
            console.log('Localização em segundo plano:', location);
        }
    }
});

const stylesMap = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
        width: "100%",
        height: '80%',
    },
    info: {
        height: '20%'
    },
    loadingText: {
        padding: 20,
        textAlign: 'center',
        fontSize: 16,
    },
    controlsContainer: {
        flex: 1,
    },
    controls: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginVertical: 20,
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#80bdff",
    },
    timer: {
        fontSize: 20,
        fontWeight: "bold",
        color: '#cce5ff'
    },
    gradientContainer: {
        flex: 1,
    },
});
