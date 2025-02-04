import { createDrawerNavigator } from '@react-navigation/drawer';
import TabRoutes from './tab.routes'; // Tab dentro do Drawer
import { MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import { Text } from 'react-native';
import ConfiguracoesScreen from '../src/screens/ConfiguracoesScreen';

const Drawer = createDrawerNavigator();

export default function DrawerRoutes() {
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
                }
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
