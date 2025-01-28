import { createDrawerNavigator } from '@react-navigation/drawer';
import TabRoutes from './tab.routes'; // Tab dentro do Drawer
import PerfilScreen from '../src/screens/PerfilScreen';
import MeusDesafiosScreen from '../src/screens/MeusDesafiosScreen';
import RotaScreen from '../src/screens/RotaScreen';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Text } from 'react-native';

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
                        case 'PerfilScreen':
                            return <Text style={{color: '#ffffff', fontWeight: 'bold', fontSize: 18}}>Perfil</Text>
                        case 'MeusDesafiosScreen':
                            return <Text style={{color: '#ffffff', fontWeight: 'bold', fontSize: 18}}>Meus Desafio</Text>
                        case 'RotaScreen':
                            return <Text style={{color: '#ffffff', fontWeight: 'bold', fontSize: 18}}>Gravar</Text>
                        default: 
                            return <Text style={{color: '#ffffff', fontWeight: 'bold', fontSize: 18}}>Início</Text>
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
                name="PerfilScreen"
                component={PerfilScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="person" color={color} size={size} />
                    ),
                    drawerLabel: 'Perfil'
                }}
            />
            <Drawer.Screen
                name="MeusDesafiosScreen"
                component={MeusDesafiosScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <FontAwesome5 name="medal" color={color} size={size} />
                    ),
                    drawerLabel: 'Meus Desafios'
                }}
            />
            <Drawer.Screen
                name="RotaScreen"
                component={RotaScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <FontAwesome5 name="record-vinyl" color={color} size={size} />
                    ),
                    drawerLabel: 'Gravar'
                }}
            />
        </Drawer.Navigator>
    );
}
