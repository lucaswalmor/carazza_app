import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import EventosScreen from '../src/screens/EventosScreen'
import DrawerRoutes from './drawer.routes';
import PontoListScreen from '../src/screens/PontosListScreen'
import EncontrosScreen from '../src/screens/EncontrosScreen'

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
                    } else if (route.name === 'Perfil') {
                        iconName = 'person-outline';
                    } else if (route.name === 'Encontros') {
                        iconName = 'location-outline';
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
            <Tab.Screen name="Pontos" component={PontoListScreen} />
            <Tab.Screen name="Eventos" component={EventosScreen} />
            <Tab.Screen name="Encontros" component={EncontrosScreen} />
            <Tab.Screen name="Perfil" component={DrawerRoutes} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
}