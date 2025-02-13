import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Image, StyleSheet, ScrollView } from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../assets/css/styles';
import { FontAwesome5 } from '@expo/vector-icons';
import Card from '../components/Card';
import { borders, colors, display, fontSize, fontWeights, gap, margins, paddings, widths } from '../assets/css/primeflex';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import Toast from '../components/Toast';

export default function PerfilPublicoScreen({ navigation, route }) {
    const { id } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [toast, setToast] = useState({ visible: false, message: '', position: 'bottom', severity: '' });
    const [conquistas, setConquistas] = useState(null);

    useFocusEffect(
        useCallback(() => {
            getPublicUser();
        }, [])
    );

    const showToast = (message, position, severity) => {
        setToast({ visible: true, message, position, severity });

        // Esconde o toast após 3 segundos
        setTimeout(() => setToast({ ...toast, visible: false }), 3000);
    };

    const getPublicUser = async () => {
        setIsLoading(true)
        try {
            const token = await AsyncStorage.getItem('token');

            const response = await api.get(`/user/public/show/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setConquistas(response.data.data.conquistas)
            setUser(response.data.data)
        } catch (error) {
            console.log('Erro ao enviar o formulário:', error);
        } finally {
            setIsLoading(false)
        }
    }

    const seguir = async () => {
        setIsLoading(true)
        try {
            const token = await AsyncStorage.getItem('token');

            const response = await api.get(`/user/seguir/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            showToast(response.data.message, 'top', 'success')
            await getPublicUser();
        } catch (error) {
            showToast(error.response.data.error, 'top', 'danger')
        } finally {
            setIsLoading(false)
        }
    }

    const pararSeguir = async () => {
        setIsLoading(true)
        try {
            const token = await AsyncStorage.getItem('token');

            const response = await api.get(`/user/parar-seguir/${53}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log(response.data)
            showToast(response.data.message, 'top', 'success')
            await getPublicUser();
        } catch (error) {
            showToast(error.response.data.error, 'top', 'danger')
        } finally {
            setIsLoading(false)
        }
    }

    const navigateRotasPublicas = () => {
        navigation.navigate('ListaRotasPublicasUsuarioScreen', { id: id })
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

                        <View style={[styles.card, gap[7]]}>
                            <View style={{ gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                                <Image
                                    source={{ uri: user?.img_perfil || 'https://i.ibb.co/5kkRBSS/default-Avatar.png' }}
                                    style={styles.avatar}
                                    onError={() => console.log('Erro ao carregar a imagem.')}
                                />

                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.blue[900] }}>
                                    {user?.nome}
                                </Text>
                            </View>

                            <View style={{ gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                                <View>
                                    <Text
                                        style={{ color: colors.blue[900], fontWeight: 'bold' }}
                                    >
                                        Seguidores
                                    </Text>
                                    <Text
                                        style={[{ color: colors.blue[900], textAlign: 'center' }, fontWeights['bold'], fontSize['sm']]}
                                    >
                                        {user?.seguidores}
                                    </Text>
                                </View>

                                {user?.isMyPerfil && (
                                    <View>
                                        <Text
                                            style={{ color: colors.blue[900], fontWeight: 'bold' }}
                                        >
                                            Seguindo
                                        </Text>
                                        <Text
                                            style={[{ color: colors.blue[900], textAlign: 'center' }, fontWeights['bold'], fontSize['sm']]}
                                        >
                                            {user?.seguindo}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={{ gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                                {!user?.isMyPerfil && (
                                    <>
                                        {!user?.isFollowing ? (
                                            <TouchableOpacity
                                                style={[{ backgroundColor: colors.blue[900] }, paddings[2], borders.borderRound, widths[4]]}
                                                onPress={seguir}
                                            >
                                                <Text
                                                    style={[{ color: colors.alpha[1000], textAlign: 'center' }]}
                                                >
                                                    Seguir
                                                </Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity
                                                style={[{}, paddings[2], borders.borderRound]}
                                                onPress={pararSeguir}
                                            >
                                                <Text
                                                    style={[{ color: colors.blue[900], textAlign: 'center', borderWidth: 2, borderColor: colors.blue[900] }, borders.borderRound, paddings[1]]}
                                                >
                                                    Parar de Seguir
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </>
                                )}
                            </View>
                        </View>

                        {/* Card de rotas */}
                        <Card
                            borderBottomColor={colors.blue[900]}
                            content={
                                <TouchableOpacity
                                    onPress={navigateRotasPublicas}
                                    style={[display.row, display.justifyContentBetween]}
                                >
                                    <View style={[display.row, display.alignItemsCenter, gap[5]]}>
                                        <FontAwesome5 name="route" size={20} style={[{ color: colors.blue[900], marginRight: 8 }]} />
                                        <View>
                                            <Text style={[fontWeights['bold'], fontSize['lg'], { color: colors.blue[900] }]}>
                                                Rotas
                                            </Text>
                                            <Text style={[fontWeights['bold'], fontSize['sm'], { color: colors.blue[900] }]}>
                                                {user?.totalRotas}
                                            </Text>
                                        </View>
                                    </View>
                                    <FontAwesome5 name="arrow-right" size={20} style={[{ color: colors.blue[900], marginRight: 8 }]} />
                                </TouchableOpacity>
                            }
                        />

                        {/* Card de quadro de medalhas */}
                        <Card
                            borderBottomColor={colors.blue[900]}
                            content={
                                <>
                                    <View style={[display.row, display.justifyContentBetween]}>
                                        <View style={[display.row, display.alignItemsCenter, gap[5]]}>
                                            <FontAwesome5 name="medal" size={20} style={[{ color: colors.blue[900], marginRight: 8 }]} />
                                            <Text style={[fontWeights['bold'], fontSize['lg'], { color: colors.blue[900] }]}>
                                                Quadro de Medalhas
                                            </Text>
                                        </View>
                                        {/* <FontAwesome5 name="arrow-right" size={20} style={[{ color: colors.blue[900], marginRight: 8 }]} /> */}
                                    </View>

                                    {/* Listar Conquistas agrupadas por ano */}
                                    {Object.entries(conquistas ?? {}).map(([ano, conquistasAno]) => (
                                        <View key={ano} style={{ marginTop: 15 }}>
                                            {/* Título do Ano */}
                                            <Text style={[fontWeights['bold'], fontSize['md'], { color: colors.blue[900], marginBottom: 5 }]}>
                                                {ano}
                                            </Text>

                                            {/* Ícones das Conquistas */}

                                            <View style={[display.row, { flexWrap: 'wrap', gap: 10 }, display.justifyContentBetween]}>
                                                {conquistasAno.map((item) => (
                                                    item.conquista && item.conquista.icone ? ( // Verifica se o objeto e o ícone existem
                                                        <View style={[display.alignItemsCenter]} key={item.id}>
                                                            <Image
                                                                key={item.id}
                                                                source={{ uri: item.conquista.icone }}
                                                                style={{ width: 30, height: 30 }}
                                                            />

                                                            <Text
                                                                style={[
                                                                    fontSize['3xs'],
                                                                    {
                                                                        color: colors.blue[900],
                                                                        textAlign: 'center',
                                                                        flexWrap: 'wrap',
                                                                        maxWidth: 50,
                                                                    }
                                                                ]}
                                                            >
                                                                {item.conquista.nome}
                                                            </Text>
                                                        </View>
                                                    ) : null
                                                ))}
                                            </View>
                                        </View>
                                    ))}
                                </>
                            }
                        />
                    </ScrollView>
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