import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../services/api';
import styles from '../../styles';
import { WebView } from 'react-native-webview';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export default function PontoScreen({ route }) {
    const { id } = route.params;
    const [ponto, setPonto] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingComentario, setIsLoadingComentario] = useState(false);
    const [comentario, setComentario] = useState(null);

    useEffect(() => {
        const fetchPonto = async () => {
            setIsLoading(true)
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

    const handleNavigation = (event) => {
        setIsLoading(true)

        const url = event.url;

        // Verifica se é uma URL desconhecida ou um esquema externo
        if (url.startsWith('http') || url.startsWith('https')) {
            // Permite links regulares
            return true;
        } else {
            // Impede carregamento de esquemas desconhecidos e tenta abrir no app nativo
            try {
                setIsLoading(false);
                Linking.openURL(url); // Abre no app correspondente
            } catch (e) {
                setIsLoading(false);
                console.warn('Erro ao tentar abrir o link:', url);
            }
            setIsLoading(false);
            return false; // Bloqueia o carregamento da URL na WebView
        }
    };

    const handleSubmit = () => {
        console.log(comentario)
    }

    const openMap = async () => {
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${ponto?.latitude},${ponto?.longitude}`;
        Linking.openURL(googleMapsUrl);
    };

    return (
        <ScrollView style={styles.container}>
            {isLoading ? (
                <>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color="#007BFF" />
                    </View>
                </>
            ) : (
                <>
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
                                ${ponto?.codigo_video}
                            </body>
                        </html>
                    `
                            }}
                            style={{ width: '100%', height: 750 }}
                            onShouldStartLoadWithRequest={handleNavigation}
                        />
                    </View>

                    {/* Card 2: Informações */}
                    <View style={styles.card}>
                        <Text style={styles.infoTitle}>
                            Informações
                        </Text>

                        <Text style={styles.infoLabel}>Informações Complementares:</Text>
                        <Text style={styles.infoText}>{ponto?.informacoes_complementares}</Text>
                        <Text style={styles.infoLabel}>Descrição:</Text>
                        <Text style={styles.infoText}>{ponto?.descricao}</Text>
                    </View>

                    {/* Card 3: Horários */}
                    <View style={styles.card}>
                        <Text style={styles.infoTitle}>
                            Horários
                        </Text>

                        <Text style={styles.infoLabel}>Horário de Funcionamento:</Text>
                        <Text style={styles.infoText}>{ponto?.hora_abertura} - {ponto?.hora_fechamento}</Text>
                    </View>

                    {/* Card 4: Valores */}
                    <View style={styles.card}>
                        <Text style={styles.infoTitle}>
                            Valores
                        </Text>

                        <Text style={styles.infoLabel}>Mínimo Alimentação:</Text>
                        <Text style={styles.infoText}>{ponto?.valor_minimo_alimentaca}</Text>
                        <Text style={styles.infoLabel}>Máximo Alimentação:</Text>
                        <Text style={styles.infoText}>{ponto?.valor_maximo_alimentaca}</Text>
                        <Text style={styles.infoLabel}>Mínimo Hospedagem:</Text>
                        <Text style={styles.infoText}>{ponto?.valor_minimo_hospedagem}</Text>
                        <Text style={styles.infoLabel}>Máximo Hospedagem:</Text>
                        <Text style={styles.infoText}>{ponto?.valor_maximo_hospedagem}</Text>
                    </View>

                    {/* Card 5: Localização */}
                    <View style={[styles.card]}>
                        <Text style={styles.infoTitle}>
                            Localização
                        </Text>
                        <Text style={styles.infoLabel}>CEP:</Text>
                        <Text style={styles.infoText}>{ponto?.cep}</Text>
                        <Text style={styles.infoLabel}>Rua:</Text>
                        <Text style={styles.infoText}>{ponto?.rua}, nº {ponto?.numero}, {ponto?.bairro}</Text>
                        <Text style={styles.infoLabel}>Cidade - Estado</Text>
                        <Text style={styles.infoText}>{ponto?.cidade} - {ponto?.estado}</Text>

                        <TouchableOpacity style={[styles.button, { flexDirection: 'row', marginBottom: 20 }]} onPress={openMap}>
                            <Ionicons name="location-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Abrir no Google Maps</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Card 6: Galeria de Imagens */}
                    <View style={[styles.card]}>
                        <Text style={styles.infoTitle}>Galeria de Imagens</Text>
                        {ponto?.imagens && ponto.imagens.length > 0 ? (
                            ponto.imagens.map((imagem) => (
                                <View key={imagem.id} style={{ marginBottom: 10, marginTop: 20 }}>
                                    <Image
                                        source={{ uri: imagem.path }}
                                        style={{ width: '100%', height: 200, borderRadius: 10 }}
                                        resizeMode="cover"
                                    />
                                </View>
                            ))
                        ) : (
                            <Text style={styles.infoText}>Nenhuma imagem disponível.</Text>
                        )}
                    </View>

                    {/* Card 6: Comentários */}
                    <View style={[styles.card, { marginBottom: 100 }]}>
                        <Text style={styles.infoTitle}>
                            Comentários
                        </Text>

                        <Text style={{ marginTop: 10, marginBottom: 10 }}>
                            Lista de comentários
                        </Text>

                        <TextInput
                            style={[styles.textArea, { marginTop: 10 }]}
                            placeholder="Deixe seu comentário"
                            multiline
                            numberOfLines={4}
                            value={comentario}
                            onChangeText={(text) => setComentario(text)}
                        />

                        <View style={{ flex: 1 }}>
                            <TouchableOpacity style={styles.buttonSend} onPress={handleSubmit}>
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    {isLoadingComentario ? (
                                        <>
                                            <ActivityIndicator style={{ marginRight: 10 }} size="small" color="#fff" />
                                            <Text style={styles.buttonText}>Enviando</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.buttonTextSend}>Enviar</Text>
                                            {/* <Ionicons name="send-outline" size={12} color="#fff" style={{ marginLeft: 8 }} /> */}
                                            <FontAwesome name="paper-plane" size={12} color="#fff" style={{ marginLeft: 8 }} />
                                        </>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}
        </ScrollView>
    );
}