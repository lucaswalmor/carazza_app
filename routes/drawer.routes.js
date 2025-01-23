import { Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { createDrawerNavigator } from '@react-navigation/drawer';
import PerfilScreen from '../src/screens/PerfilScreen'
import MeusDesafios from '../src/screens/MeusDesafios';
import RotaScreen from '../src/screens/RotaScreen';

const Drawer = createDrawerNavigator();

export default function DrawerRoutes() {
    return (
        <Drawer.Navigator
            screenOptions={{
                title: '',
                tabBarActiveTintColor: '#fff', // Cor dos ícones ativos
                tabBarInactiveTintColor: '#000c19', // Cor dos ícones inativos
                tabBarStyle: {
                    backgroundColor: '#007bff', // Cor de fundo da aba
                    borderTopWidth: 0,         // Remove a borda superior
                },
                headerStyle: {
                    backgroundColor: '#007bff', // Cor de fundo do cabeçalho
                },
                headerTintColor: '#FFFFFF', // Cor do texto no cabeçalho
                headerTitleStyle: {
                    fontWeight: 'bold', // Estilo do título
                },
            }}
        >
            <Drawer.Screen
                name="PerfilScreen"
                component={PerfilScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="person" color={color} size={size} />
                    ),
                    drawerLabel: 'Perfil',
                }}
            />
            <Drawer.Screen
                name="MeusDesafios"
                component={MeusDesafios}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <FontAwesome5 name="medal" color={color} size={size} />
                    ),
                    drawerLabel: 'Desafios',
                }}
            />
            <Drawer.Screen
                name="RotaScreen"
                component={RotaScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <FontAwesome5 name="record-vinyl" color={color} size={size} />
                    ),
                    drawerLabel: 'Gravar',
                }}
            />
        </Drawer.Navigator>
    );
}