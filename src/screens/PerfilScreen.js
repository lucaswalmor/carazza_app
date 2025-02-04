import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Image, Alert } from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../assets/css/styles';
import { FontAwesome5 } from '@expo/vector-icons';
import Card from '../components/Card';
import { colors, display, fontSize, fontWeights } from '../assets/css/primeflex';

export default function PerfilScreen({ navigation }) {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        getUser()
    }, [])

    const handleLogout = async () => {
        setIsLoading(true)

        const token = await AsyncStorage.getItem('token');

        if (token) {
            const response = await api.post('/logout', null, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            await AsyncStorage.removeItem('token');
            navigation.navigate('Login');
        }

        setIsLoading(false)
    };

    const navigateMeusDesafios = () => {
        navigation.navigate('MeusDesafiosScreen')
    }

    const getUser = async () => {
        const token = await AsyncStorage.getItem('token');
        const user = JSON.parse(await AsyncStorage.getItem('user'));

        if (user && token) {
            try {
                setIsLoading(true);
                const response = await api.get(`/user/show/${user.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUser(response.data.data)

            } catch (error) {
                console.log('Erro ao enviar o formulário:', error);
            } finally {
                setIsLoading(false)
            }
        }
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
                <>
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
                        borderBottomColor={colors.indigo[400]}
                        content={
                            <View
                                style={[display.row, display.justifyContentBetween]}
                            >
                                <TouchableOpacity
                                    style={[display.flex, display.row, display.justifyContentBetween]}
                                    onPress={navigateMeusDesafios}
                                >
                                    <Text style={[{ color: colors.indigo[500], fontSize: 18, fontWeight: 'bold' }]}>
                                        Meus Desafios
                                    </Text>
                                    <FontAwesome5 name="arrow-right" size={20} style={[{ color: colors.indigo[500], marginRight: 8 }]} />
                                </TouchableOpacity>
                            </View>
                        }
                    />

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

                    <Card
                        borderBottomColor={colors.teal[500]}
                        title={
                            <View style={[display.row, display.justifyContentBetween]}>
                                <Text style={[fontWeights['bold'], fontSize['lg'], { color: colors.teal[500] }]}>
                                    Rotas
                                </Text>
                                <FontAwesome5 name="map" size={20} style={[{ color: colors.teal[500], marginRight: 8 }]} />
                            </View>
                        }
                        content={
                            <Text>
                                Aqui será as rotas salvas pelo usuário
                            </Text>
                        }
                    />
                </>
            )}
        </View >
    );
}