import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    StyleSheet,
    TextInput,
    Modal,
    TouchableOpacity,
    Text,
    ActivityIndicator,
    Switch,
    Platform,
    KeyboardAvoidingView,
    Keyboard,
    TouchableWithoutFeedback
} from "react-native";
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
import { setupDatabase, saveRouteToDB, loadRouteFromDB, clearRouteDB } from "../database/database";

const LOCATIONIQ_API_KEY = 'pk.0fc5b34da0f6795efb98e3076f9d3c83';

const GPSNavigatorScreen = ({ route }) => {
    const mapRef = useRef(null);
    const [routes, setRoutes] = useState([]);
    const [location, setLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSaveRoute, setIsLoadingSaveRoute] = useState(false);
    const [inputVisible, setInputVisible] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const { destLatitude, destLongitude } = route.params || {};
    const [modalSalvarRota, setModalSalvarRota] = useState(false);
    const [destinationCoords, setDestinationCoords] = useState([]);
    const [toast, setToast] = useState({ visible: false, message: '', position: 'bottom', severity: '' });
    const [routeState, setRouteState] = useState({
        cep: "",
        numero: "",
        nomeRota: "",
        distance: 0,
        hasRoute: false,
        finishRoute: false,
        tracking: false,
        bolDisponivelPerfil: true
    });

    // pede permissoes de localizacao ao usuari
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

    // inicia o banco de dados e carrega as rotas salvas caso exista
    useEffect(() => {
        const initDB = async () => {
            await setupDatabase();
            const savedRoute = await loadRouteFromDB();
            if (Array.isArray(savedRoute) && savedRoute.length > 0) {
                setRoutes(savedRoute);
                setLocation(savedRoute[savedRoute.length - 1]);
                setRouteState((prevState) => ({
                    ...prevState,
                    tracking: true,
                }));
            }
        };

        initDB();
    }, []);

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

                if (routeState.tracking) {
                    setRoutes((prevRoute) => {
                        if (prevRoute.length > 0) {
                            const lastPoint = prevRoute[prevRoute.length - 1];
                            const newDistance = calculateDistance(lastPoint, response.coords);
                            setRouteState((prevState) => ({
                                ...prevState,
                                distance: prevState.distance + newDistance,
                            }));
                        }

                        return [...prevRoute, response.coords];
                    });
                    saveRouteToDB(response.coords.latitude, response.coords.longitude);
                }
            }
        );
    }, [destinationCoords, routeState.tracking]);

    const saveRoute = async () => {
        setIsLoadingSaveRoute(true)
        const token = await AsyncStorage.getItem('token');

        const data = {
            route: routes,
            distance: routeState.distance,
            bolDisponivelPerfil: routeState.bolDisponivelPerfil,
            titulo: routeState.nomeRota
        }

        try {
            setIsLoading(true)
            const response = await api.post('/user/store/rotas', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            })
            resetRouteState();

            showToast(response.data.message, 'top', 'success')
        } catch (error) {
            const errorMessage = error?.response?.data?.error || 'Erro desconhecido';
            showToast(errorMessage, 'top', 'danger');
        } finally {
            setIsLoadingSaveRoute(false)
        }
    }

    const resetRouteState = async () => {
        const response = await clearRouteDB();

        if (response === 'ok') {
            setDestinationCoords([]);
            setRouteState(prevState => ({
                ...prevState,
                cep: "",
                numero: "",
                distance: 0,
                hasRoute: false,
                finishRoute: false,
                nomeRota: false,
            }));
            setRoutes([]);
            setModalSalvarRota(false);
        }
    };

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
        const response = await pesquisacep(routeState.cep);

        if (response.message) {
            showToast(response.message, 'top', 'danger')
            return;
        }

        const destinationAddress = `${response.logradouro}, ${routeState.numero}, ${response.bairro}, ${response.localidade}, ${response.estado}`;

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

        if (routeState.cep && routeState.numero) {
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
                setRouteState(prevState => ({ ...prevState, hasRoute: true }))
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
        setRouteState(prevState => ({ ...prevState, cep: "", numero: "", hasRoute: false }))
    }

    const changeInputVisible = () => {
        setInputVisible(!inputVisible)
    }

    const showToast = (message, position, severity) => {
        setToast({ visible: true, message, position, severity });

        // Esconde o toast após 3 segundos
        setTimeout(() => setToast({ ...toast, visible: false }), 3000);
    };

    const startTracking = async () => {
        setRouteState(prevState => ({
            ...prevState,
            distance: 0,
            tracking: true,
        }))
        setRoutes([])
    }

    const stopTracking = async () => {
        setRouteState(prevState => ({
            ...prevState,
            finishRoute: true,
            tracking: false,
        }))
    }

    if (!location) {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator size="large" color="#0000ff" /></View>;
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : ''}
                style={{ flex: 1 }}
            >
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
                            {routeState.tracking && routes.length > 0 && (
                                <Polyline
                                    coordinates={routes}
                                    strokeWidth={4}
                                    strokeColor={colors.blue[900]}
                                />
                            )}
                        </MapView>
                    )}

                    {/* Container que mostra a distancia percorrida */}
                    {routeState.tracking && (
                        <View style={[styles2.distanceContainer, display.row, display.justifyContentBetween]}>
                            <Text style={styles2.distanceText}>
                                Distância: {!routeState.tracking ? '0.00' : routeState.distance.toFixed(2)} km
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
                                onPress={routeState.tracking ? stopTracking : startTracking}
                                style={[
                                    {
                                        backgroundColor: !routeState.tracking ? colors.blue[900] : colors.red[500],
                                        padding: 10,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    },
                                    display.row,
                                    gap[2],
                                    borders.borderCircle
                                ]}
                            >
                                <FontAwesome5 name={routeState.tracking ? 'stop-circle' : 'play-circle'} size={16} color='#FFF' />
                                <Text style={{ color: colors.alpha[1000] }}>
                                    {routeState.tracking ? 'Parar' : 'Gravar'}
                                </Text>
                            </TouchableOpacity>

                            {routeState.finishRoute && (
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
                                        value={routeState.cep}
                                        onChangeText={(text) => setRouteState(prevState => ({ ...prevState, cep: text }))}
                                        keyboardType="numeric"
                                        placeholder="CEP"
                                    />
                                </View>
                                <View style={{ width: '25%' }}>
                                    <TextInput
                                        style={[{ width: '100%', backgroundColor: colors.blue[200], height: 40, paddingLeft: 10, paddingRight: 10 }, borders.borderCircle]}
                                        value={routeState.numero}
                                        onChangeText={(text) => setRouteState(prevState => ({ ...prevState, numero: text }))}
                                        keyboardType="numeric"
                                        placeholder="Número"
                                    />
                                </View>

                                <View style={{ width: '20%', flexDirection: 'row', justifyContent: 'center' }}>
                                    {!routeState.hasRoute ? (
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
                                    value={routeState.nomeRota}
                                    onChangeText={(text) => setRouteState(prevState => ({ ...prevState, nomeRota: text }))}
                                />

                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 15 }}>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                                        thumbColor={routeState.bolDisponivelPerfil ? '#007BFF' : '#f4f3f4'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={() => setRouteState(prevState => ({ ...prevState, bolDisponivelPerfil: !prevState.bolDisponivelPerfil }))}
                                        value={routeState.bolDisponivelPerfil}
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
                                    <TouchableOpacity onPress={saveRoute} style={styles.button} disabled={isLoadingSaveRoute}>
                                        {isLoadingSaveRoute ? (
                                            <View style={[display.row, gap[2]]}>
                                                <ActivityIndicator
                                                    style={styles.loadingIndicator}
                                                    size="small"
                                                    color="#fff"
                                                />
                                                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Salvando...</Text>
                                            </View>
                                        ) : (
                                            <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Salvar Rota</Text>
                                        )}
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
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
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
