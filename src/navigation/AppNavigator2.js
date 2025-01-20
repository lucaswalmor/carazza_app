import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Lazy Loading dos componentes
const LoginScreen = React.lazy(() => import('../screens/LoginScreen'));
const PontoScreen = React.lazy(() => import('../screens/PontoScreen'));
const EventosScreen = React.lazy(() => import('../screens/EventosScreen'));
const RegisterScreen = React.lazy(() => import('../screens/RegisterScreen'));
const FormCadastrarPontoScreen = React.lazy(() => import('../components/forms/FormCadastrarPontoScreen'));
const PerfilScreen = React.lazy(() => import('../screens/PerfilScreen'));
const PontosListScreen = React.lazy(() => import('../screens/PontosListScreen'));
const EncontrosScreen = React.lazy(() => import('../screens/EncontrosScreen'));

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navegação da bottom bar
function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Pontos') {
            iconName = 'home-outline';
          } else if (route.name === 'Eventos') {
            iconName = 'calendar-outline';
          } else if (route.name === 'Rastreamento') {
            iconName = 'map-outline';
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
      <Tab.Screen name="Pontos" component={React.lazy(() => import('../screens/PontosListScreen'))} />
      <Tab.Screen name="Eventos" component={React.lazy(() => import('../screens/EventosScreen'))} />
      <Tab.Screen name="Encontros" component={React.lazy(() => import('../screens/EncontrosScreen'))} />
      <Tab.Screen name="Perfil" component={React.lazy(() => import('../screens/PerfilScreen'))} />
    </Tab.Navigator>
  );
}

// Navegação principal
export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007bff', // Cor de fundo do cabeçalho
        },
        headerTintColor: '#FFFFFF', // Cor do texto no cabeçalho
        headerTitleStyle: {
          fontWeight: 'bold', // Estilo do título
        },
        contentStyle: {
          backgroundColor: '#F5F5F5', // Cor de fundo do conteúdo
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={React.lazy(() => import('../screens/LoginScreen'))}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={React.lazy(() => import('../screens/RegisterScreen'))}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CadastrarPonto"
        component={React.lazy(() => import('../components/forms/FormCadastrarPontoScreen'))}
        options={{ headerShown: true, title: "Cadastrar Ponto" }}
      />
      <Stack.Screen
        name="PontoScreen"
        component={React.lazy(() => import('../screens/PontoScreen'))}
        options={{ title: 'Detalhes do Ponto' }}
      />
    </Stack.Navigator>
  );
}
