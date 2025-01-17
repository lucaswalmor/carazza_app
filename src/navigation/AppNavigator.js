import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/LoginScreen';
import PontoScreen from '../screens/PontoScreen';
import EventosScreen from '../screens/EventosScreen';
import RastreamentoScreen from '../screens/RastreamentoScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FormCadastrarPontoScreen from '../components/forms/FormCadastrarPontoScreen'
import PerfilScreen from '../screens/PerfilScreen';
import { Ionicons } from '@expo/vector-icons';
import PontosListScreen from '../screens/PontosListScreen'

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navegação da bottom bar
function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Points') {
            iconName = 'home-outline';
          } else if (route.name === 'Eventos') {
            iconName = 'calendar-outline';
          } else if (route.name === 'Rastreamento') {
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
      <Tab.Screen name="Pontos" component={PontosListScreen} />
      <Tab.Screen name="Eventos" component={EventosScreen} />
      <Tab.Screen name="Rastreamento" component={RastreamentoScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
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
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CadastrarPonto"
        component={FormCadastrarPontoScreen}
        options={{ headerShown: true, title: "Cadastrar Ponto" }}
      />
      <Stack.Screen
        name="PontoScreen"
        component={PontoScreen}
        options={{ title: 'Detalhes do Ponto' }}
      />
    </Stack.Navigator>
  );
}
