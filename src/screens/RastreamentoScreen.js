import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Alert, Text, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const TASK_NAME = 'background-fetch-task';

export default function TrackingScreen() {
    const [location, setLocation] = useState(null);
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    const [route, setRoute] = useState([]);
    const [isTracking, setIsTracking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [timer, setTimer] = useState(0);
    const [distance, setDistance] = useState(0); // Quilometragem em tempo real
    const [distanciaAtualPausada, setDistanciaAtualPausada] = useState(null); // Quilometragem pausada

    const timerRef = useRef(null);
    const watchPositionRef = useRef(null);

    useEffect(() => {
        const getLocationPermission = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permissão Negada",
                    "É necessário permitir o acesso à localização para usar esta funcionalidade."
                );
                return;
            }
    
            let currentLocation = await Location.getCurrentPositionAsync({});
            if (currentLocation) {
                const { latitude, longitude } = currentLocation.coords;
                setLocation({ latitude, longitude });
                setRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
            }
        };
    
        getLocationPermission();
    }, []);
    
    useEffect(() => {
        const fetchLocation = async () => {
            if (isTracking && !isPaused) {
                watchPositionRef.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 1000,
                        distanceInterval: 1,
                    },
                    (newLocation) => {
                        const { latitude, longitude } = newLocation.coords;
    
                        setLocation({ latitude, longitude });
                        setRegion((prevRegion) => ({
                            ...prevRegion,
                            latitude,
                            longitude,
                        }));
    
                        setRoute((prevRoute) => {
                            if (prevRoute.length > 0) {
                                const lastPoint = prevRoute[prevRoute.length - 1];
                                const newDistance = getDistance(
                                    lastPoint.latitude,
                                    lastPoint.longitude,
                                    latitude,
                                    longitude
                                );
                                setDistance((prevDistance) => prevDistance + newDistance);
                            }
                            return [...prevRoute, { latitude, longitude }];
                        });
                    }
                );
    
                // Iniciar cronômetro
                timerRef.current = setInterval(() => {
                    setTimer((prev) => prev + 1);
                }, 1000);
            } else {
                if (watchPositionRef.current && typeof watchPositionRef.current.remove === "function") {
                    watchPositionRef.current.remove();
                    watchPositionRef.current = null;
                }
                clearInterval(timerRef.current);
            }
        };
    
        fetchLocation();
    
        return () => {
            if (watchPositionRef.current && typeof watchPositionRef.current.remove === "function") {
                watchPositionRef.current.remove();
                watchPositionRef.current = null;
            }
            clearInterval(timerRef.current);
        };
    }, [isTracking, isPaused]);

    const startTracking = () => {
        setIsTracking(true);
        setIsPaused(false);
        setRoute([]);
        setTimer(0);
        setDistance(0);
        setDistanciaAtualPausada(null);
    };

    const pauseTracking = () => {
        setIsPaused(true);
        setDistanciaAtualPausada(distance);
    };

    const resumeTracking = () => {
        setIsPaused(false);
        if (distanciaAtualPausada !== null || distanciaAtualPausada > 0) {
            setDistance(distanciaAtualPausada);
        } else {
            setDistance(0);
        }
    };

    const stopTracking = () => {
        setIsTracking(false);
        setIsPaused(false);
        clearInterval(timerRef.current);

        const finalDistance = distance.toFixed(2);
        const finalTime = formatTime(timer);

        setRoute([]);
        setTimer(0);
        setDistance(0);
        setDistanciaAtualPausada(null);

        Alert.alert("Rastreamento Finalizado", `Tempo: ${finalTime}\nDistância: ${finalDistance} km`);
    };

    const showNotification = async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Atividade em Segundo Plano',
                body: `Tempo: ${formatTime(timer)} | Distância: ${(isPaused ? distanciaAtualPausada : distance).toFixed(2)} km`,
            },
            trigger: {
                seconds: 2,
                repeats: true,
            },
        });
    };

    TaskManager.defineTask(TASK_NAME, async () => {
        showNotification();
    });

    useEffect(() => {
        const setupBackgroundFetch = async () => {
            await BackgroundFetch.registerTaskAsync(TASK_NAME, {
                minimumInterval: 1,
                stopOnTerminate: false,
            });
        };

        setupBackgroundFetch();
    }, []);

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={region}
                showsUserLocation
            >
                {route.length > 1 && <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" />}
                {location && (
                    <Marker coordinate={location} title="Você está aqui" description="Localização atual" />
                )}
            </MapView>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: isTracking && !isPaused ? "#ddd" : "#0f0" }]}
                    onPress={isTracking ? (isPaused ? resumeTracking : pauseTracking) : startTracking}
                >
                    <MaterialIcons name="play-arrow" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: (!isTracking && !isPaused) || isPaused ? "#ddd" : "#0f0" }]}
                    onPress={pauseTracking}
                >
                    <MaterialIcons name="pause" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: isTracking ? "#f00" : "#ddd" }]}
                    onPress={isTracking ? stopTracking : null}
                >
                    <MaterialIcons name="stop" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <Text style={styles.timer}>
                Distância: {(isPaused ? distanciaAtualPausada : distance).toFixed(2)} km
            </Text>
            <Text style={styles.timer}>Tempo: {formatTime(timer)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: "100%",
        height: "70%",
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
        backgroundColor: "#ddd",
    },
    timer: {
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
    },
});
