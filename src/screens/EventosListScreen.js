import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, SafeAreaView, TextInput, ImageBackground, ScrollView } from 'react-native';
import styles from '../assets/css/styles';
import api from '../services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

export default function EventosListScreen({ }) {
    const [user, setUser] = useState({});
    const [cidade, setCidade] = useState('');
    const [eventos, setEventos] = useState([]);
    const [allEventos, setAllEventos] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const CadastrarEventoScreen = () => {
        navigation.navigate('CadastrarEventoScreen');
    };

    const getUser = async () => {
        const user = await AsyncStorage.getItem('user');

        if (user) {
            setUser(JSON.parse(user))
        }
    }

    const getEventos = async () => {
        const token = await AsyncStorage.getItem('token');

        try {
            setIsLoading(true);
            const response = await api.get('/evento/index', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setEventos(response.data)
            setAllEventos(response.data);
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
        } finally {
            setIsLoading(false)
        }
    }

    useFocusEffect(
        useCallback(() => {
            getEventos();
        }, [])
    );

    useEffect(() => {
        getUser();
    }, [])

    const filterEventosByCidade = (text) => {
        setCidade(text);

        const textoSemAcento = removeAcentos(text); // Remove acentos da entrada do usuário
        if (textoSemAcento === '') {
            setEventos(allEventos);
        } else {
            const filteredEvents = allEventos.map((estado) => {
                // Filtra os eventos de cada estado
                const filteredByCidade = estado.eventos.filter((evento) => {
                    const cidadeSemAcento = removeAcentos(evento.cidade); // Remove acentos dos nomes das cidades
                    const nomeEventoSemAcento = removeAcentos(evento.nome); // Remove acentos dos nomes dos eventos
                    return cidadeSemAcento.toLowerCase().includes(textoSemAcento.toLowerCase()) || nomeEventoSemAcento.toLowerCase().includes(textoSemAcento.toLowerCase());
                });

                // Retorna o estado com os eventos filtrados
                return { ...estado, eventos: filteredByCidade };
            }).filter((estado) => estado.eventos.length > 0); // Filtra estados sem eventos correspondentes

            setEventos(filteredEvents); // Atualiza a lista de eventos com os filtrados
        }
    };

    const removeAcentos = (texto) => {
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    };

    const clearInput = () => {
        filterEventosByCidade('');
    };

    const refreshEventos = async () => {
        setIsRefreshing(true);
        await getEventos();
        setIsRefreshing(false);
    };

    const renderCard = ({ item }) => (
        <View style={{}}>
            <ImageBackground
                source={{
                    uri: item?.path_banner,
                }}
                style={[styles.card, { gap: 10, borderRadius: 10, overflow: 'hidden' }]}
                resizeMode="cover"
            >
                <TouchableOpacity
                    onPress={() => navigation.navigate('EventoScreen', { id: item.id })}
                >
                    <Text style={styles.textCardTitle}>{item.nome}</Text>
                    <Text style={styles.textCard}>{item.cidade}, {item.estado}</Text>
                    <Text style={styles.textInfoCard}>{item.descricao}</Text>
                    <Text style={styles.textCard}>{item.local}</Text>
                    <Text style={styles.textCard}>Início: {item.data_inicio}</Text>
                </TouchableOpacity>
            </ImageBackground>
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
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 200 }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={{ backgroundColor: '#007BFF', height: 120, padding: 20, justifyContent: 'space-evenly', gap: 5, position: 'relative' }}>
                    <Text style={{ textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
                        Lista de Eventos
                    </Text>
                    <TextInput
                        style={styles.inputComum}
                        placeholder="Buscar por cidade..."
                        value={cidade}
                        onChangeText={filterEventosByCidade}
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
                            <TouchableOpacity style={styles.button} onPress={CadastrarEventoScreen}>
                                <Text style={styles.buttonText}>Cadastrar Evento</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={{ padding: 10 }}>
                    <FlatList
                        data={eventos}
                        keyExtractor={(item) => item.estado}
                        renderItem={({ item }) => (
                            <View>
                                <Text style={[styles.infoTitle, { marginTop: 15, marginBottom: 15, fontSize: 18 }]}>{`${item.estado}`}</Text>
                                <FlatList
                                    data={item.eventos}
                                    keyExtractor={(evento) => evento.id.toString()}
                                    renderItem={renderCard}
                                    scrollEnabled={false}
                                />
                            </View>
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={refreshEventos}
                                colors={['#007BFF']}
                            />
                        }
                        scrollEnabled={false}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}