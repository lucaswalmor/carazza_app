import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Card from "../components/Card";
import { FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { colors, display } from "../assets/css/primeflex";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../assets/css/styles";

export default function Desafios({ navigation }) {
    const [user, setUser] = useState({});

    useEffect(() => {
        getUser();
    }, [])

    const getUser = async () => {
        const user = await AsyncStorage.getItem('user');

        if (user) {
            setUser(JSON.parse(user))
        }
    }

    const navigateCadastrarDesafio = async () => {
        navigation.navigate('CadastrarDesafioScreen');
    };

    const navigateDesafios = async (id) => {
        navigation.navigate('DesafiosListScreen', {desafio: id});
    };

    const navigateToRankingGeral = async () => {
        navigation.navigate('RankingGeralScreen');
    };


    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, padding: 10 }}>
                {(user.tipo_usuario === 1) && (
                    <View style={{ marginBottom: 10 }}>
                        <View style={{ width: '100%' }}>
                            <TouchableOpacity style={styles.button} onPress={navigateCadastrarDesafio}>
                                <Text style={styles.buttonText}>Cadastrar Desafio</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <Card
                    borderBottomColor={colors.pink[500]}
                    content={
                        <View
                            style={[display.row, display.justifyContentBetween]}
                        >
                            <TouchableOpacity
                                style={[display.flex, display.row, display.justifyContentBetween]}
                                onPress={() => navigateToRankingGeral()}
                            >
                                <Text style={[{ color: colors.pink[500], fontSize: 18, fontWeight: 'bold' }]}>
                                    Ranking Geral
                                </Text>
                                <FontAwesome6 name="trophy" size={24} style={[{ color: colors.pink[500], marginRight: 8 }]} />
                            </TouchableOpacity>
                        </View>
                    }
                />

                <Card
                    borderBottomColor={colors.blue[500]}
                    content={
                        <View
                            style={[display.row, display.justifyContentBetween]}
                        >
                            <TouchableOpacity
                                style={[display.flex, display.row, display.justifyContentBetween]}
                                onPress={() => navigateDesafios(1)}
                            >
                                <Text style={[{ color: colors.blue[500], fontSize: 18, fontWeight: 'bold' }]}>
                                    Rei da Estrada
                                </Text>
                                <MaterialIcons name="speed" size={24} style={[{ color: colors.blue[500], marginRight: 8 }]} />
                            </TouchableOpacity>
                        </View>
                    }
                />
            </ScrollView>
        </View>
    )
}