import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Image, ScrollView, FlatList, Modal as RNModal } from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../assets/css/styles';
import { FontAwesome5 } from '@expo/vector-icons';
import Card from '../components/Card';
import { borders, colors, display, fontSize, fontWeights, gap } from '../assets/css/primeflex';
import { useFocusEffect } from '@react-navigation/native';

export default function PerfilScreen({ navigation }) {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [conquistas, setConquistas] = useState(null);
    const [seguindo, setSeguindo] = useState([]);
    const [loading, setLoading] = useState(true);

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

            setConquistas(response.data.data.conquistas)
            setUser(response.data.data)
        } catch (error) {
            console.log('Erro ao enviar o formulário:', error);
        } finally {
            setIsLoading(false)
        }
    }

    const navigateToListaDeSeguindo = () => {
        navigation.navigate('ListaDeSeguindoScreen')
    }

    const navigateToListaDeSeguidores = () => {
        navigation.navigate('ListaDeSeguidoresScreen')
    }

    const navigateMeusDesafios = () => {
        navigation.navigate('MeusDesafiosScreen')
    }

    const navigateToRankingGeral = () => {
        navigation.navigate('RankingGeralScreen')
    }

    const navigateRotasPublicas = () => {
        navigation.navigate('ListaRotasPublicasUsuarioScreen', { id: user.id })
    }

    const navigateToBuscarPerfil = () => {
        navigation.navigate('BuscarPerfilScreen')
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

                                <View style={[]}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.blue[900] }}>
                                        {user?.nome}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity
                                    onPress={() => navigateToListaDeSeguidores()}
                                >
                                    <View>
                                        <Text
                                            style={{ color: colors.blue[900], fontWeight: 'bold' }}
                                        >
                                            Seguidores
                                        </Text>
                                        <Text
                                            style={[{ color: colors.blue[900], textAlign: 'center' }, fontWeights['bold'], fontSize['sm']]}
                                        >
                                            {user?.seguidores}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => navigateToListaDeSeguindo()}
                                >
                                    <View>
                                        <Text
                                            style={{ color: colors.blue[900], fontWeight: 'bold' }}
                                        >
                                            Seguindo
                                        </Text>
                                        <Text
                                            style={[{ color: colors.blue[900], textAlign: 'center' }, fontWeights['bold'], fontSize['sm']]}
                                        >
                                            {user?.seguindo}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => navigateToBuscarPerfil()}
                                >
                                    <View style={{alignItems: 'center'}}>
                                        <Text
                                            style={{ color: colors.blue[900], fontWeight: 'bold' }}
                                        >
                                            Buscar
                                        </Text>
                                        <FontAwesome5 name="search" size={16} style={[{ color: colors.blue[900], marginTop: 5 }]} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Card de ranking geral */}
                        <TouchableOpacity
                            onPress={() => navigateToRankingGeral()}
                        >
                            <Card
                                borderBottomColor={colors.blue[500]}
                                title={
                                    <Text style={[{ padding: 4, color: colors.blue[900] }, fontWeights['bold'], fontSize['lg'], borders.borderRound3xl]}>
                                        Ranking Geral
                                    </Text>
                                }
                                content={
                                    <View style={[display.row, display.alignItemsCenter, display.justifyContentBetween, gap[5]]}>
                                        <Image
                                            source={
                                                user?.posicao === 1
                                                    ? require('../assets/icons/gold-medal8.png')
                                                    : user?.posicao === 2
                                                        ? require('../assets/icons/silver-medal8.png')
                                                        : require('../assets/icons/bronze-medal8.png')
                                            }
                                            style={{ width: 40, height: 40 }}
                                        />
                                        <View>
                                            <Text
                                                style={[
                                                    {
                                                        padding: 4,
                                                        color: colors.blue[900],
                                                        letterSpacing: 1,
                                                    },
                                                    fontSize['2xl'],
                                                    fontWeights['semibold'],
                                                ]}
                                            >
                                                {user?.posicao}º Colocação
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={[
                                                {
                                                    padding: 4,
                                                    color: colors.blue[900],
                                                    letterSpacing: 1,
                                                },
                                                fontSize['lg'],
                                                fontWeights['semibold'],
                                            ]}>
                                                {user?.pontuacao_ranking} Pts
                                            </Text>
                                        </View>
                                    </View>
                                }
                            />
                        </TouchableOpacity>

                        {/* Card de quadro de meus desafios */}
                        <Card
                            borderBottomColor={colors.blue[500]}
                            content={
                                <View
                                    style={[display.row, display.justifyContentBetween]}
                                >
                                    <TouchableOpacity
                                        style={[display.flex, display.row, display.justifyContentBetween]}
                                        onPress={navigateMeusDesafios}
                                    >
                                        <Text style={[{ color: colors.blue[900], fontSize: 18, fontWeight: 'bold' }]}>
                                            Meus Desafios
                                        </Text>
                                        <FontAwesome5 name="arrow-right" size={20} style={[{ color: colors.blue[900], marginRight: 8 }]} />
                                    </TouchableOpacity>
                                </View>
                            }
                        />

                        {/* Card de rotas */}
                        <Card
                            borderBottomColor={colors.blue[500]}
                            content={
                                <TouchableOpacity
                                    onPress={navigateRotasPublicas}
                                    style={[display.row, display.justifyContentBetween]}
                                >
                                    <View style={[display.row, display.alignItemsCenter, gap[5]]}>
                                        <FontAwesome5 name="route" size={20} style={[{ color: colors.blue[900], marginRight: 8 }]} />
                                        <View>
                                            <Text style={[fontWeights['bold'], fontSize['lg'], { color: colors.blue[900] }]}>
                                                Rotas
                                            </Text>
                                            <Text style={[fontWeights['bold'], fontSize['sm'], { color: colors.blue[900] }]}>
                                                {user?.totalRotas}
                                            </Text>
                                        </View>
                                    </View>
                                    <FontAwesome5 name="arrow-right" size={20} style={[{ color: colors.blue[900], marginRight: 8 }]} />
                                </TouchableOpacity>
                            }
                        />

                        {/* Card de quadro de medalhas */}
                        <Card
                            borderBottomColor={colors.blue[500]}
                            content={
                                <>
                                    <View style={[display.row, display.justifyContentBetween]}>
                                        <View style={[display.row, display.alignItemsCenter, gap[5]]}>
                                            <FontAwesome5 name="medal" size={20} style={[{ color: colors.blue[900], marginRight: 8 }]} />
                                            <Text style={[fontWeights['bold'], fontSize['lg'], { color: colors.blue[900] }]}>
                                                Quadro de Medalhas
                                            </Text>
                                        </View>
                                        {/* <FontAwesome5 name="arrow-right" size={20} style={[{ color: colors.blue[900], marginRight: 8 }]} /> */}
                                    </View>

                                    {/* Listar Conquistas agrupadas por ano */}
                                    {Object.entries(conquistas ?? {}).map(([ano, conquistasAno]) => (
                                        <View key={ano} style={{ marginTop: 15 }}>
                                            {/* Título do Ano */}
                                            <Text style={[fontWeights['bold'], fontSize['md'], { color: colors.blue[900], marginBottom: 5 }]}>
                                                {ano}
                                            </Text>

                                            {/* Ícones das Conquistas */}
                                            <View style={[display.row, { flexWrap: 'wrap', gap: 10 }, display.justifyContentBetween]}>
                                                {conquistasAno.map((item) => (
                                                    item.conquista && item.conquista.icone ? ( // Verifica se o objeto e o ícone existem
                                                        <View style={[display.alignItemsCenter]} key={item.id}>
                                                            <Image
                                                                key={item.id}
                                                                source={{ uri: item.conquista.icone }}
                                                                style={{ width: 30, height: 30 }}
                                                            />

                                                            <Text
                                                                style={[
                                                                    fontSize['3xs'],
                                                                    {
                                                                        color: colors.blue[900],
                                                                        textAlign: 'center',
                                                                        flexWrap: 'wrap',
                                                                        maxWidth: 50,
                                                                    }
                                                                ]}
                                                            >
                                                                {item.conquista.nome}
                                                            </Text>
                                                        </View>
                                                    ) : null
                                                ))}
                                            </View>
                                        </View>
                                    ))}
                                </>
                            }
                        />
                    </ScrollView>
                </View>
            )}
        </View >
    );
}