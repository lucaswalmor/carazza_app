import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Image, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import styles from '../assets/css/styles';
import Ionicons from '@expo/vector-icons/Ionicons';

const PointsScreen = ({ navigation }) => {
    const [user, setUser] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pontos, setPontos] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const CadastrarPonto = () => {
        navigation.navigate('CadastrarPonto');
    };

    const getUser = async () => {
        const user = await AsyncStorage.getItem('user');

        if (user) {
            setUser(JSON.parse(user))
        }
    }

    useEffect(() => {
        getPontos();
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
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
        } finally {
            setIsLoading(false)
        }
    }

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
        <View style={{ marginBottom: 50 }}>
            <ImageBackground
                source={{
                    uri: item?.imagem?.path,
                }}
                style={[styles.card, { gap: 10, borderRadius: 10, overflow: 'hidden'}]}
                resizeMode="cover"
            >
                <TouchableOpacity
                    onPress={() => navigation.navigate('PontoScreen', { id: item.id })}
                >
                    <Text style={stylesPontoListScreen.textCardTitle}>{item.nome}</Text>
                    <Text style={stylesPontoListScreen.textCard}>{item.cidade}, {item.estado}</Text>
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

            <TouchableOpacity
                style={[styles.card, { gap: 10 }]}
                onPress={() => navigation.navigate('PontoScreen', { id: item.id })}
            >
                <Text style={[styles.h3, styles.infoTitle]}>{item.nome}</Text>
                <Text style={styles.h5}>{item.cidade}, {item.estado}</Text>
                <Text style={styles.span}>{item.descricao}</Text>

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
        <View style={{ flex: 1 }}>
            {user.tipo_usuario == 1 && (
                <View style={{ padding: 10 }}>
                    <View style={{ width: '100%' }}>
                        <TouchableOpacity style={styles.button} onPress={CadastrarPonto}>
                            <Text style={styles.buttonText}>Cadastrar Ponto</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            <View style={{ padding: 10, marginBottom: 50 }}>
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
                />
            </View>
        </View>
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
    tinyLogo: {
        width: 150,
        height: 150,
    },
    textCardTitle: {
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        fontSize: 20,
        fontWeight: 'bold'
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

export default PointsScreen;
