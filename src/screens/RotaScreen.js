import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import WebView from 'react-native-webview';

const LOCATION_TASK_NAME = 'background-location-task';

export default function RotaScreen() {
    const [route, setRoute] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [distance, setDistance] = useState(0);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [startMarker, setStartMarker] = useState(null);
    const [endMarker, setEndMarker] = useState(null);
    const [cordenatesWebview, setCordenatesWebview] = useState([]);
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

            if (cordenatesWebview.length < 1) {
                setCordenatesWebview((prevCoordinates) => {
                    return [...prevCoordinates, { lat: location.coords.latitude, lng: location.coords.longitude }];
                });
            }
            setCurrentLocation(location.coords);

            const subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Highest,
                    timeInterval: 4000,
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

                            setCordenatesWebview((prevCoordinates) => {
                                return [...prevCoordinates, { lat: response.coords.latitude, lng: response.coords.longitude }];
                            });

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
                    timeInterval: 5000,
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
        setCordenatesWebview([]);
        Alert.alert('Gravação iniciada', 'Estamos gravando sua rota.');
    };

    const stopRecording = async () => {
        setIsRecording(false);
        setEndMarker(currentLocation);

        const coordinates = route.map(point => ({
            lat: point.latitude,
            lng: point.longitude
        }));

        const data = {
            startLocation: startMarker,
            endLocation: currentLocation,
            distance,
            coordinates: coordinates,
        };

        setCordenatesWebview(coordinates);
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
        // setRouteData(null);
        Alert.alert('Rota resetada', 'Você pode iniciar uma nova rota.');
    };

    return (
        <View style={stylesMap.container}>
            {currentLocation ? (
                <WebView
                    originWhitelist={['*']}
                    source={{
                        html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                            #map { height: 100%; width: 100%; }
                            html, body { height: 100%; margin: 0; padding: 0; }
                            </style>
                            <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB2PKyiPLwysX53zSFx7Vv2wgIFb88oTL4"></script>
                            <script>
                                function initMap() {
                                    const routeCoordinates = ${JSON.stringify(cordenatesWebview)};
                                    const darkStyle = [
                                        {
                                            "elementType": "geometry",
                                            "stylers": [{ "color": "#1A2636" }]
                                        },
                                        {
                                            "elementType": "labels.icon",
                                            "stylers": [{ "visibility": "off" }]
                                        },
                                        {
                                            "elementType": "labels.text.fill",
                                            "stylers": [{ "color": "#B5B9C4" }]
                                        },
                                        {
                                            "elementType": "labels.text.stroke",
                                            "stylers": [{ "color": "#1A2636" }]
                                        },
                                        {
                                            "featureType": "administrative",
                                            "elementType": "geometry",
                                            "stylers": [{ "color": "#B5B9C4" }]
                                        },
                                        {
                                            "featureType": "poi",
                                            "elementType": "geometry",
                                            "stylers": [{ "color": "#144043" }]
                                        },
                                        {
                                            "featureType": "poi.park",
                                            "elementType": "geometry", 
                                            "stylers": [{ "color": "#144043" }]
                                        },
                                        {
                                            "featureType": "road",
                                            "elementType": "geometry.fill", // cores das ruas
                                            "stylers": [{ "color": "#445365" }]
                                        },
                                        {
                                            "featureType": "road",
                                            "elementType": "geometry.stroke",
                                            "stylers": [{ "color": "#1A2636" }]
                                        },
                                        {
                                            "featureType": "road.highway",
                                            "elementType": "geometry", // rodovias
                                            "stylers": [{ "color": "#144043" }]
                                        },
                                        {
                                            "featureType": "water",
                                            "elementType": "geometry", // cores das aguas
                                            "stylers": [{ "color": "#b3e5fc" }]
                                        },
                                        {
                                            "featureType": "water",
                                            "elementType": "labels.text.fill", // cores dos textos das aguas
                                            "stylers": [{ "color": "#03a9f4" }]
                                        }
                                    ];

                                    const map = new google.maps.Map(document.getElementById('map'), {
                                        zoom: ${isRecording} ? 19 : 17,
                                        center: routeCoordinates[routeCoordinates.length - 1],
                                        styles: darkStyle // Adiciona o estilo escuro
                                    });

                                    const routePath = new google.maps.Polyline({
                                        path: routeCoordinates,
                                        geodesic: true,
                                        strokeColor: '#007BFF',
                                        strokeOpacity: 1.0,
                                        strokeWeight: 7
                                    });

                                    routePath.setMap(map);

                                    const startMarker = new google.maps.Marker({
                                        position: routeCoordinates[0],
                                        map: map,
                                        title: 'Início da Rota',
                                        icon: {
                                            url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"><circle cx="15" cy="15" r="12" fill="green" /><text x="50%" y="50%" alignment-baseline="middle" text-anchor="middle" font-size="14" fill="white">A</text></svg>', // Ícone customizado com "A"
                                            scaledSize: new google.maps.Size(50, 50) // Tamanho do ícone
                                        }
                                    });

                                    const endMarker = new google.maps.Marker({
                                        position: routeCoordinates[routeCoordinates.length - 1],
                                        map: map,
                                        title: 'Fim da Rota',
                                        icon: {
                                            url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"><circle cx="15" cy="15" r="12" fill="red" /><text x="50%" y="50%" alignment-baseline="middle" text-anchor="middle" font-size="14" fill="white">B</text></svg>', // Ícone customizado com "B"
                                            scaledSize: new google.maps.Size(50, 50) // Tamanho do ícone
                                        }
                                    });
                                }
                            </script>
                        </head>
                        <body onload="initMap()">
                            <div id="map"></div>
                        </body>
                        </html>
                    ` }}
                    style={{ flex: 1 }}
                />
            ) : (
                <Text style={stylesMap.loadingText}>Carregando localização...</Text>
            )}

            <View style={stylesMap.info}>
                <LinearGradient
                    colors={['#1A2636', '#1A2636', '#001933']}
                    style={stylesMap.gradientContainer}
                >
                    <View style={stylesMap.controlsContainer}>
                        <View style={stylesMap.controls}>
                            {isRecording ? (
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                    <TouchableOpacity
                                        style={[stylesMap.button, { backgroundColor: isRecording ? "#f00" : "#80bdff" }]}
                                        onPress={stopRecording}
                                    >
                                        <MaterialIcons name="stop" size={24} color="white" />
                                    </TouchableOpacity>
                                    <Text style={stylesMap.timer}>Distância: {distance.toFixed(2)} km</Text>
                                </View>
                            ) : (
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                    <TouchableOpacity
                                        style={[stylesMap.button, { backgroundColor: !isRecording ? "#007BFF" : "#80bdff" }]}
                                        onPress={startRecording}
                                    >
                                        <MaterialIcons name="play-arrow" size={24} color="white" />
                                    </TouchableOpacity>
                                    <Text style={stylesMap.timer}>Iniciar</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
}

const stylesMap = StyleSheet.create({
    container: { flex: 1 },
    loadingText: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    gradientContainer: { flex: 1 },
    controlsContainer: { flex: 1 },
    controls: { flex: 1, justifyContent: 'center', gap: 10 },
    button: { padding: 10, borderRadius: 50 },
    timer: { color: 'white', fontSize: 18 },
    info: { height: '20%' },
});
