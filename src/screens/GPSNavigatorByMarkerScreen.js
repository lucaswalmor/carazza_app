import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, TextInput, Modal, TouchableOpacity, Text, ActivityIndicator, Switch } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import styles from "../assets/css/styles";
import { borders, colors, display, fontSize, gap, paddings } from "../assets/css/primeflex";
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import api from "../services/api";
import decodePolyline from "../services/decodePolyline";
import pesquisacep from "../services/viacep";
import Toast from "../components/Toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const LOCATIONIQ_API_KEY = 'pk.0fc5b34da0f6795efb98e3076f9d3c83';

const GPSNavigatorScreen = ({ route }) => {
    const mapRef = useRef(null);
    const [cep, setCep] = useState("");
    const [nomeRota, setNomeRota] = useState("");
    const [routes, setRoutes] = useState([]);
    const [numero, setNumero] = useState("");
    const [distance, setDistance] = useState(0);
    const [location, setLocation] = useState(null);
    const [tracking, setTracking] = useState(false);
    const [hasRoute, setHasRoute] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [finishRoute, setFinishRoute] = useState(false);
    const [inputVisible, setInputVisible] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const { destLatitude, destLongitude } = route.params || {};
    const [modalSalvarRota, setModalSalvarRota] = useState(false);
    const [destinationCoords, setDestinationCoords] = useState([]);
    const [bolDisponivelPerfil, setBolDisponivelPerfil] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', position: 'bottom', severity: '' });

    useEffect(() => {
        const requestLocationPermission = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();

            let location = await Location.getCurrentPositionAsync({});

            setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (destLatitude && destLongitude) {
                setModalVisible(true)
            }
        };

        requestLocationPermission();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (location) {
                setModalVisible(true)
            }
        }, [])
    );

    // Fica vendo a posicao atual do usuario
    useEffect(() => {
        Location.watchPositionAsync(
            {
                accuracy: Location.LocationAccuracy.BestForNavigation,
                timeInterval: 1000,
                distanceInterval: 1,
            },
            (response) => {
                const newLocation = {
                    latitude: response.coords.latitude,
                    longitude: response.coords.longitude,
                };

                // Salva a nova localizacao atual do usuario conforme ele se move
                setLocation(newLocation);

                // Atualiza a visualizacao do mapa conforme o usuario se move
                if (mapRef.current) {
                    mapRef.current.animateCamera({
                        center: newLocation,
                        pitch: 60,
                        heading: response.coords.heading || 0,
                    });
                }

                // Adiciona ao array de rotas a rota que o usuario esta fazendo neste momento, 
                // e também calcula a distancia percorrida se o usuario estiver gravando a rota
                if (tracking) {
                    setRoutes((prevRoute) => {
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
    }, [destinationCoords, tracking]);

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

    const consultarCep = async () => {
        const response = await pesquisacep(cep);

        if (response.message) {
            showToast(response.message, 'top', 'danger')
            return;
        }

        const destinationAddress = `${response.logradouro}, ${numero}, ${response.bairro}, ${response.localidade}, ${response.estado}`;

        try {
            const response = await api.get(`https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(destinationAddress)}&format=json`);

            if (response.data.length > 0) {
                return {
                    latitude: parseFloat(response.data[0].lat),
                    longitude: parseFloat(response.data[0].lon),
                };
            } else {
                throw new Error('Endereço não encontrado');
            }
        } catch (error) {
            if (error) {

            }
        }
    }

    const calculateRoute = async () => {
        setIsLoading(true);

        const destino = {
            latitude: 0,
            longitude: 0
        }
        
        if (cep && numero) {
            const destinationCoords = await consultarCep();

            destino.latitude = destinationCoords.latitude
            destino.longitude = destinationCoords.longitude
        } else {
            destino.latitude = destLatitude
            destino.longitude = destLongitude
        }

        try {
            const url = `https://us1.locationiq.com/v1/directions/driving/${location.longitude},${location.latitude};${destino.longitude},${destino.latitude}?key=${LOCATIONIQ_API_KEY}&steps=true&geometries=polyline&overview=full`

            const response = await api.get(url)

            if (response.data.routes.length > 0 && response.data.routes[0].geometry) {
                const polyline = decodePolyline(response.data.routes[0].geometry);

                setDestinationCoords(polyline)
                setInputVisible(false)
                setHasRoute(true)
                setModalVisible(false)
            } else {
                throw new Error('Nenhuma rota encontrada');
            }
        } catch (error) {
            showToast('Estamos recebendo muitas solicitações no momento, por favor tente novamente em alguns instantes', 'top', 'danger')
        } finally {
            setIsLoading(false)
        }
    }

    const clearRoute = async () => {
        setDestinationCoords([])
        setCep("")
        setNumero("")
        setHasRoute(false)
    }

    const changeInputVisible = () => {
        setInputVisible(!inputVisible)
    }

    const showToast = (message, position, severity) => {
        setToast({ visible: true, message, position, severity });

        // Esconde o toast após 3 segundos
        setTimeout(() => setToast({ ...toast, visible: false }), 3000);
    };

    const saveRoute = async () => {
        const token = await AsyncStorage.getItem('token');

        const data = {
            route: routes,
            distance: distance,
            bolDisponivelPerfil: bolDisponivelPerfil,
            titulo: nomeRota
        }

        try {
            setIsLoading(true)
            const response = await api.post('/user/store/rotas', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            })
            setDestinationCoords([])
            setCep("")
            setNumero("")
            setHasRoute(false)
            setFinishRoute(false)
            setDistance(0)
            setRoutes([])

            showToast(response.data.message, 'top', 'success')
        } catch (error) {
            showToast(error.response.data.error, 'top', 'danger')
        } finally {
            setIsLoading(false)
        }
    }

    const startTracking = async () => {
        setTracking(true);
        setDistance(0)
        setRoutes([])
    }

    const stopTracking = async () => {
        setTracking(false);

        setFinishRoute(true)
    }

    return (
        <View style={{ flex: 1, position: 'relative', width: '100%' }}>
            {location && (
                <MapView
                    ref={mapRef}
                    style={{ width: '100%', height: '100%' }}
                    initialRegion={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.002,
                        longitudeDelta: 0.002,
                    }}
                    showsUserLocation={true}
                    followUserLocation={true}
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

                    {/* Desenhando a rota manualmente */}
                    {tracking && routes.length > 0 && (
                        <Polyline
                            coordinates={routes}
                            strokeWidth={4}
                            strokeColor={colors.blue[900]}
                        />
                    )}
                </MapView>
            )}

            {/* Container que mostra a distancia percorrida */}
            {tracking && (
                <View style={[styles2.distanceContainer, display.row, display.justifyContentBetween]}>
                    <Text style={styles2.distanceText}>
                        Distância: {!tracking ? '0.00' : distance.toFixed(2)} km
                    </Text>
                </View>
            )}

            {/* Container de botoes da parte de baixo da tela */}
            <View style={{ position: 'absolute', bottom: 15, width: '100%', paddingLeft: 20, paddingRight: 20 }}>
                <View style={[display.row, display.justifyContentBetween]}>
                    <TouchableOpacity
                        onPress={() => changeInputVisible()}
                        style={[
                            {
                                backgroundColor: colors.blue[500],
                                padding: 10,
                                alignItems: 'center'
                            },
                            display.row,
                            gap[2],
                            borders.borderCircle
                        ]}
                    >
                        <FontAwesome5 name={!inputVisible ? 'arrow-up' : 'arrow-down'} size={16} color='#FFF' />
                        <Text style={{ color: colors.alpha[1000] }}>
                            Traçar
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={tracking ? stopTracking : startTracking}
                        style={[
                            {
                                backgroundColor: !tracking ? colors.blue[900] : colors.red[500],
                                padding: 10,
                                justifyContent: 'center',
                                alignItems: 'center'
                            },
                            display.row,
                            gap[2],
                            borders.borderCircle
                        ]}
                    >
                        <FontAwesome5 name={tracking ? 'stop-circle' : 'play-circle'} size={16} color='#FFF' />
                        <Text style={{ color: colors.alpha[1000] }}>
                            {tracking ? 'Parar' : 'Gravar'}
                        </Text>
                    </TouchableOpacity>

                    {finishRoute && (
                        <TouchableOpacity
                            onPress={() => setModalSalvarRota(true)}
                            style={[
                                {
                                    backgroundColor: colors.indigo['600'],
                                    padding: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                },
                                display.row,
                                gap[2],
                                borders.borderCircle
                            ]}
                        >
                            <FontAwesome5 name="cloud-upload-alt" size={16} color='#FFF' />
                            <Text style={[{ color: colors.alpha[1000] }]}>
                                Salvar
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Container de inputs de traçar rotas */}
            {!inputVisible && (
                <View style={{ position: 'absolute', bottom: 60, width: '100%', padding: 10 }}>
                    <View style={[display.row, display.alignItemsCenter, display.justifyContentBetween]}>
                        <View style={{ width: '50%' }}>
                            <TextInput
                                style={[{ width: '100%', backgroundColor: colors.blue[200], height: 40, paddingLeft: 10, paddingRight: 10 }, borders.borderCircle]}
                                value={cep}
                                onChangeText={(text) => setCep(text)}
                                keyboardType="numeric"
                                placeholder="CEP"
                            />
                        </View>
                        <View style={{ width: '25%' }}>
                            <TextInput
                                style={[{ width: '100%', backgroundColor: colors.blue[200], height: 40, paddingLeft: 10, paddingRight: 10 }, borders.borderCircle]}
                                value={numero}
                                onChangeText={(text) => setNumero(text)}
                                keyboardType="numeric"
                                placeholder="Número"
                            />
                        </View>

                        <View style={{ width: '20%', flexDirection: 'row', justifyContent: 'center' }}>
                            {!hasRoute ? (
                                <TouchableOpacity
                                    onPress={() => calculateRoute()}
                                    style={[{ backgroundColor: colors.blue[500], padding: 12 }, borders.borderCircle]}
                                >
                                    {!isLoading ? (
                                        <FontAwesome5 name='search' size={12} color='#FFF' />
                                    ) : (
                                        <ActivityIndicator size={12} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            ) : (
                                <View style={[display.row, gap[1]]}>
                                    <TouchableOpacity
                                        onPress={() => clearRoute()}
                                        style={[{ backgroundColor: colors.red[500], padding: 12 }, borders.borderCircle]}
                                    >
                                        {!isLoading ? (
                                            <FontAwesome6 name='xmark' size={12} color='#FFF' />
                                        ) : (
                                            <ActivityIndicator size={12} color="#fff" />
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => calculateRoute()}
                                        style={[{ backgroundColor: colors.orange[500], padding: 12 }, borders.borderCircle]}
                                    >
                                        {!isLoading ? (
                                            <FontAwesome6 name='arrows-rotate' size={12} color='#FFF' />
                                        ) : (
                                            <ActivityIndicator size={12} color="#fff" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            )}

            {toast.visible && (
                <Toast
                    message={toast.message}
                    position={toast.position}
                    onClose={() => setToast({ ...toast, visible: false })}
                    severity={toast.severity}
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalSalvarRota}
                onRequestClose={() => setModalSalvarRota(false)}
            >
                <View style={styles.modalCenteredView}>
                    <View style={styles.modalView}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nome da rota"
                            value={nomeRota}
                            onChangeText={setNomeRota}
                        />

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 15 }}>
                            <Switch
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={bolDisponivelPerfil ? '#1d1e22' : '#f4f3f4'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={() => setBolDisponivelPerfil(previousState => !previousState)}
                                value={bolDisponivelPerfil}
                            />


                            <Text
                                style={[
                                    fontSize['base'],
                                    {
                                        color: colors.blue[900],
                                        textAlign: 'center',
                                        flexWrap: 'wrap',
                                        maxWidth: 250,
                                    }
                                ]}
                            >
                                Disponibilizar esta rota no seu perfil ?
                            </Text>
                        </View>

                        <View style={[display.row, display.justifyContentBetween]}>
                            <TouchableOpacity onPress={saveRoute} style={styles.button}>
                                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Salvar Rota</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setModalSalvarRota(false)} style={styles.buttonDanger}>
                                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
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
            </Modal>
        </View>
    );
};

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


export default GPSNavigatorScreen;
