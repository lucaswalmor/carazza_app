import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, Modal as RNModal, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import Accordion from '../components/Accordion';
import styles from '../assets/css/styles';
import Botao from '../components/Botao';
import { colors } from '../assets/css/primeflex';
import { useFocusEffect } from '@react-navigation/native';

const LOCATIONIQ_API_KEY = 'pk.7179dc15856b3b310d544e4c66101b1b';

export default function GPSNavigatorByMarkerScreen({ route }) {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState([]);
    const [destinationCep, setDestinationCep] = useState('');
    const [destinationNumber, setDestinationNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasRota, setHasRota] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);
    const mapRef = useRef(null);
    const [hasRecalculated, setHasRecalculated] = useState(false);
    const { destLatitude, destLongitude } = route.params || {};
    const [modalVisible, setModalVisible] = useState(false);
    const pitch = useRef(60)

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

            if (destLatitude && destLongitude) {
                setModalVisible(true)
            }
        })();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (currentLocation) {
                setModalVisible(true)
            }
        }, [])
    );

    useEffect(() => {
        let locationSubscription = null; // Variável para armazenar a Subscription

        const startWatchingPosition = async () => {
            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 10, // Reduzi para testar melhor
                },
                (location) => {
                    const { latitude, longitude } = location.coords;
                    setCurrentLocation({ latitude, longitude });

                    if (mapRef.current) {
                        mapRef.current.animateCamera({
                            center: location.coords,
                            pitch: pitch,
                            heading: location.coords.heading || 0,
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

                            // Reseta a flag depois de um tempo para permitir um novo recálculo, se necessário
                            setTimeout(() => setHasRecalculated(false), 5000); // Aguarda 5 segundos antes de permitir um novo recálculo
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
    }, [destinationCoords, hasRecalculated, pitch]);

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
            if (cep.length !== 8) return;
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao buscar o CEP:', error);
        }
    };

    // Função para calcular a rota
    const calculateRoute = async () => {
        setIsLoading(true);

        try {
            let destinationCoords = null;

            if (destLatitude && destLongitude) {
                // Se recebeu as props, usa diretamente
                destinationCoords = { lat: destLatitude, lng: destLongitude };
            } else {
                // Se não recebeu, busca pelo CEP digitado
                const getDestinationCepAddress = await pesquisacep(destinationCep);

                if (!getDestinationCepAddress) {
                    Alert.alert("Erro ao buscar endereço pelo CEP");
                    setIsLoading(false);
                    return;
                }

                const destinationAddress = `${getDestinationCepAddress.logradouro}, ${destinationNumber}, ${getDestinationCepAddress.bairro}, ${getDestinationCepAddress.localidade}, ${getDestinationCepAddress.estado}`;

                destinationCoords = await getCoordinatesFromAddress(destinationAddress);
            }

            if (!destinationCoords) {
                Alert.alert('Erro ao obter coordenadas do destino');
                return;
            }

            const routeData = await getRouteFromLocationIQ(currentLocation, destinationCoords);

            if (routeData) {
                setHasRota(true);
                setModalVisible(false)
                setDestinationCoords(routeData);
            }
        } catch (error) {
            if (error.response) {
                console.error(`Erro ao calcular a rota: ${error.response.status} - ${error.response.data}`);
            } else if (error.request) {
                console.error('Erro ao calcular a rota: Nenhuma resposta recebida do servidor.');
            } else {
                console.error('Erro ao calcular a rota:', error.message);
            }
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

    if (!currentLocation) return <Text>Carregando mapa...</Text>;

    return (
        <View style={{ flex: 1, position: 'relative' }}>
            <MapView
                style={{ flex: 1 }}
                region={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                followUserLocation={true}
                ref={mapRef}
            >
                {destinationCoords.length > 0 && (
                    <Marker
                        coordinate={destinationCoords[destinationCoords.length - 1]}
                        title="Destino"
                        description="Última posição do trajeto"
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

            <RNModal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalCenteredView}>
                    <View style={styles.modalView}>
                        <Text style={{ marginBottom: 20 }}>
                            Identificamos uma nova rota, o que gostaria de fazer?
                        </Text>

                        <TouchableOpacity onPress={() => calculateRoute()} style={{ marginBottom: 20, flexDirection: 'row' }}>
                            <Text style={{ fontSize: 14, color: colors.blue[500] }}>Traçar rota? </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginBottom: 20, flexDirection: 'row' }}>
                            <Text style={{ fontSize: 14 }}>Fechar Janela </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </RNModal>
        </View>
    );
}
