import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import MapScreen from '../src/screens/MapScreen';
import PerfilScreen from '../src/screens/PerfilScreen';
import GPSNavigatorScreen from '../src/screens/GPSNavigatorScreen';
import EventosEncontros from '../src/screens/EventosEncontros';

const Tab = createBottomTabNavigator();

export default function TabRoutes() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'GPS') {
                        iconName = 'route';
                    } else if (route.name === 'Feed') {
                        iconName = 'newspaper';
                    } else if (route.name === 'Perfil') {
                        iconName = 'user-alt';
                    } else if (route.name === 'Geral') {
                        iconName = 'home';
                    }

                    return <FontAwesome5 name={iconName} size={20} color={color} />;
                },
                tabBarActiveTintColor: '#fff', // Cor dos ícones ativos
                tabBarInactiveTintColor: '#505051', // Cor dos ícones inativos
                tabBarStyle: {
                    backgroundColor: '#1d1e22', // Cor de fundo da aba
                    borderTopWidth: 0,         // Remove a borda superior
                },
                headerStyle: {
                    backgroundColor: '#1d1e22', // Cor de fundo do cabeçalho
                },
                headerTintColor: '#FFFFFF', // Cor do texto no cabeçalho
                headerTitleStyle: {
                    fontWeight: 'bold', // Estilo do título
                },
            })}
        >
            <Tab.Screen name="Perfil" component={PerfilScreen} options={{ headerShown: false }} />
            <Tab.Screen name="GPS" component={GPSNavigatorScreen} options={{ headerShown: false }} />
            {/* <Tab.Screen name="Feed" component={MapScreen} options={{ headerShown: false }} /> */}
            <Tab.Screen name="Geral" component={EventosEncontros} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
}