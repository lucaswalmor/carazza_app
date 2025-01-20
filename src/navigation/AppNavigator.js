import React, { Suspense } from 'react';
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

function BottomTabNavigator() {
  return (
    <Suspense fallback={<LoadingScreen />}>
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
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#000c19',
          tabBarStyle: {
            backgroundColor: '#007bff',
            borderTopWidth: 0,
          },
          headerStyle: {
            backgroundColor: '#007bff',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen name="Pontos" component={PontosListScreen} />
        <Tab.Screen name="Eventos" component={EventosScreen} />
        <Tab.Screen name="Encontros" component={EncontrosScreen} />
        <Tab.Screen name="Perfil" component={PerfilScreen} />
      </Tab.Navigator>
    </Suspense>
  );
}

export default function AppNavigator() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007bff',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#F5F5F5',
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
          options={{ headerShown: true, title: 'Cadastrar Ponto' }}
        />
        <Stack.Screen
          name="PontoScreen"
          component={PontoScreen}
          options={{ title: 'Detalhes do Ponto' }}
        />
      </Stack.Navigator>
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <p>Carregando...</p>
    </div>
  );
}
