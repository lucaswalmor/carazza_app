import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Image, Alert, StyleSheet, ScrollView } from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../assets/css/styles';
import { FontAwesome5 } from '@expo/vector-icons';
import Card from '../components/Card';
import { borders, colors, display, fontSize, fontWeights, gap, margins, paddings, shadows } from '../assets/css/primeflex';
import { useFocusEffect } from '@react-navigation/native';

export default function PerfilScreen({ navigation }) {
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

            const response = await api.get(`/user/show/${user.id}`, {
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

    const navigateMeusDesafios = () => {
        navigation.navigate('MeusDesafiosScreen')
    }

    const navigateRotasPublicas = () => {
        navigation.navigate('ListaRotasPublicasUsuarioScreen', { id: user.id })
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

                                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                                    {user?.nome}
                                </Text>
                            </View>

                            <View style={{ gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                                <View>
                                    <Text
                                        style={{ color: '#000', fontWeight: 'bold' }}
                                    >
                                        Seguidores
                                    </Text>
                                    <Text
                                        style={[{ color: '#000', textAlign: 'center' }, fontWeights['bold'], fontSize['sm']]}
                                    >
                                        {user?.seguidores}
                                    </Text>
                                </View>
                                <View>
                                    <Text
                                        style={{ color: '#000', fontWeight: 'bold' }}
                                    >
                                        Seguindo
                                    </Text>
                                    <Text
                                        style={[{ color: '#000', textAlign: 'center' }, fontWeights['bold'], fontSize['sm']]}
                                    >
                                        {user?.seguindo}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Card de quadro de meus desafios */}
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

                        {/* Card de quadro de medalhas */}
                        <Card
                            borderBottomColor={colors.blueGray[500]}
                            content={
                                <View style={[display.row, display.justifyContentBetween]}>
                                    <View style={[display.row, display.alignItemsCenter, gap[5]]}>
                                        <FontAwesome5 name="medal" size={20} style={[{ color: colors.blueGray[500], marginRight: 8 }]} />
                                        <View>
                                            <Text style={[fontWeights['bold'], fontSize['lg'], { color: colors.blueGray[500] }]}>
                                                Quadro de Medalhas
                                            </Text>
                                            {/* <Text style={[fontWeights['bold'], fontSize['sm'], { color: colors.blueGray[500] }]}>
                                                {user.totalRotas}
                                            </Text> */}
                                        </View>
                                    </View>
                                    <FontAwesome5 name="arrow-right" size={20} style={[{ color: colors.blueGray[500], marginRight: 8 }]} />
                                </View>
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