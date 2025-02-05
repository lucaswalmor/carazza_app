import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import api from "../services/api";

export default function RotaUsuarioScreen({ route }) {
    const { id } = route.params;
    const [rota, setRota] = useState([]);

    useEffect(() => {
        getRoute();
    }, []);

    const getRoute = async () => {
        try {
            const response = await api.get(`rota/${id}`);
            setRota(response.data);
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

    return (
        <View style={styles.container}>
            {region ? (
                <MapView
                    style={styles.map}
                    initialRegion={region}
                >
                    {/* Desenha a rota */}
                    <Polyline
                        coordinates={rota}
                        strokeColor="#FF0000" // Cor da linha
                        strokeWidth={4} // Espessura da linha
                    />
                </MapView>
            ) : (
                <Text style={styles.loadingText}>Carregando rota...</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    map: {
        width: "100%",
        height: "100%",
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
});