import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, Alert, Image } from 'react-native';
import styles from '../assets/css/styles';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import { borders, colors, display, fontSize, fontWeights, gap, paddings, widths } from '../assets/css/primeflex';
import Toast from '../components/Toast';

export default function DetalhesDesafioScreen({ navigation, route }) {
    const { id } = route.params;
    const [user, setUser] = useState({});
    const [desafio, setDesafio] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', position: 'bottom', severity: '' });

    useFocusEffect(
        useCallback(() => {
            getDesafioById();
        }, [])
    );

    useEffect(() => {
        getUser();
    }, [])

    const getUser = async () => {
        const user = await AsyncStorage.getItem('user');

        if (user) {
            setUser(JSON.parse(user))
        }
    }

    const getDesafioById = async () => {
        const token = await AsyncStorage.getItem('token');

        try {
            setIsLoading(true);
            const response = await api.get(`/desafio/show/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setDesafio(response.data.data)
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
        } finally {
            setIsLoading(false)
        }
    }

    const refreshDesafios = async () => {
        setIsRefreshing(true);
        await getDesafioById();
        setIsRefreshing(false);
    };

    const showToast = (message, position, severity) => {
        setToast({ visible: true, message, position, severity });

        // Esconde o toast após 3 segundos
        setTimeout(() => setToast({ ...toast, visible: false }), 3000);
    };

    const confirmarParticipacao = async (id) => {
        try {
            const token = await AsyncStorage.getItem('token');

            const response = await api.get(`/desafio/participar/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            await getDesafioById();
            showToast(response.data.message, 'top', 'success')
        } catch (error) {
            showToast(error.response.data.error, 'top', 'danger')
        }
    }

    const confirmarCancelamento = (desafioId) => {
        Alert.alert(
            "Tem certeza de que deseja cancelar?",
            "Ao cancelar sua participação neste desafio perderá todo seu progresso feito.",
            [
                {
                    text: "Não",
                    style: "cancel",
                },
                {
                    text: "Sim",
                    onPress: () => cancelarParticipacao(desafioId),
                    style: "destructive",
                },
            ]
        );
    };

    const cancelarParticipacao = async (id) => {
        try {
            const token = await AsyncStorage.getItem('token');

            const response = await api.get(`/desafio/cancelar-participacao/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            await getDesafioById();
            showToast(response.data.message, 'top', 'success')
        } catch (error) {
            showToast(error.response.data.error, 'top', 'danger')
        }
    }

    if (isLoading && !isRefreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView
                style={{ flex: 1, padding: 10, marginBottom: 5 }}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={refreshDesafios} />
                }
            >
                <Card
                    title={
                        <View style={[display.row, display.justifyContentBetween, display.alignItemsCenter]}>
                            <Text style={[{ color: colors.blue[500] }, fontWeights['bold'], fontSize['xl']]}>{desafio.nome}</Text>
                            <Text style={[{ color: colors.indigo[500] }, fontWeights['bold'], fontSize['xl']]}>{desafio.pontos} Pts</Text>
                        </View>
                    }
                    content={
                        <View>
                            <View style={[{ marginTop: 10 }]}>
                                <Text style={[{ color: colors.blueGray['500'] }, fontWeights['bold']]}>Descrição</Text>
                                <Text>{desafio.descricao}</Text>
                            </View>

                            <View style={[{ marginTop: 10 }]}>
                                <Text style={[{ color: colors.blueGray['500'] }, fontWeights['bold']]}>Regras</Text>
                                <Text>{desafio.regras}</Text>
                            </View>

                            <View style={[{ marginTop: 10 }]}>
                                <Text style={[{ color: colors.blueGray['500'] }, fontWeights['bold']]}>Datas</Text>

                                <View style={[gap[5], { marginTop: 10 }]}>
                                    <Text style={{}}>Início: {desafio.data_inicio}</Text>
                                    <Text style={{}}>Fim: {desafio.data_fim ?? "Indeterminado"}</Text>
                                </View>
                            </View>
                        </View>
                    }
                    footer={
                        <View>
                            {!desafio?.participando ? (
                                <TouchableOpacity
                                    style={[{ backgroundColor: colors.blue[500] }, paddings[5], borders.borderRound]}
                                    onPress={() => confirmarParticipacao(desafio.id)}
                                >
                                    <Text
                                        style={[{ color: colors.alpha[1000], textAlign: 'center' }]}
                                    >
                                        Participar
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[{}, borders.borderRound]}
                                    onPress={() => confirmarCancelamento(desafio.id)}
                                >
                                    <Text
                                        style={[{ color: colors.blue[500], textAlign: 'center', borderWidth: 2, borderColor: colors.blue[500] }, borders.borderRound, paddings[5]]}
                                    >
                                        Cancelar Participação
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />

                <Card
                    title={
                        <Text style={[{ color: colors.blue[500] }, fontWeights['bold'], fontSize['xl']]}>
                            Ranking dos Participantes
                        </Text>
                    }
                    content={
                        <View>
                            {
                                desafio.ranking && (
                                    <ScrollView>
                                        {Array.from({ length: 20 }).map((_, index) => {
                                            const participante = desafio.ranking[index];
                                            const posicaoVazia = !participante;

                                            return (
                                                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                                                    {/* Posição */}
                                                    <Text style={{ fontWeight: 'bold', marginRight: 10 }}>
                                                        {index + 1}º
                                                    </Text>

                                                    {/* Imagem ou Placeholder */}
                                                    {index < 3 && participante ? (
                                                        <View style={{ width: 40, height: 40, marginRight: 10 }}>
                                                            <Image
                                                                source={
                                                                    index === 0
                                                                        ? require('../assets/icons/gold-medal.png')
                                                                        : index === 1
                                                                            ? require('../assets/icons/silver-medal.png')
                                                                            : require('../assets/icons/bronze-medal.png')
                                                                }
                                                                style={{ width: '100%', height: '100%' }}
                                                            />
                                                        </View>
                                                    ) : (
                                                        <View style={{ width: 30, height: 30, marginRight: 10 }}>
                                                            <Image
                                                                source={require('../assets/icons/medal-participacao.png')}
                                                                style={{ width: '100%', height: '100%' }}
                                                            />
                                                        </View>
                                                    )}

                                                    {/* Nome do Participante */}
                                                    <Text style={{ flex: 1 }}>
                                                        {posicaoVazia ? '---' : participante.nome}
                                                    </Text>

                                                    {/* Distância Percorrida */}
                                                    <Text>
                                                        {posicaoVazia ? '0 km' : `${participante.km_percorrido} km`}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </ScrollView>
                                )
                            }
                        </View>
                    }
                />

            </ScrollView>

            {toast.visible && (
                <Toast
                    message={toast.message}
                    position={toast.position}
                    onClose={() => setToast({ ...toast, visible: false })}
                    severity={toast.severity}
                />
            )}
        </SafeAreaView>
    );
}