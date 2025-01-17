import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Linking, ScrollView } from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Button, Card } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location'; // Importa a biblioteca de localização do Expo
// import styles from '../assets/css/styles';

const PontoScreen = ({ route }) => {
    const { id } = route.params;
    const [ponto, setPonto] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const mapRef = useRef(null);

    useEffect(() => {
        const fetchPonto = async () => {
            const token = await AsyncStorage.getItem('token');

            try {
                const response = await api.get(`/ponto/show/${id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                setPonto(response.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPonto();
    }, [id]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    if (!ponto) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Ponto não encontrado.</Text>
            </View>
        );
    }

    const handleCenterMap = () => {
        openMap();
    };

    const openMap = async () => {
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${ponto.latitude},${ponto.longitude}`;
        Linking.openURL(googleMapsUrl);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Card 2: Informações */}
            <Card style={styles.card}>
                <Card.Title title="Informações" />
                <Card.Content>
                    <Text style={styles.infoLabel}>Informações Complementares:</Text>
                    <Text style={styles.infoText}>{ponto.informacoes_complementares}</Text>
                    <Text style={styles.infoLabel}>Descrição:</Text>
                    <Text style={styles.infoText}>{ponto.descricao}</Text>
                </Card.Content>
            </Card>

            {/* Card 2: Informações */}
            <Card style={styles.card}>
                <Card.Title title="Horários" />
                <Card.Content>
                    <Text style={styles.infoLabel}>Horário de Funcionamento:</Text>
                    <Text style={styles.infoText}>{ponto.hora_abertura} - {ponto.hora_fechamento}</Text>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Title title="Valors do local" />
                <Card.Content>
                    <Text style={styles.infoText}>{ponto.hora_abertura} - {ponto.hora_fechamento}</Text>
                    <Text style={styles.infoLabel}>Mínimo Alimentação:</Text>
                    <Text style={styles.infoText}>{ponto.valor_minimo_alimentaca}</Text>
                    <Text style={styles.infoLabel}>Máximo Alimentação:</Text>
                    <Text style={styles.infoText}>{ponto.valor_maximo_alimentaca}</Text>
                    <Text style={styles.infoLabel}>Mínimo Hospedagem:</Text>
                    <Text style={styles.infoText}>{ponto.valor_minimo_hospedagem}</Text>
                    <Text style={styles.infoLabel}>Máximo Hospedagem:</Text>
                    <Text style={styles.infoText}>{ponto.valor_maximo_hospedagem}</Text>
                </Card.Content>
            </Card>

            {/* Card 1: Localização */}
            <Card style={styles.card}>
                <Card.Title title="Localização" />
                <Card.Content>
                    <Text style={styles.infoLabel}>CEP:</Text>
                    <Text style={styles.infoText}>{ponto.cep}</Text>
                    <Text style={styles.infoLabel}>Rua:</Text>
                    <Text style={styles.infoText}>{ponto.rua}</Text>
                    <Text style={styles.infoLabel}>Bairro:</Text>
                    <Text style={styles.infoText}>{ponto.bairro}</Text>
                    <Text style={styles.infoLabel}>Cidade:</Text>
                    <Text style={styles.infoText}>{ponto.cidade}</Text>
                    <Text style={styles.infoLabel}>Estado:</Text>
                    <Text style={styles.infoText}>{ponto.estado}</Text>
                    <Text style={styles.infoLabel}>Número:</Text>
                    <Text style={styles.infoText}>{ponto.numero}</Text>

                    <Button mode="contained" onPress={openMap} style={styles.button}>
                        Ver no Mapa
                    </Button>

                    {ponto.latitude && ponto.longitude ? (
                        <>
                            <MapView
                                style={{ height: 200, marginTop: 10 }}
                                initialRegion={{
                                    latitude: parseFloat(ponto.latitude),
                                    longitude: parseFloat(ponto.longitude),
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: parseFloat(ponto.latitude),
                                        longitude: parseFloat(ponto.longitude),
                                    }}
                                    title="Ponto Localização"
                                />
                            </MapView>

                            <Button mode="contained" onPress={handleCenterMap} style={styles.button}>
                                Voltar para o local
                            </Button>
                        </>
                    ) : (
                        <Text style={styles.errorText}>Coordenadas inválidas</Text>
                    )}
                </Card.Content>
            </Card>

            {/* Card 3: Vídeo */}
            <Card style={[styles.card, {marginBottom: 30}]}>
                <Card.Title title="Vídeo" />
                <Card.Content>
                    <View style={{ flex: 1, padding: 10 }}>
                        <YoutubePlayer
                            height={200}
                            play={true}
                            videoId={ponto.codigo_video}
                            onChangeState={(state) => console.log(state)}
                        />
                    </View>
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    card: {
        marginBottom: 16,
        borderRadius: 8,
        elevation: 3,
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 5,  // Adiciona a espessura da borda inferior
        borderBottomColor: '#007BFF',  // Cor da borda inferior
    },
    h2: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    descricao: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    cidadeEstado: {
        fontSize: 16,
        color: '#555',
        marginBottom: 16,
    },
    infoLabel: {
        fontSize: 14,
        color: '#777',
        marginTop: 8,
        fontWeight: 'bold',
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    button: {
        marginTop: 10,
        backgroundColor: '#007bff',
    },
});

export default PontoScreen;
