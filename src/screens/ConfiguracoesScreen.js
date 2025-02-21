import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Image, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../assets/css/styles';
import { FontAwesome5, FontAwesome6, Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import { colors, display } from '../assets/css/primeflex';

export default function ConfiguracoesScreen({ navigation }) {
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
                console.log('Erro ao enviar o formulário:', error);
            } finally {
                setIsLoading(false)
            }
        }
    }

    const confirmPause = async () => {
        Alert.alert(
            'Deseja realmente pausar esta assinatura?',
            'Você poderá reativar a assinatura a qualquer momento depois',
            [
                { text: 'Cancelar', onPress: () => { }, style: 'cancel' },
                { text: 'OK', onPress: () => handlePauseSubscription() },
            ],
            { cancelable: true }
        );
    }

    const handlePauseSubscription = async () => {
        const token = await AsyncStorage.getItem('token');
        setIsLoading(true)

        if (token) {
            try {
                const response = await api.get(`/asaas/subscription/status?email=${user.email}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                handleLogout();
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    const copyToClipboard = async (text) => {
        await Clipboard.setStringAsync(text);
        // Alert.alert("Copiado!", "O link foi copiado para a área de transferência.");
    };

    return (
        <View style={{ flex: 1, padding: 10, paddingTop: 20 }}>
            {isLoading ? (
                <>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color="#1d1e22" />
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

                    {/* Card 2: Codigo referencia */}
                    {user && user.tipo_usuario === 3 && (
                        <Card
                            borderBottomColor={colors.blue[500]}
                            title={<View><Text style={{ color: colors.blue[500], fontSize: 18, fontWeight: 'bold' }}>Código de referência</Text></View>}
                            content={
                                <View style={[display.row, display.justifyContentBetween]}>
                                    <Text style={{ color: colors.blue[500], fontSize: 14, maxWidth: 250, textAlign: 'center', }}>
                                        https://www.motostrada.com.br/cadastro?inf=0&ref={user?.refferal_code}
                                    </Text>
                    
                                    <TouchableOpacity onPress={() => copyToClipboard(`https://www.motostrada.com.br/cadastro?inf=0&ref=${user?.refferal_code}`)}>
                                        <Ionicons name="copy-outline" size={24} color={colors.blue[500]} />
                                    </TouchableOpacity>
                                </View>
                            }
                        />
                    )}

                    {/* Card 3: Pausar assinatura */}
                    <View style={[styles.cardDanger, { gap: 10, flexDirection: 'row', alignItems: 'center' }]}>
                        <TouchableOpacity
                            style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}
                            onPress={confirmPause}
                        >
                            <Text style={[styles.textDanger, { fontSize: 18, fontWeight: 'bold' }]}>
                                Pausar Assinatura
                            </Text>

                            <FontAwesome6 name="circle-pause" size={20} style={[styles.textDanger, { marginRight: 8 }]} />
                        </TouchableOpacity>
                    </View>

                    {/* Card 4: Logout */}
                    <Card
                        borderBottomColor={colors.gray[400]}
                        content={
                            <View
                                style={[display.row, display.justifyContentBetween]}
                            >
                                <TouchableOpacity
                                    style={[display.flex, display.row, display.justifyContentBetween]}
                                    onPress={handleLogout}
                                >
                                    <Text style={[{ color: colors.gray[400], fontSize: 18, fontWeight: 'bold' }]}>
                                        Logout
                                    </Text>

                                    <Ionicons name="log-out-outline" size={20} style={[{ color: colors.gray[400], marginRight: 8 }]} />
                                </TouchableOpacity>
                            </View>
                        }
                    />
                </>
            )}
        </View >
    );
}