import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Card from "../components/Card";
import { FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { colors, display } from "../assets/css/primeflex";

export default function Desafios({ navigation }) {
    const navigateDesafios = (tipo) => {
        navigation.navigate('DesafiosListScreen', { desafio: tipo });
    };

    const navigateRankingGeral = async () => {
        navigation.navigate('RankingGeralScreen');
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, padding: 10 }}>
                <Card
                    borderBottomColor={colors.pink[500]}
                    content={
                        <View
                            style={[display.row, display.justifyContentBetween]}
                        >
                            <TouchableOpacity
                                style={[display.flex, display.row, display.justifyContentBetween]}
                                onPress={() => navigateRankingGeral()}
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