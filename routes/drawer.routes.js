import { Feather, Ionicons } from '@expo/vector-icons'
import { createDrawerNavigator } from '@react-navigation/drawer';
import PerfilScreen from '../src/screens/PerfilScreen'
import DesafiosListScreen from '../src/screens/DesafiosListScreen';

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
                    drawerIcon: ({ color, size }) => <Feather name="user" color={color} size={size} />,
                    drawerLabel: 'Perfil',
                }}
            />
            <Drawer.Screen
                name="DesafiosListScreen"
                component={DesafiosListScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="trophy-outline" color={color} size={size} />
                    ),
                    drawerLabel: 'Desafios',
                }}
            />
        </Drawer.Navigator>
    );
}