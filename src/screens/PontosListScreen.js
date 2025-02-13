import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Image, ImageBackground, SafeAreaView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import styles from '../assets/css/styles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TextInput } from 'react-native-gesture-handler';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const PontosListScreen = ({ }) => {
    const [user, setUser] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pontos, setPontos] = useState([]);
    const [cidade, setCidade] = useState('');
    const [allPontos, setAllPontos] = useState([]);
    const navigation = useNavigation();

    const CadastrarPontoScreen = () => {
        navigation.navigate('CadastrarPontoScreen');
    };

    const getUser = async () => {
        const user = await AsyncStorage.getItem('user');

        if (user) {
            setUser(JSON.parse(user))
        }
    }

    useFocusEffect(
        useCallback(() => {
            getPontos();
        }, [])
    );

    useEffect(() => {
        getUser();
    }, [])

    const getPontos = async () => {
        const token = await AsyncStorage.getItem('token');

        try {
            setIsLoading(true);
            const response = await api.get('/ponto/index', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setPontos(response.data)
            setAllPontos(response.data);
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
        } finally {
            setIsLoading(false)
        }
    }

    const filterPontosByCidade = (text) => {
        setCidade(text);

        // Remove acentos da entrada do usuário
        const textoSemAcento = removeAcentos(text);

        if (textoSemAcento === '') {
            setPontos(allPontos); // Se a busca estiver vazia, exibe todos os pontos
        } else {
            const filteredPontos = allPontos.map((estado) => {
                // Filtra os pontos de cada estado
                const filteredByCidadeOuId = estado.pontos.filter((ponto) => {
                    const cidadeSemAcento = removeAcentos(ponto.cidade); // Remove acentos das cidades
                    const nomePontoSemAcento = removeAcentos(ponto.nome); // Remove acentos dos nomes dos pontos

                    // Verifica se o texto de busca é um número (ID) ou uma cidade
                    const isNumber = !isNaN(textoSemAcento);

                    // Se for número, busca pelo ID, senão busca pela cidade ou nome do ponto
                    if (isNumber) {
                        return String(ponto.id).padStart(4, '0').includes(textoSemAcento); // Filtra pelo ID
                    } else {
                        // Filtra pela cidade ou nome do ponto
                        return cidadeSemAcento.toLowerCase().includes(textoSemAcento.toLowerCase()) ||
                            nomePontoSemAcento.toLowerCase().includes(textoSemAcento.toLowerCase());
                    }
                });

                // Retorna o estado com os pontos filtrados
                return { ...estado, pontos: filteredByCidadeOuId };
            }).filter((estado) => estado.pontos.length > 0); // Filtra estados sem pontos correspondentes

            setPontos(filteredPontos); // Atualiza a lista de pontos com os filtrados
        }
    };

    const removeAcentos = (texto) => {
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    };

    const clearInput = () => {
        filterPontosByCidade('');
    };

    const refreshPontos = async () => {
        setIsRefreshing(true);
        await getPontos();
        setIsRefreshing(false);
    };

    const likePonto = async (ponto) => {
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await api.put(`/ponto/update/like/${ponto.id}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })

            await getPontos();
        } catch (error) {
            console.log(error)
        }
    }

    const renderCard = ({ item }) => (
        <View style={{}}>
            <ImageBackground
                source={{
                    uri: item?.imagem?.path,
                }}
                style={[styles.card, { gap: 10, borderRadius: 10, overflow: 'hidden' }]}
                resizeMode="cover"
            >
                <TouchableOpacity
                    onPress={() => navigation.navigate('PontoScreen', { id: item.id })}
                >
                    <Text style={stylesPontoListScreen.textCardTitle}>
                        Ponto: {item.id}
                    </Text>
                    <Text style={stylesPontoListScreen.textCard}>{item.nome}</Text>
                    <Text style={stylesPontoListScreen.textInfoCard}>{item.descricao}</Text>

                    <View style={stylesPontoListScreen.actionsContainer}>
                        <TouchableOpacity
                            style={stylesPontoListScreen.actionButton}
                            onPress={() => likePonto(item)}
                        >
                            <Ionicons
                                name={item.like ? "thumbs-up" : "thumbs-up-outline"}
                                size={24}
                                color="#007BFF"
                                style={{ marginRight: 10 }}
                            />
                            <Text>{item.like_count}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </ImageBackground>
        </View>
    );

    if (isLoading && !isRefreshing) {
        return (
            <View style={stylesPontoListScreen.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView
                style={{ flex: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={{ backgroundColor: '#007BFF', height: 120, padding: 20, justifyContent: 'space-evenly', gap: 5, position: 'relative' }}>
                    <Text style={{ textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
                        Lista de Pontos
                    </Text>
                    <TextInput
                        style={styles.inputComum}
                        placeholder="Buscar por cidade ou número"
                        value={cidade}
                        onChangeText={filterPontosByCidade}
                    />
                    {cidade.length > 0 && (
                        <TouchableOpacity onPress={clearInput} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={24} color="#007BFF" />
                        </TouchableOpacity>
                    )}
                </View>

                {user.tipo_usuario == 1 && (
                    <View style={{ padding: 10 }}>
                        <View style={{ width: '100%' }}>
                            <TouchableOpacity style={styles.button} onPress={CadastrarPontoScreen}>
                                <Text style={styles.buttonText}>Cadastrar Ponto</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={{ padding: 10 }}>
                    <FlatList
                        data={pontos}
                        keyExtractor={(item) => item.estado}
                        renderItem={({ item }) => (
                            <View>
                                <Text style={[styles.infoTitle, { marginTop: 15, marginBottom: 15, fontSize: 18 }]}>{`${item.estado}`}</Text>
                                <FlatList
                                    data={item.pontos}
                                    keyExtractor={(ponto) => ponto.id.toString()}
                                    renderItem={renderCard}
                                    scrollEnabled={false}
                                />
                            </View>
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={refreshPontos}
                                colors={['#007BFF']}
                            />
                        }
                        scrollEnabled={false}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const stylesPontoListScreen = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    actionsContainer: {
        flexDirection: 'row', // Alinha os botões horizontalmente
        justifyContent: 'space-between', // Espaço igual entre os botões
        marginTop: 10,
    },
    actionButton: {
        flexDirection: 'row', // Ícone e texto na mesma linha
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    textCardTitle: {
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        fontSize: 20,
    },
    textCard: {
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        fontSize: 18,
        fontWeight: 'medium'
    },
    textInfoCard: {
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        fontSize: 16,
        fontWeight: 'medium'
    }
});

export default PontosListScreen;
