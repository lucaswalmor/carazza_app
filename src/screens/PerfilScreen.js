import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Image } from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../assets/css/styles';
import { Ionicons } from '@expo/vector-icons';

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
                console.error('Erro ao enviar o formulário:', error);
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handlePauseSubscription = async () => {
        const token = await AsyncStorage.getItem('token');
        const user = JSON.parse(await AsyncStorage.getItem('user'));

        if (user && token) {
            try {
                setIsLoading(true);
                const response = await api.get(`/stripe/subscription/pause`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log(response.data)
                await handleLogout();

            } catch (error) {
                console.error('Erro ao enviar o formulário:', error);
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

                    {/* Card 2: Desafios */}
                    <View style={[styles.card, { gap: 10, flexDirection: 'row', alignItems: 'center' }]}>
                        <TouchableOpacity
                            style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}
                            onPress={() => { }}
                        >
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                                Desafios
                            </Text>

                            <Ionicons name="arrow-forward-outline" size={20} color="#007BFF" style={{ marginRight: 8 }} />
                        </TouchableOpacity>
                    </View>

                    {/* Card 2: Desafios */}
                    <View style={[styles.card, { gap: 10,  }]}>
                        <Text style={styles.infoTitle}>
                            Assinatura
                        </Text>

                        <Text style={styles.infoLabel}>Valor</Text>
                        <Text style={styles.infoText}>{user?.subscription?.amount}</Text>
                        <Text style={styles.infoLabel}>Recorrência</Text>
                        <Text style={styles.infoText}>{user?.subscription?.interval}</Text>
                        <Text style={styles.infoLabel}>Início</Text>
                        <Text style={styles.infoText}>{user?.subscription?.start_date}</Text>

                        <TouchableOpacity style={styles.buttonDanger} onPress={handlePauseSubscription} disabled={isLoading}>
                            <View style={styles.buttonContent}>
                                {isLoading ? (
                                    <>
                                        <ActivityIndicator
                                            style={styles.loadingIndicator}
                                            size="small"
                                            color="#fff"
                                        />
                                        <Text style={styles.buttonText}>Aguarde</Text>
                                    </>
                                ) : (
                                    <Text style={styles.buttonText}>Pausar Assinatura</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Card 4: Logout */}
                    <View style={[styles.cardDanger, { gap: 10, flexDirection: 'row', alignItems: 'center' }]}>
                        <TouchableOpacity
                            style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}
                            onPress={handleLogout}
                        >
                            <Text style={[styles.textDanger, { fontSize: 18, fontWeight: 'bold' }]}>
                                Logout
                            </Text>

                            <Ionicons name="log-out-outline" size={20} style={[styles.textDanger, { marginRight: 8 }]} />
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View >
    );
}