import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Image, StyleSheet, ScrollView } from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../assets/css/styles';
import { FontAwesome5 } from '@expo/vector-icons';
import Card from '../components/Card';
import { colors, display, fontSize, fontWeights, gap, margins } from '../assets/css/primeflex';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';

export default function PerfilPublicoScreen({ navigation, route }) {
    const { id } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [rotas, setRotas] = useState([]);

    useFocusEffect(
        useCallback(() => {
            getPublicUser();
        }, [])
    );

    const getPublicUser = async () => {
        setIsLoading(true)
        try {
            const token = await AsyncStorage.getItem('token');
            const user = JSON.parse(await AsyncStorage.getItem('user')); ''

            const response = await api.get(`/user/public/show/${user.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUser(response.data.data)
        } catch (error) {
            console.log('Erro ao enviar o formulário:', error);
        } finally {
            setIsLoading(false)
        }
    }

    const calculateRegion = (coordinates) => {
        let minLat = Math.min(...coordinates.map((coord) => coord.latitude));
        let maxLat = Math.max(...coordinates.map((coord) => coord.latitude));
        let minLng = Math.min(...coordinates.map((coord) => coord.longitude));
        let maxLng = Math.max(...coordinates.map((coord) => coord.longitude));

        const latitudeDelta = maxLat - minLat;
        const longitudeDelta = maxLng - minLng;

        return {
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: latitudeDelta * 1.1, // Adiciona margem
            longitudeDelta: longitudeDelta * 1.1, // Adiciona margem
        };
    };

    // Função para calcular a distância entre dois pontos (Fórmula de Haversine)
    const haversineDistance = (coord1, coord2) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; // Raio da Terra em km

        const dLat = toRad(coord2.latitude - coord1.latitude);
        const dLon = toRad(coord2.longitude - coord1.longitude);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(coord1.latitude)) *
            Math.cos(toRad(coord2.latitude)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distância em km
    };

    // Função para calcular métricas da rota
    const calculateMetrics = (rota) => {
        let totalDistance = 0;
        let totalTime = 0;

        for (let i = 1; i < rota.length; i++) {
            totalDistance += haversineDistance(rota[i - 1], rota[i]);
            if (rota[i].timestamp && rota[i - 1].timestamp) {
                totalTime += (rota[i].timestamp - rota[i - 1].timestamp) / 3600; // Tempo em horas
            }
        }

        const averageSpeed = totalTime > 0 ? totalDistance / totalTime : 0; // km/h
        return {
            distance: totalDistance.toFixed(2), // em km
            time: totalTime.toFixed(2),         // em horas
            speed: averageSpeed.toFixed(2),     // em km/h
        };
    };

    const rotaUsuario = async (id) => {
        navigation.navigate('RotaUsuarioScreen', { id });
    }

    const navigateRotasPublicas = () => {
        navigation.navigate('RotasPublicasUsuarioScreen')
    }

    return (
        <View style={{ flex: 1, padding: 10, paddingTop: 20 }}>
            {isLoading ? (
                <>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color="#007BFF" />
                    </View>
                </>
            ) : (
                <View style={{ flex: 1 }}>
                    <ScrollView style={{ flex: 1 }}>
                        {/* Card 1: Avatar */}
                        <View style={[styles.card, { gap: 10, flexDirection: 'row', alignItems: 'center' }]}>
                            <Image
                                source={{ uri: user?.img_perfil || 'https://i.ibb.co/5kkRBSS/default-Avatar.png' }}
                                style={styles.avatar}
                                onError={() => console.log('Erro ao carregar a imagem.')}
                            />

                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                                {user?.nome}
                            </Text>
                        </View>

                        <Card
                            borderBottomColor={colors.blueGray[500]}
                            title={
                                <View style={[display.row, display.justifyContentBetween]}>
                                    <Text style={[fontWeights['bold'], fontSize['lg'], { color: colors.blueGray[500] }]}>
                                        Quadro de Medalhas
                                    </Text>
                                    <FontAwesome5 name="medal" size={20} style={[{ color: colors.blueGray[500], marginRight: 8 }]} />
                                </View>
                            }
                            content={
                                <Text>
                                    Aqui será o quadro de medalhas
                                </Text>
                            }
                        />

                        {/* Card de rotas */}
                        <Card
                            borderBottomColor={colors.teal[500]}
                            content={
                                <TouchableOpacity
                                    onPress={navigateRotasPublicas}
                                    style={[display.row, display.justifyContentBetween]}
                                >
                                    <View style={[display.row, display.alignItemsCenter, gap[5]]}>
                                        <FontAwesome5 name="route" size={20} style={[{ color: colors.teal[500], marginRight: 8 }]} />
                                        <View>
                                            <Text style={[fontWeights['bold'], fontSize['lg'], { color: colors.teal[500] }]}>
                                                Rotas
                                            </Text>
                                            <Text style={[fontWeights['bold'], fontSize['sm'], { color: colors.teal[500] }]}>
                                                {user?.totalRotas}
                                            </Text>
                                        </View>
                                    </View>
                                    <FontAwesome5 name="arrow-right" size={20} style={[{ color: colors.teal[500], marginRight: 8 }]} />
                                </TouchableOpacity>
                            }
                        />
                    </ScrollView>
                </View>
            )}
        </View >
    );
}

const styles2 = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: 200
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

    },
    distanceText: {
        fontSize: 8,
        color: '#000',
    },
});