import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '../components/Card';
import { colors, fontSize, fontWeights } from '../assets/css/primeflex';

export default function NotificacoesScreen({ navigation }) {
    const [notificacoes, setNotificacoes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const buscarNotificacoes = async () => {
        const token = await AsyncStorage.getItem('token');
        setIsLoading(true);

        try {
            const response = await api.get('/notificacoes/lista', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotificacoes(response.data);

            if (response.data.length > 0) {
                await marcarTodasComoLidas();
            }
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const marcarTodasComoLidas = async () => {
        const token = await AsyncStorage.getItem('token');
        try {
            await api.get('/notificacoes/lidas', {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Erro ao marcar notificações como lidas:', error);
        }
    };

    useEffect(() => {
        buscarNotificacoes();
    }, []);

    const lookPerfil = async (item) => {
        navigation.navigate('PerfilPublicoScreen', { id: item.user_id });
    }

    const renderItem = ({ item }) => (
        <Card
            title={item.type === 'admin' ? <Text style={[fontSize['lg'], fontWeights['bold'], {color: colors.blueGray[500]}]}>Mensagem do Sistema</Text> : null}
            backgroundColor={!item.read ? colors.gray[300] : '#FFFFFF'}
            borderBottomColor={item.type === 'admin' ? colors.red[500] : null}
            content={
                <TouchableOpacity
                    onPress={() => lookPerfil(item)}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    disabled={item.type == 'admin'}
                >
                    {item.from_user_img && item.type != 'admin' && (
                        <Image
                            source={{ uri: item.from_user_img }}
                            style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
                        />
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: item.read ? 'normal' : 'bold', fontSize: 16 }}>
                            {item.message}
                        </Text>
                        <Text style={{ color: '#777', fontSize: 12 }}>
                            {item.created_at}
                        </Text>
                    </View>
                </TouchableOpacity>
            }
        />
    );

    return (
        <View style={{ flex: 1, padding: 10, paddingTop: 20 }}>
            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#007BFF" />
                </View>
            ) : (
                notificacoes.length > 0 ? (
                    <FlatList
                        data={notificacoes}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        ListFooterComponent={() => (
                            <Text style={{ textAlign: 'center', color: '#777', marginTop: 10 }}>Fim das notificações.</Text>
                        )}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                ) : (
                    <Text style={{ textAlign: 'center', color: '#666' }}>Nenhuma notificação encontrada.</Text>
                )
            )}
        </View>
    );
}
