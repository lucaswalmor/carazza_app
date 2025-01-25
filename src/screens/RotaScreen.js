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

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"   viewBox="0 0 192 192" version="1.1">
        <g>
        <path style=" stroke:none;fill-rule:nonzero;fill-opacity:1;" fill="#697584" d="M 88.273438 48.75 C 93.296875 45.523438 95.171875 45.074219 101.625 45.074219 L 109.125 45.074219 L 109.5 40.125 C 110.175781 30.898438 104.324219 24.824219 94.800781 24.824219 C 89.402344 24.824219 85.949219 26.324219 83.101562 29.773438 C 80.25 33.296875 80.550781 34.273438 84.828125 33.597656 C 90.152344 32.699219 91.578125 34.046875 91.277344 39.371094 C 90.902344 43.644531 90.675781 43.871094 85.800781 45.144531 C 80.625 46.417969 79.277344 47.917969 80.402344 50.917969 C 81.152344 53.167969 81.753906 53.019531 88.277344 48.742188 Z M 88.273438 48.75 "/>
        <path style=" stroke:none;fill-rule:nonzero;fill-opacity:1;" fill="#697584" d="M 14.699219 119.25 C 7.722656 126.75 5.398438 141.300781 9.675781 150.75 C 12.300781 156.601562 21.152344 164.550781 26.777344 166.050781 C 37.578125 168.902344 47.703125 166.277344 55.277344 158.699219 C 66.226562 147.75 66.078125 129.824219 54.902344 118.722656 C 44.703125 108.222656 24.601562 108.523438 14.703125 119.246094 Z M 14.699219 119.25 "/>
        <path style=" stroke:none;fill-rule:nonzero;fill-opacity:1;" fill="#697584" d="M 158.25 104.398438 C 166.875 103.949219 168.375 103.574219 168.976562 101.625 C 170.476562 97.050781 167.851562 96.148438 153 96 L 139.125 96 L 135.074219 89.699219 C 132.898438 86.25 130.722656 83.398438 130.125 83.398438 C 129.523438 83.398438 125.398438 86.171875 120.898438 89.625 L 112.648438 95.851562 L 97.273438 96.300781 C 82.796875 96.675781 81.75 96.902344 80.171875 99.300781 C 78.222656 102.300781 75.371094 102.527344 70.945312 100.199219 C 66.21875 97.800781 59.996094 90.75 60.746094 88.800781 C 61.644531 86.25 88.195312 66.300781 90.671875 66.152344 C 91.945312 66.152344 95.847656 70.503906 101.023438 77.628906 C 105.597656 83.929688 109.796875 89.105469 110.25 89.105469 C 112.425781 89.179688 126.074219 78.378906 125.550781 76.878906 C 125.175781 76.054688 121.277344 70.578125 116.777344 64.578125 C 103.050781 46.652344 101.253906 46.652344 77.476562 64.503906 C 67.800781 71.777344 59.402344 77.703125 58.875 77.703125 C 58.351562 77.703125 57.601562 76.878906 57.300781 75.976562 C 56.402344 73.425781 54.300781 73.800781 45.675781 77.703125 C 34.726562 82.652344 30.375 87.152344 30.375 93.378906 C 30.375 100.355469 32.324219 104.179688 36.148438 104.179688 C 41.625 104.179688 50.625 107.554688 56.023438 111.679688 C 62.097656 116.40625 66.148438 122.703125 68.773438 131.929688 C 71.625 141.90625 76.5 145.355469 89.472656 146.78125 C 93.972656 147.230469 103.347656 147.679688 110.246094 147.832031 L 122.921875 147.90625 L 122.921875 139.054688 C 122.921875 128.628906 125.546875 122.179688 132.820312 114.53125 C 139.421875 107.632812 146.171875 105.007812 158.246094 104.40625 Z M 158.25 104.398438 "/>
        <path style=" stroke:none;fill-rule:nonzero;fill-opacity:1;" fill="#697584" d="M 180.300781 123.523438 C 178.425781 120.898438 174.675781 117.074219 171.902344 115.125 C 165.675781 110.773438 153.828125 109.648438 145.800781 112.726562 C 135.226562 116.777344 126.824219 131.328125 128.699219 142.351562 C 130.425781 153.300781 138.222656 162.601562 147.972656 165.675781 C 162.222656 170.175781 177.523438 163.050781 182.699219 149.476562 C 185.847656 141.527344 184.722656 129.675781 180.300781 123.527344 Z M 180.300781 123.523438 "/>
        </g>
        </svg>
    `

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
                                        strokeColor: '#dfeeff',
                                        strokeOpacity: 1.0,
                                        strokeWeight: 7
                                    });

                                    routePath.setMap(map);

                                    // const startMarker = new google.maps.Marker({
                                    //     position: routeCoordinates[0],
                                    //     map: map,
                                    //     title: 'Início da Rota',
                                    //     icon: {
                                    //         url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                                    //     }
                                    // });

                                    const endMarker = new google.maps.Marker({
                                        position: routeCoordinates[routeCoordinates.length - 1],
                                        map: map,
                                        title: 'Fim da Rota',
                                        icon: {
                                            url: 'https://pic.onlinewebfonts.com/thumbnails/icons_413872.svg?width=3&config=eyJwYXRoIjpbImRmZWVmZiIsImRmZWVmZiIsImRmZWVmZiIsImRmZWVmZiJdfQ==', // URL do ícone de moto
                                            scaledSize: new google.maps.Size(85, 85) // Tamanho do ícone ajustado
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
