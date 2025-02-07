import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    TextInput,
    Modal as RNModal,
    Switch,
    Alert,
    ScrollView
} from 'react-native';
import styles from '../assets/css/styles';
import api from '../services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from '../components/Toast';

export default function EncontrosListScreen({ navigation }) {
    const [user, setUser] = useState({});
    const [cidade, setCidade] = useState('');
    const [encontros, setEncontros] = useState([]);
    const [allEncontros, setAllEncontros] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [modalDenuncia, setModalDenuncia] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', position: 'bottom', severity: '' });
    const [denuncia, setDenuncia] = useState({
        encontro_id: null,
        bol_spam_ou_propaganda: false,
        bol_motivo_suspeito: false,
        bol_encontro_ficticio: false,
        bol_risco_seguranca: false,
        bol_fora_tema: false,
        bol_informacoes_falsas: false,
    });

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

    const modalDenunciarEncontro = async (item) => {
        setDenuncia({
            'encontro_id': item.id
        })
        setModalDenuncia(true)
    }

    const toggleSwitch = (field) => {
        setDenuncia((prevState) => ({
            ...prevState,
            [field]: !prevState[field], // Inverte o valor do campo específico
        }));
    };

    const showToast = (message, position, severity) => {
        setToast({ visible: true, message, position, severity });
        setTimeout(() => setToast({ ...toast, visible: false }), 3000);
    };

    const denunciarEncontro = async () => {
        const token = await AsyncStorage.getItem('token');

        try {
            setIsLoading(true);
            const response = await api.post('/denuncia/encontro', denuncia, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setModalDenuncia(false)
            showToast(response.data.message, 'top', 'success')
        } catch (error) {
            showToast(error.response.data.error, 'top', 'danger')
            setModalDenuncia(false)
        } finally {
            setIsLoading(false)
        }
    }

    const renderCard = ({ item }) => (
        <View style={[styles.card]}>
            <TouchableOpacity
                onPress={() => navigation.navigate('EncontroScreen', { id: item.id })}
            >
                <Text style={styles.textCardTitleEncontros}>{item.nome}</Text>
                <Text style={styles.textCardEncontros}>{item.cidade}, {item.estado}</Text>
                <Text style={styles.textCardEncontros}>{item.local}</Text>
                <Text style={styles.textCardEncontros}>Início: {item.data_inicio}</Text>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => modalDenunciarEncontro(item)}
                    >
                        <Ionicons
                            name={"thumbs-down-outline"}
                            size={24}
                            color="#E8003F"
                        />
                    </TouchableOpacity>
                </View>
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
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ backgroundColor: '#007BFF', height: 120, padding: 20, justifyContent: 'space-evenly', gap: 5, position: 'relative' }}>
                    <Text style={{ textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
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

                {(user.tipo_usuario === 1 || user.tipo_usuario === 4 || user.tipo_usuario === 5) && (
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
                                    scrollEnabled={false}
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
                        scrollEnabled={false}
                    />
                </View>

                <RNModal
                    animationType="slide"
                    transparent={true}
                    visible={modalDenuncia}
                    onRequestClose={() => setModalDenuncia(false)}
                >
                    <View style={styles.modalCenteredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.textCardEncontros}>
                                Qual motivo da denúncia?
                            </Text>

                            <View style={{}}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                                        thumbColor={denuncia.bol_spam_ou_propaganda ? '#007BFF' : '#f4f3f4'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={() => toggleSwitch('bol_spam_ou_propaganda')}
                                        value={denuncia.bol_spam_ou_propaganda}
                                    />

                                    <Text>
                                        Spam ou Proganda
                                    </Text>
                                </View>

                                <Text style={{ color: 'gray', fontStyle: 'italic' }}>
                                    usando o aplicativo para fazer divulgação
                                </Text>
                            </View>

                            <View style={{}}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                                        thumbColor={denuncia.bol_motivo_suspeito ? '#007BFF' : '#f4f3f4'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={() => toggleSwitch('bol_motivo_suspeito')}
                                        value={denuncia.bol_motivo_suspeito}
                                    />

                                    <Text>
                                        Encontro Suspeito
                                    </Text>
                                </View>

                                <Text style={{ color: 'gray', fontStyle: 'italic' }}>
                                    O encontro sugere atividades ilegais (ex.: roubo, tráfico) ou golpes (ex.: pedido de dinheiro).
                                </Text>
                            </View>

                            <View style={{}}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                                        thumbColor={denuncia.bol_encontro_ficticio ? '#007BFF' : '#f4f3f4'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={() => toggleSwitch('bol_encontro_ficticio')}
                                        value={denuncia.bol_encontro_ficticio}
                                    />

                                    <Text>
                                        Encontro ficctício
                                    </Text>
                                </View>

                                <Text style={{ color: 'gray', fontStyle: 'italic' }}>
                                    Evento criado apenas para trollagem, sem intenção real de acontecer.
                                </Text>
                            </View>

                            <View style={{}}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                                        thumbColor={denuncia.bol_risco_seguranca ? '#007BFF' : '#f4f3f4'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={() => toggleSwitch('bol_risco_seguranca')}
                                        value={denuncia.bol_risco_seguranca}
                                    />

                                    <Text>
                                        Risco de segurança
                                    </Text>
                                </View>

                                <Text style={{ color: 'gray', fontStyle: 'italic' }}>
                                    Local do encontro é perigoso ou coloca os participantes em risco (ex.: estrada abandonada à noite).
                                </Text>
                            </View>

                            <View style={{}}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                                        thumbColor={denuncia.bol_fora_tema ? '#007BFF' : '#f4f3f4'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={() => toggleSwitch('bol_fora_tema')}
                                        value={denuncia.bol_fora_tema}
                                    />

                                    <Text>
                                        Fora do tema
                                    </Text>
                                </View>

                                <Text style={{ color: 'gray', fontStyle: 'italic' }}>
                                    Quando o encontro não é relacionados a motociclistas
                                </Text>
                            </View>

                            <View style={{}}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                                        thumbColor={denuncia.bol_informacoes_falsas ? '#007BFF' : '#f4f3f4'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={() => toggleSwitch('bol_informacoes_falsas')}
                                        value={denuncia.bol_informacoes_falsas}
                                    />

                                    <Text>
                                        Informações falsas
                                    </Text>
                                </View>

                                <Text style={{ color: 'gray', fontStyle: 'italic' }}>
                                    Quando o encontro é criado em um local inexistente ou falso.
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 5, marginTop: 15 }}>

                                <TouchableOpacity
                                    style={styles.buttonSecondary}
                                    onPress={() => setModalDenuncia(false)}
                                >
                                    <Text style={styles.buttonText}>Fechar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.buttonDanger}
                                    onPress={denunciarEncontro}
                                >
                                    <Text style={styles.buttonText}>Denunciar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </RNModal>
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