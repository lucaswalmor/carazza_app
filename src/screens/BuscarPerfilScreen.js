import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors, display, gap } from "../assets/css/primeflex";
import { FontAwesome5 } from '@expo/vector-icons';
import styles from "../assets/css/styles";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import Botao from "../components/Botao";
import Accordion from "../components/Accordion";
import Card from "../components/Card";

export default function BuscarPerfilScreen({ navigation }) {
    const [activeIndex, setActiveIndex] = useState(null);
    const [nome, setNome] = useState("");
    const [apelido, setApelido] = useState("");
    const [usuarios, setUsuarios] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const buscar = async () => {
        setIsLoading(true)
        const token = await AsyncStorage.getItem('token');

        try {
            const response = await api.get(`/user/lista/perfil?nome=${nome}&apelido=${apelido}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUsuarios(response.data)
        } catch (error) {
            console.log(error.response.data)
        } finally {
            setIsLoading(false)
        }
    }

    const navigateToPerfil = async (item) => {
        navigation.navigate('PerfilPublicoScreen', { id: item.id });
    }

    return (
        <View style={{ flex: 1, padding: 10 }}>
            <ScrollView style={{ flex: 1, padding: 10 }}>
                <Accordion title="Buscar Usuários" index={1} activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
                    <View style={[display.row, display.alignItemsCenter, display.justifyContentCenter, gap[2]]}>
                        <View style={{ flex: 1 }}>
                            <TextInput
                                style={[styles.input, { width: '100%' }]}
                                placeholder="Buscar por Nome"
                                value={nome}
                                onChangeText={(text) => setNome(text)}
                            />
                            <TextInput
                                style={[styles.input, { width: '100%' }]}
                                placeholder="Buscar por Apelido"
                                value={apelido}
                                onChangeText={(text) => setApelido(text)}
                            />
                        </View>
                    </View>

                    <Botao
                        onPress={buscar}
                    >
                        <View style={[display.row, gap[3], display.alignItemsCenter]}>
                            {isLoading ? (
                                <>
                                    <ActivityIndicator
                                        style={styles.loadingIndicator}
                                        size="small"
                                        color="#fff"
                                    />
                                    <Text style={styles.buttonText}>Procurando...</Text>
                                </>
                            ) : (
                                <>
                                    <FontAwesome5 name="search" size={16} style={{ color: colors.alpha[1000] }} />
                                    <Text style={{ color: colors.alpha[1000] }}>
                                        Buscar Usuário
                                    </Text>
                                </>
                            )}
                        </View>
                    </Botao>
                </Accordion>

                <Card
                    content={
                        <View>
                            {usuarios.length > 0 ? (
                                <View>
                                    {usuarios.map((seguidor, index) => (
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
                            ) : (
                                <>
                                    {isLoading ? (
                                        <View style={[display.row, gap[5]]}>
                                            <ActivityIndicator
                                                style={styles.loadingIndicator}
                                                size="small"
                                                color={colors.blue[500]}
                                            />
                                            <Text style={{ color: colors.gray[400], fontStyle: 'italic' }}>Procurando usuários...</Text>
                                        </View>
                                    ) : (
                                        <>
                                            <Text style={{ color: colors.gray[400], fontStyle: 'italic' }}>Nenhum usuário encontrado</Text>
                                        </>
                                    )}
                                </>
                            )}
                        </View>
                    }
                />
            </ScrollView>
        </View>

    )
}