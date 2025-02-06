import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import EventosListScreen from '../src/screens/EventosListScreen'
import PontoListScreen from '../src/screens/PontosListScreen'
import EncontrosListScreen from '../src/screens/EncontrosListScreen';
import MapScreen from '../src/screens/MapScreen';
import PerfilScreen from '../src/screens/PerfilScreen';
import DesafiosScreen from '../src/screens/DesafiosScreen';

const Tab = createBottomTabNavigator();

export default function TabRoutes() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Pontos') {
                        iconName = 'home-outline';
                    } else if (route.name === 'Eventos') {
                        iconName = 'calendar-outline';
                    } else if (route.name === 'Encontros') {
                        iconName = 'location-outline';
                    } else if (route.name === 'Desafios') {
                        iconName = 'trophy-outline';
                    } else if (route.name === 'Mapa') {
                        iconName = 'map-outline';
                    } else if (route.name === 'Perfil') {
                        iconName = 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
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
            })}
        >
            <Tab.Screen name="Perfil" component={PerfilScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Pontos" component={PontoListScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Eventos" component={EventosListScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Encontros" component={EncontrosListScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Desafios" component={DesafiosScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Mapa" component={MapScreen} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
}