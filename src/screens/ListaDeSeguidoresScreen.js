import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import api from "../services/api";
import { borders, colors, display } from "../assets/css/primeflex";
import Card from "../components/Card";
import styles from "../assets/css/styles";

export default function ListaDeSeguidoresScreen({ navigation }) {
    const [seguidores, setSeguidores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            getSeguidores();
        }, [])
    );

    const getSeguidores = async () => {
        setIsLoading(true)
        const token = await AsyncStorage.getItem('token');
        const user = JSON.parse(await AsyncStorage.getItem('user'));

        if (token && user) {
            try {
                const response = await api.get(`/user/lista/seguidores/${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setSeguidores(response.data)
            } catch (error) {
                console.log(error.response.data)
            } finally {
                setIsLoading(false)
            }
        }
    }

    const navigateToPerfil = async (item) => {
        navigation.navigate('PerfilPublicoScreen', { id: item.id });
    }

    if (isLoading) return <ActivityIndicator style={styles.loadingIndicator} size="small" color="#fff" />

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, padding: 10 }}>
                <Card
                    content={
                        <View>
                            {seguidores.map((seguidor, index) => (
                                <TouchableOpacity onPress={() => navigateToPerfil(seguidor)} key={index} style={[display.row, display.alignItemsCenter, { padding: 10, borderBottomWidth: 1, borderBottomColor: colors.blueGray[200] }]}>
                                    <Image
                                        source={{ uri: seguidor.img_perfil }}
                                        style={{ width: 35, height: 35, borderRadius: 25, marginRight: 10 }}
                                    />
                                    <Text style={{ fontSize: 14, color: colors.blue[500], textAlign: 'center', flexWrap: 'wrap', maxWidth: '80%', }}>
                                        {seguidor.nome}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    }
                />
            </ScrollView>
        </View>
    );
}