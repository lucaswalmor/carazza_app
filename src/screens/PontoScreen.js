import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, ActivityIndicator, Linking, ScrollView, TouchableOpacity } from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { WebView } from 'react-native-webview';

const PontoScreen = ({ route }) => {
    const { id } = route.params;
    const [ponto, setPonto] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleNavigation = (event) => {
        const url = event.url;

        // Verifica se é uma URL desconhecida ou um esquema externo
        if (url.startsWith('http') || url.startsWith('https')) {
            // Permite links regulares
            return true;
        } else {
            // Impede carregamento de esquemas desconhecidos e tenta abrir no app nativo
            try {
                Linking.openURL(url); // Abre no app correspondente
            } catch (e) {
                console.warn('Erro ao tentar abrir o link:', url);
            }
            return false; // Bloqueia o carregamento da URL na WebView
        }
    };

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
                <ActivityIndicator size="large" color="#007BFF" />
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

    const openMap = async () => {
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${ponto.latitude},${ponto.longitude}`;
        Linking.openURL(googleMapsUrl);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Card 1: Video */}
            <View style={{}}>
                <WebView
                    originWhitelist={['*']}
                    source={{
                        html:
                            `
                            <!DOCTYPE html>
                            <html>
                                <head>
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                </head>
                                <body style="margin:0;padding:0;">
                                    ${ponto.codigo_video}
                                </body>
                            </html>
                        `
                    }}
                    style={{ width: '100%', height: 750 }}
                    onShouldStartLoadWithRequest={handleNavigation}
                />
            </View>

            {/* Card 2: Informações */}
            <View style={[styles.card]}>
                <Text style={styles.infoTitle}>
                    Informações
                </Text>

                <Text style={styles.infoLabel}>Informações Complementares:</Text>
                <Text style={styles.infoText}>{ponto.informacoes_complementares}</Text>
                <Text style={styles.infoLabel}>Descrição:</Text>
                <Text style={styles.infoText}>{ponto.descricao}</Text>
            </View>

            {/* Card 3: Horários */}
            <View style={[styles.card]}>
                <Text style={styles.infoTitle}>
                    Horários
                </Text>

                <Text style={styles.infoLabel}>Horário de Funcionamento:</Text>
                <Text style={styles.infoText}>{ponto.hora_abertura} - {ponto.hora_fechamento}</Text>
            </View>

            {/* Card 4: Valores */}
            <View style={[styles.card]}>
                <Text style={styles.infoTitle}>
                    Valores
                </Text>

                <Text style={styles.infoLabel}>Mínimo Alimentação:</Text>
                <Text style={styles.infoText}>{ponto.valor_minimo_alimentaca}</Text>
                <Text style={styles.infoLabel}>Máximo Alimentação:</Text>
                <Text style={styles.infoText}>{ponto.valor_maximo_alimentaca}</Text>
                <Text style={styles.infoLabel}>Mínimo Hospedagem:</Text>
                <Text style={styles.infoText}>{ponto.valor_minimo_hospedagem}</Text>
                <Text style={styles.infoLabel}>Máximo Hospedagem:</Text>
                <Text style={styles.infoText}>{ponto.valor_maximo_hospedagem}</Text>
            </View>

            {/* Card 5: Localização */}
            <View style={[styles.card, {marginBottom: 50}]}>
                <Text style={styles.infoTitle}>
                    Localização
                </Text>
                <Text style={styles.infoLabel}>CEP:</Text>
                <Text style={styles.infoText}>{ponto.cep}</Text>
                <Text style={styles.infoLabel}>Rua:</Text>
                <Text style={styles.infoText}>{ponto.rua}, nº {ponto.numero}, {ponto.bairro}</Text>
                <Text style={styles.infoLabel}>Cidade - Estado</Text>
                <Text style={styles.infoText}>{ponto.cidade} - {ponto.estado}</Text>

                <TouchableOpacity style={styles.buttonDanger} onPress={openMap}>
                    <Text style={styles.buttonText}>Pausar Assinatura</Text>
                </TouchableOpacity>

                {ponto.latitude && ponto.longitude ? (
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
                ) : (
                    <Text style={styles.errorText}>Coordenadas inválidas</Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 50,
    },
    video: {
        width: 350,
        height: 275,
    },
    controlsContainer: {
        padding: 10,
    },
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
        backgroundColor: '#007BFF',
    },
    infoTitle: {
        fontSize: 16,
        color: '#007BFF',
        fontWeight: 'bold'
    }
});

export default PontoScreen;
