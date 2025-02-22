import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "../services/api";
import Card from "../components/Card";
import { borders, colors, display, fontSize, fontWeights, gap, margins, shadows } from "../assets/css/primeflex";
import { FontAwesome5 } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import styles from "../assets/css/styles";

export default function ListaRotasPublicasUsuarioScreen({ navigation, route }) {
    const { id } = route.params
    const [rotas, setRotas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            getPublicUser();
        }, [])
    );

    const getPublicUser = async () => {
        setIsLoading(true)
        try {
            const token = await AsyncStorage.getItem('token');
            const user = JSON.parse(await AsyncStorage.getItem('user')); ''

            const response = await api.get(`/rota/user/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setRotas(response.data)
        } catch (error) {
            console.log('Erro ao enviar o formulário:', error);
        } finally {
            setIsLoading(false)
        }
    }

    const rotaUsuario = async (id) => {
        navigation.navigate('RotaUsuarioScreen', { id });
    }

    const navigateToGps = async (item) => {
        const ultimaPosicao = item[item.length - 1];
        navigation.navigate('Main', {
          screen: 'Home',
          params: {
            screen: 'GPS',
            params: {
                destLatitude: ultimaPosicao.latitude,
                destLongitude: ultimaPosicao.longitude
            }
          }
        });
    }

    const calculateRegion = (coordinates) => {
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

    return (
        <View style={{ flex: 1 }}>
            {isLoading ? (
                <>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color="#1d1e22" />
                    </View>
                </>
            ) : (
                <View style={{ flex: 1, padding: 10, paddingBottom: 50 }}>
                    <ScrollView style={{ flex: 1 }}>
                        <Card
                            borderBottomColor={colors.teal[500]}
                            content={
                                <View style={{ flex: 1 }}>
                                    <View style={{ flex: 1 }}>
                                        {rotas.length > 0 ? (
                                            rotas.map((rotaItem, index) => {
                                                const region = calculateRegion(rotaItem.rota);
                                                return (
                                                    <View key={index} style={[{ flex: 1, marginTop: 20 }, shadows['shadow2'], borders.borderRound]}>
                                                        {rotaItem.titulo && (
                                                            <View style={[display.row, display.alignItemsCenter, display.justifyContentCenter, { backgroundColor: colors.alpha[1000], paddingTop: 10 }]}>
                                                                <Text style={[fontWeights['bold']]}>{rotaItem?.titulo}</Text>
                                                            </View>
                                                        )}


                                                        <View style={[display.row, gap[10], margins[2], display.alignItemsCenter]}>
                                                            <View>
                                                                <Image
                                                                    source={require('../assets/img/logo_colorida.png')} // Caminho para sua logo
                                                                    style={[{ width: 40, height: 40 }, borders.borderCircle]}
                                                                />
                                                            </View>
                                                            <View>
                                                                <Text style={[fontSize['2xs']]}>
                                                                    Distância
                                                                </Text>
                                                                <Text style={[fontSize['base'], fontWeights['bold']]}>
                                                                    {rotaItem.distancia} km
                                                                </Text>
                                                            </View>

                                                            <View>
                                                                <Text style={[fontSize['2xs']]}>
                                                                    Velocidade Média
                                                                </Text>
                                                                <Text style={[fontSize['base'], fontWeights['bold']]}>
                                                                    {rotaItem.velocidade_media_kmh} km/h
                                                                </Text>
                                                            </View>

                                                            <View>
                                                                <TouchableOpacity
                                                                    style={[{borderWidth: 1, borderColor: colors.blue[500], padding: 10}, borders.borderCircle]}
                                                                    onPress={() => navigateToGps(rotaItem.rota)}
                                                                >
                                                                    <FontAwesome5 name="location-arrow" size={16} color={colors.blue[500]} />
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>

                                                        <TouchableOpacity
                                                            onPress={() => rotaUsuario(rotaItem.id)}
                                                        >
                                                            <MapView
                                                                style={styles2.map}
                                                                initialRegion={region}
                                                                scrollEnabled={false} // Desativa o movimento de arrastar
                                                                zoomEnabled={false}
                                                                pitchEnabled={false}
                                                                rotateEnabled={false}
                                                                toolbarEnabled={false}
                                                            >
                                                                <Polyline
                                                                    coordinates={rotaItem.rota}
                                                                    strokeColor="#FF0000"
                                                                    strokeWidth={3}
                                                                />
                                                            </MapView>
                                                        </TouchableOpacity>
                                                    </View>
                                                );
                                            })
                                        ) : (
                                            <Text style={{ textAlign: 'center', color: '#666' }}>Nenhuma rota encontrada.</Text>
                                        )}
                                    </View>
                                </View>
                            }
                        />
                    </ScrollView>
                </View>
            )}
        </View>
    )
}

const styles2 = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: 200
    },
    marker: {
        padding: 2,
        backgroundColor: 'white',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    distanceContainer: {

    },
    distanceText: {
        fontSize: 8,
        color: '#000',
    },
});