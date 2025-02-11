import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"; // Importe o componente Image
import MapView, { Marker, Polyline } from "react-native-maps";
import api from "../services/api";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { colors, display, fontSize, fontWeights, gap, margins } from "../assets/css/primeflex";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function RotaUsuarioScreen({ route }) {
    const { id } = route.params;
    const [rota, setRota] = useState([]);
    const [distancia, setDistancia] = useState([]);
    const [velocidadeMedia, setVelocidadeMedia] = useState([]);
    const mapViewRef = useRef(null); // Ref para o mapa
    const mapContainerRef = useRef(null); // Ref para o contêiner do mapa

    useEffect(() => {
        getRoute();
    }, []);

    const getRoute = async () => {
        try {
            const response = await api.get(`rota/${id}`);
            setRota(response.data.rota);
            setDistancia(response.data.distancia_total_km);
            setVelocidadeMedia(response.data.velocidade_media_ms);
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
            } else {
                alert("Compartilhamento não suportado neste dispositivo.");
            }
        } catch (error) {
            console.log("Erro ao capturar e compartilhar o mapa:", error);
        }
    };

    return (
        <View style={styles.container}>
            {region ? (
                <>
                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                        <FontAwesome5 name="share-alt" size={24} color="#FFF" />
                    </TouchableOpacity>

                    {/* Contêiner do mapa com ref */}
                    <View ref={mapContainerRef} collapsable={false} style={[styles.mapContainer]}>
                        {/* Logo no canto superior esquerdo */}

                        {/* Mapa */}
                        <MapView
                            style={styles.map}
                            initialRegion={region}
                            ref={mapViewRef}
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
                                />
                            )}
                            {/* Desenha a rota */}
                            <Polyline
                                coordinates={rota}
                                strokeColor="#FF0000" // Cor da linha
                                strokeWidth={4} // Espessura da linha
                            />
                        </MapView>

                        <View style={[display.row, gap[10], display.alignItemsCenter, { backgroundColor: colors.alpha[1000], padding: 10 }]}>
                            <View>
                                <Image
                                    source={require('../assets/img/logo.png')} // Caminho para sua logo
                                    style={styles.logo}
                                />
                            </View>
                            <View>
                                <Text style={[fontSize['2xs']]}>
                                    Distância
                                </Text>
                                <Text style={[fontSize['lg'], fontWeights['bold']]}>
                                    {distancia} km
                                </Text>
                            </View>

                            <View>
                                <Text style={[fontSize['2xs']]}>
                                    Velocidade Média
                                </Text>
                                <Text style={[fontSize['lg'], fontWeights['bold']]}>
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
        height: "83%",
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