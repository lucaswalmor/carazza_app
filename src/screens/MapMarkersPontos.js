import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert, Text, TouchableOpacity } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import * as Location from "expo-location";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, display, gap } from "../assets/css/primeflex";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome5 } from '@expo/vector-icons';

export default function MapMarkersPontos({ navigation }) {
    const [markers, setMarkers] = useState([]);
    const [region, setRegion] = useState(null);
    const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0 });

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

    const addCoordinates = async (event) => {
        setCoordinates({ latitude: event.coordinate.latitude, longitude: event.coordinate.longitude })
    }

    const redirectToGps = async () => {
        navigation.navigate('Main', {
          screen: 'Home',
          params: {
            screen: 'GPS',
            params: {
                destLatitude: coordinates.latitude,
                destLongitude: coordinates.longitude
            }
          }
        });
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

                    {coordinates.latitude != 0 && coordinates.longitude != 0 && (
                        <TouchableOpacity
                            style={styles.redirect}
                            onPress={() => redirectToGps()}
                        >
                            <View style={[display.row, gap[5], display.alignItemsCenter]}>
                                <Text style={styles.redirectTitle}>
                                    Ir para GPS
                                </Text>
                                <FontAwesome5 name="arrow-right" size={20} style={[{ color: colors.alpha[1000], marginRight: 8 }]} />
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* 🗺️ Mapa */}
                    <MapView style={styles.map} initialRegion={region}>
                        {markers.map((marker) => (
                            <Marker
                                key={marker.id}
                                coordinate={{ latitude: parseFloat(marker?.latitude), longitude: parseFloat(marker?.longitude) }}
                                title={marker?.nome}
                                pinColor={marker.bol_parceiro === 1 ? colors.green[700] : colors.red[500]}
                                onPress={e => addCoordinates(e.nativeEvent)}
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
    redirect: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1,
        backgroundColor: "#1d1e22",
        padding: 10,
        borderRadius: 8,
        elevation: 5, // Sombras no Android
        shadowColor: "#000", // Sombras no iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        flexDirection: 'row',
        gap: 5
    },
    redirectTitle: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#FFF",
    },
    redirectText: {
        fontSize: 14,
        color: "black",
    },
    redirectItem: {
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
