import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native"; // Importe o componente Image
import MapView, { Marker, Overlay, Polyline } from "react-native-maps";
import api from "../services/api";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { borders, colors, display, fontSize, fontWeights, gap, margins } from "../assets/css/primeflex";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RotaUsuarioScreen({ route }) {
    const { id } = route.params;
    const [rota, setRota] = useState([]);
    const [distancia, setDistancia] = useState([]);
    const [velocidadeMedia, setVelocidadeMedia] = useState([]);
    const [usuarioRota, setUsuarioRota] = useState("");
    const [titulo, setTitulo] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const mapViewRef = useRef(null); // Ref para o mapa
    const mapContainerRef = useRef(null); // Ref para o contêiner do mapa

    useEffect(() => {
        getRoute();
    }, []);

    const getRoute = async () => {
        const token = await AsyncStorage.getItem('token');

        try {
            const response = await api.get(`rota/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            setTitulo(response.data.titulo)
            setRota(response.data.rota);
            setUsuarioRota(response.data.usuario)
            setDistancia(response.data.distancia_total_km);
            setVelocidadeMedia(response.data.velocidade_media_kmh);
        } catch (error) {
            console.log(error.response?.data?.error || "Erro ao carregar a rota");
        }
    };

    // Função para calcular a região inicial do mapa
    const calculateRegion = (coordinates) => {
        if (!coordinates || coordinates.length === 0) return null;
        let minLat = Math.min(...coordinates.map((coord) => coord.latitude));
        let maxLat = Math.max(...coordinates.map((coord) => coord.latitude));
        let minLng = Math.min(...coordinates.map((coord) => coord.longitude));
        let maxLng = Math.max(...coordinates.map((coord) => coord.longitude));
        const latitudeDelta = maxLat - minLat;
        const longitudeDelta = maxLng - minLng;
        return {
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: latitudeDelta * 1.1, // Adiciona margem
            longitudeDelta: longitudeDelta * 1.1, // Adiciona margem
        };
    };

    const region = calculateRegion(rota);

    const handleShare = async () => {
        setIsLoading(true)
        try {
            // Captura apenas o contêiner do mapa (incluindo o logo)
            const uri = await captureRef(mapContainerRef, {
                format: "png",
                quality: 0.8,
                result: "tmpfile",
            });

            // Verifica se a plataforma suporta o compartilhamento
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri); // Compartilha a imagem
                setIsLoading(false)
            } else {
                alert("Compartilhamento não suportado neste dispositivo.");
                setIsLoading(false)
            }
        } catch (error) {
            setIsLoading(false)
            console.log("Erro ao capturar e compartilhar o mapa:", error);
        }
    };

    return (
        <View style={styles.container}>
            {region ? (
                <>
                    <TouchableOpacity
                        style={[styles.shareButton, isLoading && { opacity: 0.5 }]}
                        onPress={handleShare}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <FontAwesome5 name="share-alt" size={24} color="#FFF" />
                        )}
                    </TouchableOpacity>


                    {/* Contêiner do mapa com ref */}
                    <View ref={mapContainerRef} collapsable={false} style={[styles.mapContainer]}>
                        {/* Logo no canto superior esquerdo */}

                        {/* Mapa */}
                        <MapView
                            style={styles.map}
                            initialRegion={region}
                            ref={mapViewRef}
                            scrollEnabled={false} // Impede rolagem
                            zoomEnabled={false} // Impede zoom
                            rotateEnabled={false} // Impede rotação
                            pitchEnabled={false} // Impede alteração do ângulo da câmera
                            pointerEvents="none"
                        >
                            {/* Marcador do ponto inicial */}
                            {rota.length > 0 && (
                                <Marker
                                    coordinate={{
                                        latitude: rota[0].latitude,
                                        longitude: rota[0].longitude,
                                    }}
                                    title="Início"
                                    description="Ponto inicial da rota"
                                    pinColor="green"
                                    tappable={false}
                                />
                            )}
                            {/* Marcador do ponto final */}
                            {rota.length > 0 && (
                                <Marker
                                    coordinate={{
                                        latitude: rota[rota.length - 1].latitude,
                                        longitude: rota[rota.length - 1].longitude,
                                    }}
                                    title="Fim"
                                    description="Ponto final da rota"
                                    pinColor="red" // Define a cor do marcador
                                    tappable={false}
                                />
                            )}
                            {/* Desenha a rota */}
                            <Polyline
                                coordinates={rota}
                                strokeColor="#FF0000" // Cor da linha
                                strokeWidth={4} // Espessura da linha
                            />
                        </MapView>

                        {titulo && (
                            <View style={[display.row, display.alignItemsCenter, display.justifyContentCenter, { backgroundColor: colors.alpha[1000], paddingTop: 10 }]}>
                                <Text style={[fontWeights['bold']]}>{titulo}</Text>
                            </View>
                        )}

                        <View style={[display.row, gap[10], display.alignItemsCenter, { backgroundColor: colors.alpha[1000], padding: 10 }]}>
                            <View>
                                <Image
                                    source={require('../assets/img/logo_colorida.png')} // Caminho para sua logo
                                    style={[styles.logo, borders.borderCircle]}
                                />
                            </View>

                            <View>
                                <Text style={[fontSize['2xs']]}>
                                    Rota feita por
                                </Text>
                                <Text style={[fontSize['xs'], fontWeights['bold'], { maxWidth: 100, textAlign: 'center', }]}>
                                    {usuarioRota}
                                </Text>
                            </View>

                            <View>
                                <Text style={[fontSize['2xs']]}>
                                    Distância
                                </Text>
                                <Text style={[fontSize['xs'], fontWeights['bold']]}>
                                    {distancia} km
                                </Text>
                            </View>

                            <View>
                                <Text style={[fontSize['2xs']]}>
                                    Velocidade Média
                                </Text>
                                <Text style={[fontSize['xs'], fontWeights['bold']]}>
                                    {velocidadeMedia} km/h
                                </Text>
                            </View>
                        </View>
                    </View>
                </>
            ) : (
                <Text style={styles.loadingText}>Carregando rota...</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        width: "100%",
        height: "80%",
    },
    logo: {
        zIndex: 999,
        width: 50, // Largura do logo
        height: 50, // Altura do logo
        resizeMode: "contain", // Garante que o logo seja exibido corretamente
    },
    shareButton: {
        padding: 15,
        backgroundColor: colors.blue[500], // Cor do botão (Facebook como exemplo)
        borderRadius: 5,
        position: 'absolute',
        top: 20,
        right: 10,
        zIndex: 999,
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
});