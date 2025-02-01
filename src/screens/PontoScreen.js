import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import api from '../services/api';
import styles from '../assets/css/styles';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';

export default function PontoScreen({ route }) {
    const { id } = route.params;
    const [ponto, setPonto] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingComentario, setIsLoadingComentario] = useState(false);
    const [comentario, setComentario] = useState(null);
    const [videoSource, setVideoSource] = useState(null);

    const player = useVideoPlayer(videoSource, player => {
        player.loop = true;
        player.play();
    });

    const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

    useEffect(() => {
        fetchPonto();
    }, [id]);

    const fetchPonto = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token');

        try {
            const response = await api.get(`/ponto/show/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            setVideoSource(`https://carazza.lksoftware.com.br/public/storage/${response.data.data.video_path}`)
            setPonto(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const openMap = async () => {
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${ponto?.latitude},${ponto?.longitude}`;
        Linking.openURL(googleMapsUrl);
    };

    const sendComentario = async () => {
        setIsLoadingComentario(true)
        try {
            const token = await AsyncStorage.getItem('token');

            const data = {
                ponto_id: id,
                comentario
            }

            const response = await api.post(`/comentario/store`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            fetchPonto();

            Alert.alert(response.data.message)
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoadingComentario(false)
        }
    }

    return (
        <ScrollView style={styles.container}>
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
                <>
                    <View style={{}}>
                        <VideoView
                            style={styles.video}
                            player={player}
                            allowsFullscreen
                            allowsPictureInPicture
                            nativeControls={true}
                        />
                    </View>

                    {/* Card 2: Informações */}
                    <View style={styles.card}>
                        <Text style={styles.infoTitle}>Informações</Text>

                        <Text style={styles.infoLabel}>Informações Complementares:</Text>
                        <Text style={styles.infoText}>
                            {ponto?.informacoes_complementares}
                        </Text>
                        <Text style={styles.infoLabel}>Descrição:</Text>
                        <Text style={styles.infoText}>{ponto?.descricao}</Text>
                    </View>

                    {/* Card 3: Horários */}
                    <View style={styles.card}>
                        <Text style={styles.infoTitle}>Horários</Text>

                        <Text style={styles.infoLabel}>Horário de Funcionamento:</Text>
                        <Text style={styles.infoText}>
                            {ponto?.hora_abertura} - {ponto?.hora_fechamento}
                        </Text>
                    </View>

                    {/* Card 4: Valores */}
                    <View style={styles.card}>
                        <Text style={styles.infoTitle}>Valores</Text>

                        <Text style={styles.infoLabel}>Mínimo Alimentação:</Text>
                        <Text style={styles.infoText}>
                            {ponto?.valor_minimo_alimentaca}
                        </Text>
                        <Text style={styles.infoLabel}>Máximo Alimentação:</Text>
                        <Text style={styles.infoText}>
                            {ponto?.valor_maximo_alimentaca}
                        </Text>
                        <Text style={styles.infoLabel}>Mínimo Hospedagem:</Text>
                        <Text style={styles.infoText}>
                            {ponto?.valor_minimo_hospedagem}
                        </Text>
                        <Text style={styles.infoLabel}>Máximo Hospedagem:</Text>
                        <Text style={styles.infoText}>
                            {ponto?.valor_maximo_hospedagem}
                        </Text>
                    </View>

                    {/* Card 5: Localização */}
                    <View style={styles.card}>
                        <Text style={styles.infoTitle}>Localização</Text>
                        <Text style={styles.infoLabel}>CEP:</Text>
                        <Text style={styles.infoText}>{ponto?.cep}</Text>
                        <Text style={styles.infoLabel}>Rua:</Text>
                        <Text style={styles.infoText}>
                            {ponto?.rua}, nº {ponto?.numero}, {ponto?.bairro}
                        </Text>
                        <Text style={styles.infoLabel}>Cidade - Estado</Text>
                        <Text style={styles.infoText}>
                            {ponto?.cidade} - {ponto?.estado}
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                { flexDirection: 'row', marginBottom: 20 },
                            ]}
                            onPress={openMap}>
                            <Ionicons
                                name="location-outline"
                                size={20}
                                color="#fff"
                                style={{ marginRight: 8 }}
                            />
                            <Text style={styles.buttonText}>Abrir no Google Maps</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Card 6: Galeria de Imagens */}
                    <View style={styles.card}>
                        <Text style={styles.infoTitle}>Galeria de Imagens</Text>
                        {ponto?.imagens && ponto.imagens.length > 0 ? (
                            ponto.imagens.map((imagem) => (
                                <View
                                    key={imagem.id}
                                    style={{ marginBottom: 10, marginTop: 20 }}>
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
                        <Text style={styles.infoTitle}>Comentários</Text>

                        <TextInput
                            style={[styles.textArea, { marginTop: 10 }]}
                            placeholder="Deixe seu comentário"
                            multiline
                            numberOfLines={4}
                            value={comentario}
                            onChangeText={(text) => setComentario(text)}
                        />

                        <View style={{ flex: 1 }}>
                            <TouchableOpacity
                                style={styles.buttonSend}
                                onPress={sendComentario}>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                    {isLoadingComentario ? (
                                        <>
                                            <ActivityIndicator
                                                style={{ marginRight: 10 }}
                                                size="small"
                                                color="#fff"
                                            />
                                            <Text style={styles.buttonTextSend}>Enviando</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.buttonTextSend}>Enviar</Text>
                                            <FontAwesome
                                                name="paper-plane"
                                                size={12}
                                                color="#fff"
                                                style={{ marginLeft: 8 }}
                                            />
                                        </>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>


                        <Text style={{ marginTop: 10 }}>
                            Lista de comentários
                        </Text>

                        {ponto?.comentarios && ponto.comentarios.length > 0 ? (
                            <View style={{ marginTop: 20 }}>
                                {ponto.comentarios.map((comentarioItem) => (
                                    <TouchableOpacity
                                        key={comentarioItem.id}
                                        onPress={() => Alert.alert('Comentário', comentarioItem.comentario)}
                                        style={{ marginBottom: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 5, borderRadius: 10 }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Image
                                                source={{ uri: comentarioItem.usuario.img_perfil }}
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 20,
                                                    marginRight: 10,
                                                }}
                                            />
                                            <Text style={{ fontWeight: 'bold' }}>
                                                {comentarioItem.usuario.apelido}
                                            </Text>
                                        </View>
                                        <Text style={{ marginTop: 5, marginLeft: 10 }}>
                                            {comentarioItem.comentario}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.infoText}>Nenhum comentário disponível.</Text>
                        )}
                    </View>
                </>
            )}
        </ScrollView>
    );
}
