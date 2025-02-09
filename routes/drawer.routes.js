import { createDrawerNavigator } from '@react-navigation/drawer';
import TabRoutes from './tab.routes'; // Tab dentro do Drawer
import { MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfiguracoesScreen from '../src/screens/ConfiguracoesScreen';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import api from '../src/services/api';
import AdminScreen from '../src/screens/AdminScreen';
import MapMarkersPontos from '../src/screens/MapMarkersPontos';

const Drawer = createDrawerNavigator();

export default function DrawerRoutes() {
    const [notificacoes, setNotificacoes] = useState(0);
    const navigation = useNavigation();
    const [user, setUser] = useState(null);

    // Função para buscar a contagem de notificações não lidas
    const buscarContagemNotificacoes = async () => {
        const token = await AsyncStorage.getItem('token');

        try {
            const response = await api.get('/notificacoes/nao-lidas', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotificacoes(response.data);
        } catch (error) {
            console.error('Erro ao buscar contagem de notificações:', error);
        }
    };

    async function getUser() {
        const user = JSON.parse(await AsyncStorage.getItem('user'));
        setUser(user);
    }

    useEffect(() => {
        getUser();
    }, [])

    useFocusEffect(
        useCallback(() => {
            buscarContagemNotificacoes();
        }, [])
    );

    return (
        <Drawer.Navigator
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: '#007bff' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
                drawerStyle: { backgroundColor: '#f4f4f4' },
                headerTitle: (route) => {
                    switch (route.children) {
                        case 'ConfiguracoesScreen':
                            return <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 18 }}>Configurações</Text>
                        default:
                            return <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 18 }}>Início</Text>
                    }
                },
                headerRight: () => (
                    <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('NotificacoesScreen')}>
                        <FontAwesome6 name="bell" size={28} color="#FFF" />
                        {notificacoes > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{notificacoes}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ),
            })}
        >
            <Drawer.Screen
                name="Home"
                component={TabRoutes}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="home" color={color} size={size} />
                    ),
                    drawerLabel: 'Início'
                }}
            />
            <Drawer.Screen
                name="MapMarkersPontos"
                component={MapMarkersPontos}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="map" color={color} size={size} />
                    ),
                    drawerLabel: 'Locais Parceiros'
                }}
            />
            {user?.tipo_usuario === 1 && (
                <Drawer.Screen
                    name="Admin"
                    component={AdminScreen}
                    options={{
                        drawerIcon: ({ color, size }) => (
                            <MaterialIcons name="admin-panel-settings" color={color} size={size} />
                        ),
                        drawerLabel: 'Admin'
                    }}
                />
            )}
            <Drawer.Screen
                name="configuracoes"
                component={ConfiguracoesScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <FontAwesome6 name="user-gear" color={color} size={size} />
                    ),
                    drawerLabel: 'Configurações'
                }}
            />
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: 15,
    },
    badge: {
        position: 'absolute',
        right: -2,
        top: -4,
        backgroundColor: 'red',
        borderRadius: 8,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
