import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator } from "react-native";
import Card from "../components/Card";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, display } from "../assets/css/primeflex";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RankingGeralScreen() {
    const [ranking, setRanking] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchRanking = async () => {
            setIsLoading(true)
            const token = await AsyncStorage.getItem('token');
            try {
                const response = await api.get("/ranking-geral/top50", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setRanking(response.data);
            } catch (error) {
                console.error("Erro ao buscar ranking:", error);
            } finally {
                setIsLoading(false)
            }
        };

        fetchRanking();
    }, []);

    // Preencher a lista com dados vazios para completar 50 participantes
    const rankingList = [...ranking, ...Array(50 - ranking.length).fill({ nome: '---', pontos_totais: 0 })];

    return (
        <SafeAreaView style={{ flex: 1, padding: 10 }}>
            <ScrollView style={{ flex: 1 }}>
                {isLoading ? (
                    <>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            <ActivityIndicator size="large" color="#007BFF" />
                        </View>
                    </>
                ) : (
                    <Card
                        title={
                            <Text style={[{ color: colors.blue[500] }, { fontSize: 22, fontWeight: "bold" }]}>
                                Ranking Geral
                            </Text>
                        }
                        content={
                            <View>
                                {rankingList.map((item, index) => (
                                    <View key={index} style={[display.row, display.alignItemsCenter, { marginBottom: 10 }]}>
                                        {/* Medalhas para os 3 primeiros */}
                                        {index < 3 ? (
                                            <Image
                                                source={
                                                    index === 0
                                                        ? require('../assets/icons/gold-medal8.png')
                                                        : index === 1
                                                            ? require('../assets/icons/silver-medal8.png')
                                                            : require('../assets/icons/bronze-medal8.png')
                                                }
                                                style={{ width: 40, height: 40, marginRight: 10 }}
                                            />
                                        ) : (
                                            <Text style={{ fontWeight: "bold", width: 40, textAlign: "center" }}>
                                                {index + 1}º
                                            </Text>
                                        )}

                                        {/* Nome do jogador */}
                                        <Text style={{ fontSize: 18, flex: 1 }}>{item.nome}</Text>

                                        {/* Pontos totais */}
                                        <Text style={{ fontSize: 16, color: colors.blue[500] }}>
                                            {item.pontos_totais} pts
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        }
                    />

                )}
            </ScrollView>
        </SafeAreaView>
    );
}
