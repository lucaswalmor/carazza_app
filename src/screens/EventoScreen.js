import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Button,
    FlatList,
    Image,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import api from '../services/api';
import styles from '../assets/css/styles';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import Toast from '../components/Toast';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import Botao from '../components/Botao';
import { colors, display, fontSize, fontWeights, gap, shadows } from '../assets/css/primeflex';
import Loader from '../components/Loader';

export default function EventoScreen({ route }) {
    const { id } = route.params;
    const [evento, setEvento] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCheckin, setIsLoadingCheckin] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', position: 'bottom', severity: '' });
    const navigation = useNavigation();

    useEffect(() => {
        fetchEvento();
    }, []);

    const fetchEvento = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token');

        try {
            const response = await api.get(`/evento/show/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.data) {
                setEvento(response.data.data);
                setIsLoading(false);
            }
        } catch (error) {
            console.log(error.response.data);
            setIsLoading(false);
        }
    };

    const openMap = async () => {
        Linking.openURL(evento?.link_maps_evento);
    };

    const openMapPasseioMapa = async () => {
        Linking.openURL(evento?.link_maps_passeio);
    };

    const confirmPresenca = async () => {
        Alert.alert(
            'Gostaria de confirmar presença neste evento?',
            'Ao confirmar presença neste evento você entrará na lista de presenças confirmadas',
            [
                { text: 'Cancelar', onPress: () => { }, style: 'cancel' },
                { text: 'OK', onPress: () => handleConfirm() },
            ],
            { cancelable: true }
        );
    }

    const showToast = (message, position, severity) => {
        setToast({ visible: true, message, position, severity });

        // Esconde o toast após 3 segundos
        setTimeout(() => setToast({ ...toast, visible: false }), 3000);
    };

    const handleConfirm = async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            const response = await api.get(`/evento/confirmar-presenca/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            showToast(response.data.message, 'top', 'success')
            fetchEvento();
        } catch (error) {
            showToast(error.response.data.error, 'top', 'danger')
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
            const response = await api.post(`/evento/${evento.id}/checkin`, {
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

    if (!evento) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Loader />
            </View>
        )
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
                        {/* Card 1: Logo e Nome do evento */}
                        <View style={[styles.card, { gap: 10, alignItems: 'center', justifyContent: 'center' }]}>
                            <Image
                                source={{ uri: evento?.path_logo || 'https://i.ibb.co/5kkRBSS/default-Avatar.png' }}
                                style={styles.logoEvento}
                                onError={() => console.log('Erro ao carregar a imagem.')}
                            />

                            <Text style={styles.infoTitle}>
                                {evento?.nome}
                            </Text>
                        </View>


                        {/* Botao de CHECKIN */}
                        {evento.encontro_acontecendo && (
                            <View>
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
                            </View>
                        )}

                        {/* Card 2: Datas e horários */}
                        <View style={styles.card}>
                            <Text style={styles.infoTitle}>Datas e Horários</Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={styles.infoLabel}>Data de início:</Text>
                                    <Text style={styles.infoText}>{evento?.data_inicio}</Text>
                                </View>
                                <View>
                                    <Text style={styles.infoLabel}>Data de Término:</Text>
                                    <Text style={styles.infoText}>{evento?.data_termino}</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={styles.infoLabel}>Horários do evento</Text>
                                <Text style={styles.infoText}>
                                    {evento?.horario_inicio} às {evento?.horario_termino}
                                </Text>
                            </View>
                        </View>

                        {/* Card 3: Detalhes do evento */}
                        <View style={styles.card}>
                            <Text style={styles.infoTitle}>Detalhes do Evento</Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={styles.infoLabel}>Entrada:</Text>
                                    <Text style={styles.infoText}>
                                        {evento.bol_entrada_paga ? 'Paga' : 'Gratuíta'}
                                    </Text>
                                </View>
                                <View>
                                    {evento.bol_entrada_paga ? (
                                        <>
                                            <Text style={styles.infoLabel}>Valor:</Text>
                                            <Text style={styles.infoText}>
                                                {evento?.valor_entrada}
                                            </Text>
                                        </>
                                    ) : null}
                                </View>
                            </View>

                            <View style={[display.row, display.alignItemsCenter, display.justifyContentBetween]}>
                                {evento && evento.lotacao_maxima ? (
                                    <View>
                                        <Text style={styles.infoLabel}>Lotação máxima:</Text>
                                        <Text style={styles.infoText}>
                                            {evento?.lotacao_maxima}
                                        </Text>
                                    </View>
                                ) : null}

                                {evento.idade_minima ? (
                                    <View>
                                        <Text style={styles.infoLabel}>Idade Mínima:</Text>
                                        <Text style={styles.infoText}>
                                            {evento?.idade_minima}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>

                            {evento && evento.bol_entrada_paga && evento.link_ingressos ? (
                                <>
                                    <TouchableOpacity onPress={() => Linking.openURL(evento?.link_ingressos)}>
                                        <Text style={[styles.infoText, { color: 'blue', textDecorationLine: 'underline' }]}>
                                            {evento?.link_ingressos}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : null}

                            {evento && evento.regras ? (
                                <>
                                    <Text style={styles.infoLabel}>Regras:</Text>
                                    <Text style={styles.infoText}>
                                        {evento?.regras}
                                    </Text>
                                </>
                            ) : null}
                        </View>

                        {/* Card 4: Outros */}
                        <View style={styles.card}>
                            <Text style={styles.infoTitle}>Outros</Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={styles.infoLabel}>Shows ao vivo:</Text>
                                    <Text style={styles.infoText}>
                                        {evento?.bol_shows_musicais ? 'Sim' : 'Não'}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.infoLabel}>Food Truck:</Text>
                                    <Text style={styles.infoText}>
                                        {evento?.bol_foodtrucks ? 'Sim' : 'Não'}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={styles.infoLabel}>Estacionamento:</Text>
                                    <Text style={styles.infoText}>
                                        {evento?.bol_estacionamento ? 'Sim' : 'Não'}
                                    </Text>
                                </View>

                                <View>
                                    <Text style={styles.infoLabel}>Estacionamento Pago:</Text>
                                    <Text style={styles.infoText}>
                                        {evento?.bol_estacionamento_pago ? 'Sim' : 'Não'}
                                    </Text>
                                </View>
                            </View>

                            {evento.bol_estacionamento_pago ? (
                                <>
                                    <Text style={styles.infoLabel}>Valor do Estacionamento:</Text>
                                    <Text style={styles.infoText}>
                                        {evento.valor_estacionamento}
                                    </Text>
                                </>
                            ) : null}
                        </View>

                        {/* Card 5: Organizacao do evento */}
                        <View style={styles.card}>
                            <Text style={styles.infoTitle}>Organização</Text>

                            <Text style={styles.infoLabel}>Organizador:</Text>
                            <Text style={styles.infoText}>
                                {evento?.nome_organizador}
                            </Text>

                            <Text style={styles.infoLabel}>Telefone Contato:</Text>
                            <Text style={styles.infoText}>
                                {evento?.whatsapp}
                            </Text>

                            <Text style={styles.infoLabel}>Email Contato:</Text>
                            <Text style={styles.infoText}>
                                {evento?.email_contato}
                            </Text>

                            {evento.instagram && (
                                <>
                                    <Text style={styles.infoLabel}>Instagram:</Text>
                                    <TouchableOpacity style={[display.row, display.alignItemsCenter, gap[2]]} onPress={() => Linking.openURL(`https://www.instagram.com/${evento?.instagram}`)}>
                                        <FontAwesome5 name="instagram" size={16} color="blue" />
                                        <Text style={[{ color: 'blue', textDecorationLine: 'underline' }]}>
                                            {evento?.instagram}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {evento.site && (
                                <>
                                    <Text style={styles.infoLabel}>Site:</Text>
                                    <TouchableOpacity onPress={() => Linking.openURL(`${evento?.site}`)}>
                                        <Text style={[styles.infoText, { color: 'blue', textDecorationLine: 'underline' }]}>
                                            {evento?.site}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>

                        {/* Card 7: Localização */}
                        <View style={[styles.card]}>
                            <Text style={styles.infoTitle}>Localização</Text>
                            <Text style={styles.infoLabel}>Local:</Text>
                            <Text style={styles.infoText}>{evento?.local}</Text>

                            <Text style={styles.infoLabel}>CEP:</Text>
                            <Text style={styles.infoText}>{evento?.cep}</Text>

                            <Text style={styles.infoLabel}>Rua:</Text>
                            <Text style={styles.infoText}>
                                {evento?.rua}, nº {evento?.numero}, {evento?.bairro}
                            </Text>

                            <Text style={styles.infoLabel}>Cidade - Estado</Text>
                            <Text style={styles.infoText}>
                                {evento?.cidade} - {evento?.estado}
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

                        <View style={styles.card}>
                            <Text style={styles.infoTitle}>Patrocinadores</Text>
                            {evento?.patrocinadores?.map((item) => (
                                <View
                                    key={item.id}
                                    style={[display.row, display.alignItemsCenter, gap[3], { marginTop: 25 }]}
                                >
                                    <Image source={{ uri: item?.path_logo }} style={styles.avatar} />
                                    <View>
                                        <Text style={[fontSize['lg'], fontWeights['bold']]}>{item?.nome}</Text>

                                        <TouchableOpacity
                                            onPress={() => {
                                                const instagramUrl = `https://instagram.com/${item?.instagram}`;
                                                Linking.openURL(instagramUrl).catch((err) =>
                                                    console.error('Erro ao abrir o Instagram', err)
                                                );
                                            }}
                                        >
                                            <View style={[display.row, display.alignItemsCenter]}>
                                                <FontAwesome5 name="instagram" size={16} color="blue" />
                                                <Text style={[{ color: 'blue', textDecorationLine: 'underline', marginLeft: 5 }]}>
                                                    {item?.instagram}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>


                        {/* Card 8: Participação */}
                        <View style={[styles.card, { marginBottom: 100 }]}>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    { flexDirection: 'row', marginBottom: 20 },
                                ]}
                                onPress={confirmPresenca}>
                                <FontAwesome5 name="user-check" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.buttonText}>Confirmar Presença</Text>
                            </TouchableOpacity>

                            <Text style={[styles.infoTitle, { textAlign: 'center' }]}>List de Presenças Confirmadas</Text>


                            {evento?.participantes && evento.participantes.length > 0 ? (
                                <View style={{ marginTop: 20 }}>
                                    {evento.participantes.map((participante) => (
                                        <TouchableOpacity
                                            key={participante.id}
                                            onPress={() => lookPerfil(participante)}
                                            style={{ marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 10, borderRadius: 10 }}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Image
                                                    source={{ uri: participante.img_perfil }}
                                                    style={{
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: 20,
                                                        marginRight: 10,
                                                    }}
                                                />
                                                <Text style={{ fontWeight: 'bold' }}>
                                                    {participante.apelido}
                                                </Text>
                                            </View>
                                            <FontAwesome5 name="eye" size={18} color="#1d1e22" style={{ marginRight: 8 }} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : (
                                <Text style={{ textAlign: 'center', padding: 10, backgroundColor: '#f5f5f5', fontStyle: 'italic', marginTop: 10 }}>Ainda não hà presenças confirmadas.</Text>
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
