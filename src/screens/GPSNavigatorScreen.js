import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import Accordion from '../components/Accordion';
import styles from '../assets/css/styles';
import Botao from '../components/Botao';
import { colors } from '../assets/css/primeflex';
import Toast from '../components/Toast';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAu4BOiZIT9Y4eHn81U5Uf98ZTBt8jUjyU';
const LOCATIONIQ_API_KEY = 'pk.7179dc15856b3b310d544e4c66101b1b';

export default function GPSNavigatorScreen() {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState([]);
    const [destinationCep, setDestinationCep] = useState('');
    const [destinationNumber, setDestinationNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasRota, setHasRota] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);
    const mapRef = useRef(null);
    const [hasRecalculated, setHasRecalculated] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', position: 'bottom', severity: '' });

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão de localização negada');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});

            setCurrentLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        })();
    }, []);

    useEffect(() => {
        let locationSubscription = null;

        const startWatchingPosition = async () => {
            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 1000,
                    distanceInterval: 1,
                },
                (location) => {
                    const { latitude, longitude } = location.coords;
                    setCurrentLocation({ latitude, longitude });

                    if (mapRef.current) {
                        mapRef.current.animateCamera({
                            center: location.coords,
                            pitch: 50,
                            heading: location.coords.heading,
                        });
                    }


                    if (destinationCoords.length > 0) {
                        const isOnRoute = destinationCoords.some(({ latitude: lat, longitude: lon }) => {
                            const distance = getDistance(latitude, longitude, lat, lon);
                            return distance <= 150;
                        });

                        if (!isOnRoute && !hasRecalculated) {
                            setHasRecalculated(true);
                            calculateRoute();

                            setTimeout(() => setHasRecalculated(false), 5000);
                        }
                    }
                }
            );
        };

        startWatchingPosition();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove(); // Garante que o watchPositionAsync será cancelado ao desmontar
            }
        };
    }, [destinationCoords, hasRecalculated]);

    // Função para calcular a distância entre dois pontos (Haversine)
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Raio da Terra em metros
        const toRad = (angle) => (angle * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Retorna a distância em metros
    };

    // Função para buscar o endereço completo a partir do cep
    const pesquisacep = async (valor) => {
        const cep = valor.replace(/\D/g, '');
        try {
            if (cep.length !== 8) {
                showToast('CEP inválido', 'top', 'danger')
            }
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            return data;
        } catch (error) {
            showToast('CEP inválido', 'top', 'danger')
        }
    };

    // Função para calcular a rota
    const calculateRoute = async () => {
        setIsLoading(true);
        try {
            const getDestinationCepAddress = await pesquisacep(destinationCep);

            const destinationAddress = `${getDestinationCepAddress.logradouro}, ${destinationNumber}, ${getDestinationCepAddress.bairro}, ${getDestinationCepAddress.localidade}, ${getDestinationCepAddress.estado}`;

            const destinationCoords = await getCoordinatesFromAddress(destinationAddress);

            if (!destinationCoords) {
                Alert.alert('Erro ao obter coordenadas do destino');
                return;
            }

            const routeData = await getRouteFromLocationIQ(currentLocation, destinationCoords);
            if (routeData) {
                setHasRota(true);
                setDestinationCoords(routeData);
            }
        } catch (error) {
            console.error('Erro ao calcular a rota:', error.response.data);
        } finally {
            setIsLoading(false);
        }
    };

    // Função para buscar o array de polyline
    const getRouteFromLocationIQ = async (origin, destination) => {
        try {
            const response = await axios.get(
                `https://us1.locationiq.com/v1/directions/driving/${origin.longitude},${origin.latitude};${destination.lng},${destination.lat}?key=${LOCATIONIQ_API_KEY}&steps=true&alternatives=true&geometries=polyline&overview=full`
            );

            if (response.data.routes.length > 0 && response.data.routes[0].geometry) {
                return decodePolyline(response.data.routes[0].geometry);
            } else {
                throw new Error('Nenhuma rota encontrada');
            }
        } catch (error) {
            console.error('Erro ao calcular a rota:', error);
            return null;
        }
    };

    // Função parade codificar o array de polyline
    const decodePolyline = (encoded) => {
        let index = 0;
        const coordinates = [];
        let lat = 0, lng = 0;

        while (index < encoded.length) {
            let shift = 0, result = 0;
            let byte;

            // Decodifica latitude
            do {
                byte = encoded.charCodeAt(index++) - 63;
                result |= (byte & 0x1F) << shift;
                shift += 5;
            } while (byte >= 0x20);

            let deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
            lat += deltaLat;

            // Decodifica longitude
            shift = 0;
            result = 0;

            do {
                byte = encoded.charCodeAt(index++) - 63;
                result |= (byte & 0x1F) << shift;
                shift += 5;
            } while (byte >= 0x20);

            let deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
            lng += deltaLng;

            coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
        }

        return coordinates;
    };

    // Função para obter coordenadas a partir do endereço
    const getCoordinatesFromAddress = async (address) => {
        try {
            const response = await axios.get(
                `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(address)}&format=json`
            );

            if (response.data.length > 0) {
                return {
                    lat: parseFloat(response.data[0].lat),
                    lng: parseFloat(response.data[0].lon),
                };
            } else {
                throw new Error('Endereço não encontrado');
            }
        } catch (error) {
            console.error('Erro ao obter coordenadas:', error.response.data);
            return null;
        }
    };

    const limparRota = async () => {
        setDestinationCoords([])
        setDestinationCep("")
        setDestinationNumber("")
        setHasRota(false)
    }

    const showToast = (message, position, severity) => {
        setToast({ visible: true, message, position, severity });

        // Esconde o toast após 3 segundos
        setTimeout(() => setToast({ ...toast, visible: false }), 3000);
    };

    if (!currentLocation) return <Text>Carregando mapa...</Text>;

    return (
        <View style={{ flex: 1, position: 'relative' }}>
            <MapView
                style={{ flex: 1 }}
                region={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
                }}
                showsUserLocation={true}
                followUserLocation={true}
                ref={mapRef}
            >
                {destinationCoords.length > 0 && (
                    <Marker
                        coordinate={{
                            latitude: destinationCoords[destinationCoords.length - 1].latitude,
                            longitude: destinationCoords[destinationCoords.length - 1].longitude,
                        }}
                    />
                )}
                {/* Desenhando a rota manualmente */}
                {destinationCoords.length > 0 && (
                    <Polyline
                        coordinates={destinationCoords}
                        strokeWidth={4}
                        strokeColor={colors.blue[500]}
                    />
                )}
            </MapView>

            {/* Inputs para Destino */}
            <View style={{ position: 'absolute', top: 0, width: '85%', padding: 10 }}>
                <View style={{ flex: 1 }}>
                    <Accordion title="Rota" index={0} activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
                        <TextInput
                            style={styles.input}
                            placeholder="CEP de Destino"
                            value={destinationCep}
                            onChangeText={setDestinationCep}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Número de Destino"
                            value={destinationNumber}
                            onChangeText={setDestinationNumber}
                            keyboardType="numeric"
                        />

                        <Botao onPress={calculateRoute}>
                            <View style={styles.buttonContent}>
                                {isLoading ? (
                                    <>
                                        <ActivityIndicator
                                            style={styles.loadingIndicator}
                                            size="small"
                                            color="#fff"
                                        />
                                        <Text style={styles.buttonText}>Trançando a rota...</Text>
                                    </>
                                ) : (
                                    <Text style={styles.buttonText}>Traçar Rota</Text>
                                )}
                            </View>
                        </Botao>
                        {hasRota && (
                            <Botao onPress={limparRota} severity="error">
                                <View style={styles.buttonContent}>
                                    {isLoading ? (
                                        <>
                                            <ActivityIndicator
                                                style={styles.loadingIndicator}
                                                size="small"
                                                color="#fff"
                                            />
                                            <Text style={styles.buttonText}>Limpando a rota...</Text>
                                        </>
                                    ) : (
                                        <Text style={styles.buttonText}>Limpar Rota</Text>
                                    )}
                                </View>
                            </Botao>
                        )}
                    </Accordion>
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
    );
}
