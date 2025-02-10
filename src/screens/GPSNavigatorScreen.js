import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import axios from 'axios';
import Accordion from '../components/Accordion';
import styles from '../assets/css/styles';
import Botao from '../components/Botao';
import { colors } from '../assets/css/primeflex';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAu4BOiZIT9Y4eHn81U5Uf98ZTBt8jUjyU';

export default function GPSNavigatorScreen() {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [destinationCep, setDestinationCep] = useState('');
    const [destinationNumber, setDestinationNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);
    const mapRef = useRef(null);

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
        currentPosition();
    }, [])

    const currentPosition = () => {
        Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                distanceInterval: 100,
            },
            (location) => {
                const { latitude, longitude } = location.coords;

                if (mapRef.current) {
                    mapRef.current.animateCamera({
                        center: location.coords,
                        pitch: 50,
                        heading: location.coords.heading || 0,
                    });
                }

                setCurrentLocation({ latitude: latitude, longitude: longitude })
            }
        );
    }

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

    const calculateRoute = async () => {
        setIsLoading(true)

        const getDestinationCepAddress = await pesquisacep(destinationCep);
        const destinationAddress = `${getDestinationCepAddress.logradouro}, ${destinationNumber}, ${getDestinationCepAddress.bairro}, ${getDestinationCepAddress.localidade}, ${getDestinationCepAddress.estado}`;

        const geocodeEndpoint = (address) =>
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

        try {
            const destinationResponse = await axios.get(geocodeEndpoint(destinationAddress));

            if (destinationResponse.data.status === 'OK') {
                const destinationCoords = destinationResponse.data.results[0].geometry.location;

                // Chamada para calcular a rota
                const directionsEndpoint = `https://maps.googleapis.com/maps/api/directions/json?origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${destinationCoords.lat},${destinationCoords.lng}&key=${GOOGLE_MAPS_API_KEY}`;
                const directionsResponse = await axios.get(directionsEndpoint);

                if (directionsResponse.data.status === 'OK') {

                    const destinationCoords = destinationResponse.data.results[0].geometry.location;
                    setDestinationCoords(destinationCoords)
                } else {
                    console.error('Erro ao calcular a rota:', directionsResponse.data.error_message);
                }
            } else {
                Alert.alert('Erro ao obter coordenadas do destino');
            }
        } catch (error) {
            console.error('Erro ao calcular a rota:', error);
        } finally {
            setIsLoading(false)
        }
    };

    if (!currentLocation) return <Text>Carregando mapa...</Text>;

    return (
        <View style={{ flex: 1, position: 'relative' }}>
            <MapView
                style={{ flex: 1 }}
                region={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                }}
                showsUserLocation={true}
                followUserLocation={true}
                ref={mapRef}
            >
                {destinationCoords && (
                    <MapViewDirections
                        origin={currentLocation}
                        destination={{
                            latitude: destinationCoords.lat,
                            longitude: destinationCoords.lng,
                        }}
                        apikey={GOOGLE_MAPS_API_KEY}
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
                                    <Text style={{ color: colors.alpha[1000] }}>Traçar Rota</Text>
                                )}
                            </View>
                        </Botao>
                    </Accordion>
                </View>
            </View>
        </View>
    );
}
