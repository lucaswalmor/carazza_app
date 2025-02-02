import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, SafeAreaView, TextInput, ImageBackground } from 'react-native';
import styles from '../assets/css/styles';
import api from '../services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

export default function EncontrosListScreen({ navigation }) {
    const [user, setUser] = useState({});
    const [cidade, setCidade] = useState('');
    const [encontros, setEncontros] = useState([]);
    const [allEncontros, setAllEncontros] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const CadastrarEncontroScreen = () => {
        navigation.navigate('CadastrarEncontroScreen');
    };

    const getUser = async () => {
        const user = await AsyncStorage.getItem('user');

        if (user) {
            setUser(JSON.parse(user))
        }
    }

    const getEncontros = async () => {
        const token = await AsyncStorage.getItem('token');

        try {
            setIsLoading(true);
            const response = await api.get('/encontro/index', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setEncontros(response.data)
            setAllEncontros(response.data);
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
        } finally {
            setIsLoading(false)
        }
    }

    useFocusEffect(
        useCallback(() => {
            getEncontros();
        }, [])
    );

    useEffect(() => {
        getUser();
    }, [])

    const filterEncontrosByCidade = (text) => {
        setCidade(text);

        const textoSemAcento = removeAcentos(text); // Remove acentos da entrada do usuário
        if (textoSemAcento === '') {
            setEncontros(allEncontros);
        } else {
            const filteredEvents = allEncontros.map((estado) => {
                // Filtra os encontros de cada estado
                const filteredByCidade = estado.encontros.filter((encontro) => {
                    const cidadeSemAcento = removeAcentos(encontro.cidade); // Remove acentos dos nomes das cidades
                    const nomeEncontroSemAcento = removeAcentos(encontro.nome); // Remove acentos dos nomes dos encontros
                    return cidadeSemAcento.toLowerCase().includes(textoSemAcento.toLowerCase()) || nomeEncontroSemAcento.toLowerCase().includes(textoSemAcento.toLowerCase());
                });

                // Retorna o estado com os encontros filtrados
                return { ...estado, encontros: filteredByCidade };
            }).filter((estado) => estado.encontros.length > 0); // Filtra estados sem encontros correspondentes

            setEncontros(filteredEvents); // Atualiza a lista de encontros com os filtrados
        }
    };

    const removeAcentos = (texto) => {
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    };

    const clearInput = () => {
        filterEncontrosByCidade('');
    };

    const refreshEncontros = async () => {
        setIsRefreshing(true);
        await getEncontros();
        setIsRefreshing(false);
    };

    const renderCard = ({ item }) => (
        <View style={[styles.card]}>
            <TouchableOpacity
                onPress={() => navigation.navigate('EncontroScreen', { id: item.id })}
            >
                <Text style={styles.textCardTitleEncontros}>{item.nome}</Text>
                <Text style={styles.textCardEncontros}>{item.cidade}, {item.estado}</Text>
                <Text style={styles.textCardEncontros}>{item.local}</Text>
                <Text style={styles.textCardEncontros}>Início: {item.data_inicio}</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading && !isRefreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, paddingBottom: 150 }}>
            <View style={{ backgroundColor: '#007BFF', height: 120, padding: 20, justifyContent: 'space-evenly', gap: 5, position: 'relative' }}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10}}>
                    Lista de Encontros
                </Text>

                <TextInput
                    style={styles.inputComum}
                    placeholder="Buscar por cidade..."
                    value={cidade}
                    onChangeText={filterEncontrosByCidade}
                />
                {cidade.length > 0 && (
                    <TouchableOpacity onPress={clearInput} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={24} color="#007BFF" />
                    </TouchableOpacity>
                )}
            </View>

            {(user.tipo_usuario === 1 || user.tipo_usuario === 4) && (
                <View style={{ padding: 10 }}>
                    <View style={{ width: '100%' }}>
                        <TouchableOpacity style={styles.button} onPress={CadastrarEncontroScreen}>
                            <Text style={styles.buttonText}>Cadastrar Encontro</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={{ padding: 10 }}>
                <FlatList
                    data={encontros}
                    keyExtractor={(item) => item.estado}
                    renderItem={({ item }) => (
                        <View>
                            <Text style={[styles.infoTitle, { marginTop: 15, marginBottom: 15, fontSize: 18 }]}>{`${item.estado}`}</Text>
                            <FlatList
                                data={item.encontros}
                                keyExtractor={(encontro) => encontro.id.toString()}
                                renderItem={renderCard}
                            />
                        </View>
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={refreshEncontros}
                            colors={['#007BFF']}
                        />
                    }
                />
            </View>
        </SafeAreaView>
    );
}