import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import styles from '../assets/css/styles';

const PointsScreen = ({ navigation }) => {
    const [user, setUser] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [pontos, setPontos] = useState([]);

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
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            setPontos(response.data.data)
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
        } finally {
            setIsLoading(false)
        }
    }

    const renderCard = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, {gap: 10}]}
            onPress={() => navigation.navigate('PontoScreen', { id: item.id })}
        >
            <Text style={styles.h3}>{item.nome}</Text>
            <Text style={styles.h5}>{item.cidade}, {item.estado}</Text>
            <Text style={styles.span}>{item.descricao}</Text>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={stylesPontoListScreen.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {user.tipo_usuario == 1 && (
                <View style={{}}>
                    <View style={{ padding: 10, width: '100%' }}>
                        <TouchableOpacity style={styles.button} onPress={CadastrarPonto}>
                            <Text style={styles.buttonText}>Cadastrar Point</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={pontos}
                        renderItem={renderCard}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={stylesPontoListScreen.listContainer}
                    />
                </View>
            )}
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
    listContainer: {
        padding: 10,
    },
    nome: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    cidadeEstado: {
        fontSize: 14,
        color: '#555',
        marginVertical: 5,
    },
    descricao: {
        fontSize: 12,
        color: '#777',
    },
});

export default PointsScreen;
