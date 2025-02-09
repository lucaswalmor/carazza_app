import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../assets/css/primeflex";
import { useFocusEffect } from "@react-navigation/native";

export default function MapMarkersPontos() {
    const [markers, setMarkers] = useState([]);
    const [region, setRegion] = useState(null);

    useFocusEffect(
        useCallback(() => {
            getLocation();
            getMarkers();
        }, [])
    );

    async function getLocation() {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
            Alert.alert("Permissão negada", "Habilite a localização para usar o mapa.");
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.25,
            longitudeDelta: 0.25,
        });
    }

    async function getMarkers() {
        const token = await AsyncStorage.getItem("token");

        try {
            const response = await api.get("/ponto/markers", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMarkers(response.data);
        } catch (error) {
            console.log(error.response?.data || error.message);
        }
    }

    return (
        <View style={styles.container}>

            {region ? (
                <>
                    {/* 🏷️ Legenda fixa */}
                    <View style={styles.legend}>
                        <Text style={styles.legendTitle}>Pontos</Text>
                        <View style={styles.legendItem}>
                            <View style={[styles.pin, { backgroundColor: colors.green[500] }]} />
                            <Text style={styles.legendText}>Parceiros</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.pin, { backgroundColor: colors.red[500] }]} />
                            <Text style={styles.legendText}>Não Parceiros</Text>
                        </View>
                    </View>

                    {/* 🗺️ Mapa */}
                    <MapView style={styles.map} initialRegion={region}>
                        {markers.map((marker) => (
                            <Marker
                                image={marker.bol_parceiro === 1 ? require("../assets/icons/pin-green.png") : require("../assets/icons/pin-red.png") }
                                key={marker.id}
                                coordinate={{ latitude: parseFloat(marker?.latitude), longitude: parseFloat(marker?.longitude) }}
                                title={marker?.nome}
                                pinColor={marker.bol_parceiro === 1 ? colors.green[500] : colors.red[500]}
                            />
                        ))}
                    </MapView>
                </>
            ) : (
                <View style={styles.loading}>
                    <Text>Carregando mapa...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    legend: {
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 1,
        backgroundColor: "white",
        padding: 10,
        borderRadius: 8,
        elevation: 5, // Sombras no Android
        shadowColor: "#000", // Sombras no iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    legendTitle: {
        fontWeight: "bold",
        fontSize: 16,
        color: "black",
        marginBottom: 5,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
    },
    pin: {
        width: 15,
        height: 15,
        borderRadius: 10,
        marginRight: 8,
    },
    legendText: {
        fontSize: 14,
        color: "black",
    },
});
