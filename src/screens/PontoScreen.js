import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
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
import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import Toast from '../components/Toast';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import Loader from '../components/Loader';

export default function PontoScreen({ route }) {
    const { id } = route.params;
    const navigation = useNavigation();
    const [ponto, setPonto] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingComentario, setIsLoadingComentario] = useState(false);
    const [isLoadingCheckin, setIsLoadingCheckin] = useState(false);
    const [comentario, setComentario] = useState(null);
    const [toast, setToast] = useState({ visible: false, message: '', position: 'bottom', severity: '' });
    const [videoSource, setVideoSource] = useState(null);

    const player = useVideoPlayer(videoSource, player => {
        player.loop = true;
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

            const videoPath = response.data.data.video_path;

            if (videoPath) {
                setVideoSource(`https://api.motostrada.com.br/storage/${videoPath}`);
            } else {
                setVideoSource(null);
            }

            setPonto(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const redirectToGps = async () => {
        navigation.navigate('Main', {
            screen: 'Home',
            params: {
                screen: 'GPS',
                params: {
                    destLatitude: ponto.latitude,
                    destLongitude: ponto.longitude
                }
            }
        });
    }

    const openMap = async () => {
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${ponto?.latitude},${ponto?.longitude}`;
        Linking.openURL(googleMapsUrl);
    };

    const showToast = (message, position, severity) => {
        setToast({ visible: true, message, position, severity });

        // Esconde o toast após 3 segundos
        setTimeout(() => setToast({ ...toast, visible: false }), 3000);
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

            showToast(response.data.message, 'top', 'success')
        } catch (error) {
            showToast(error.response.data.error, 'top', 'danger')
        } finally {
            setIsLoadingComentario(false)
        }
    }

    const handleCheckin = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            setIsLoadingCheckin(true)

            // Solicita a permissão apenas quando o usuário clicar no botão
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'Você precisa conceder acesso à localização para fazer o check-in.');
                return;
            }

            // Obtém a localização do usuário
            let userLocation = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = userLocation.coords;

            // Envia as coordenadas para o Laravel
            const response = await api.post(`/ponto/${ponto.id}/checkin`, {
                latitude,
                longitude,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            showToast(response.data.message, 'top', 'success')
        } catch (error) {
            showToast(error.response.data.error, 'top', 'danger')
        } finally {
            setIsLoadingCheckin(false)
        }
    };

    const lookPerfil = async (item) => {
        navigation.navigate('PerfilPublicoScreen', { id: item.user_id });
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                {isLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Loader />
                    </View>
                ) : (
                    <>
                        {videoSource && (
                            <View style={{}}>
                                <VideoView
                                    style={styles.video}
                                    player={player}
                                    allowsFullscreen
                                    allowsPictureInPicture
                                    nativeControls={true}
                                />
                            </View>
                        )}

                        {/* Botao de checkin */}
                        {/* <View>
                            <Botao severity="help" style={[shadows['shadow5']]} onPress={() => handleCheckin()}>
                                <View style={styles.buttonContent}>
                                    {isLoadingCheckin ? (
                                        <>
                                            <ActivityIndicator
                                                style={styles.loadingIndicator}
                                                size="small"
                                                color="#fff"
                                            />
                                            <Text style={styles.buttonText}>Aguarde</Text>
                                        </>
                                    ) : (
                                        <Text style={[fontSize['lg'], { color: colors.alpha[1000] }]}>Fazer Check-In</Text>
                                    )}
                                </View>
                            </Botao>
                        </View> */}

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
                                    { flexDirection: 'row', },
                                ]}
                                onPress={redirectToGps}>
                                <Ionicons
                                    name="location-outline"
                                    size={20}
                                    color="#fff"
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={styles.buttonText}>Abrir GPS MotoStrada</Text>
                            </TouchableOpacity>

                            {/* <TouchableOpacity
                                style={[
                                    styles.button,
                                    { flexDirection: 'row', marginBottom: 20,  backgroundColor: colors.gray[500] },
                                ]}
                                onPress={openMap}>
                                <Ionicons
                                    name="location-outline"
                                    size={20}
                                    color="#fff"
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={styles.buttonText}>Abrir no Google Maps</Text>
                            </TouchableOpacity> */}
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
                                    style={styles.button}
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
                                                <Text style={styles.buttonText}>Enviar</Text>
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
                                            onPress={() => lookPerfil(comentarioItem)}
                                            style={{ marginBottom: 15, backgroundColor: '#f5f5f5', padding: 5, borderRadius: 10 }}
                                        >
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Image
                                                        source={{ uri: comentarioItem.usuario.img_perfil }}
                                                        style={{
                                                            width: 20,
                                                            height: 20,
                                                            borderRadius: 20,
                                                            marginRight: 10,
                                                        }}
                                                    />
                                                    <Text style={{ fontWeight: 'bold' }}>
                                                        {comentarioItem.usuario.apelido}
                                                    </Text>
                                                </View>
                                                <FontAwesome5 name="eye" size={18} color="#1d1e22" style={{ marginRight: 8 }} />
                                            </View>
                                            <Text style={{ marginTop: 15, marginLeft: 10 }}>
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

            {toast.visible && (
                <Toast
                    message={toast.message}
                    position={toast.position}
                    onClose={() => setToast({ ...toast, visible: false })}
                    severity={toast.severity}
                />
            )}
        </View>
    );
}
