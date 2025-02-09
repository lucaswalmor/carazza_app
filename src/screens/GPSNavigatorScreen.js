import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, Button, Alert } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import Accordion from '../components/Accordion';
import { colors } from '../assets/css/primeflex';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAu4BOiZIT9Y4eHn81U5Uf98ZTBt8jUjyU';

export default function GPSNavigatorScreen() {
    const [destinationCep, setDestinationCep] = useState('');
    const [destinationNumber, setDestinationNumber] = useState('');
    const [currentLocation, setCurrentLocation] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão de localização negada');
                return;
            }

            // Inicializa a posição do usuário
            let location = await Location.getCurrentPositionAsync({});
            setCurrentLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            // Monitorar a posição do usuário em tempo real
            Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 10, // Atualizar a cada 10 metros
                },
                (location) => {
                    const { latitude, longitude } = location.coords;
                    setCurrentLocation({ latitude, longitude });
                    checkDistance(latitude, longitude);  // Verifica a distância sempre que a posição mudar
                }
            );
        })();
    }, []);

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
        if (!currentLocation) return;

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
                    const points = directionsResponse.data.routes[0].overview_polyline.points;
                    const decodedPoints = decodePolyline(points);
                    setRouteCoordinates(decodedPoints);
                } else {
                    console.error('Erro ao calcular a rota:', directionsResponse.data.error_message);
                }
            } else {
                Alert.alert('Erro ao obter coordenadas do destino');
            }
        } catch (error) {
            console.error('Erro ao calcular a rota:', error);
        }
    };

    const decodePolyline = (encoded) => {
        const points = [];
        let index = 0;
        const len = encoded.length;
        let lat = 0, lng = 0;

        while (index < len) {
            let b, shift = 0, result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
            lng += dlng;

            points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
        }

        return points;
    };

    const checkDistance = (latitude, longitude) => {
        if (routeCoordinates.length === 0) return;

        // Função para calcular a distância de um ponto a uma linha poligonal
        const haversine = (lat1, lon1, lat2, lon2) => {
            const toRad = (value) => (value * Math.PI) / 180;
            const R = 6371000; // Raio da Terra em metros
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; // Distância em metros
        };

        let minDistance = Infinity;
        for (let i = 0; i < routeCoordinates.length - 1; i++) {
            const start = routeCoordinates[i];
            const end = routeCoordinates[i + 1];
            const dist = haversine(latitude, longitude, start.latitude, start.longitude);
            if (dist < minDistance) {
                minDistance = dist;
            }
        }

        // Se a distância for maior que 50 metros, recalcule a rota
        if (minDistance > 50) {
            calculateRoute();
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={{
                    latitude: currentLocation?.latitude || -23.5505,
                    longitude: currentLocation?.longitude || -46.6333,
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                }}
                showsUserLocation={true}
                followUserLocation={true}
            >
                {routeCoordinates.length > 0 && (
                    <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor={colors.blue[500]} />
                )}
            </MapView>

            {/* Inputs para Destino */}
            <View style={styles.inputsContainer}>
                <View style={{flex: 1}}>
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
                        <Button title="Traçar Rota" onPress={calculateRoute} />
                    </Accordion>
                </View>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
    },
    map: {
        flex: 1,
    },
    inputsContainer: {
        position: 'absolute',
        top: 0,
        width: '85%',
        padding: 10
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
});
