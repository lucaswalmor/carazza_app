import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../src/screens/LoginScreen';
import DrawerRoutes from './drawer.routes';
import CadastrarPontoScreen from '../src/screens/CadastrarPontoScreen';
import PontoScreen from '../src/screens/PontoScreen';
import SuccessScreen from '../src/screens/SuccessScreen';
import RetryPaymentScreen from '../src/screens/RetryPaymentScreen';
import CadastrarEventoScreen from '../src/screens/CadastrarEventoScreen';
import EventoScreen from '../src/screens/EventoScreen';

const Stack = createNativeStackNavigator();

export default function StackRoutes() {
    return (
        <Stack.Navigator screenOptions={{
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
        }}>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CadastrarPontoScreen" component={CadastrarPontoScreen} options={{ headerShown: true, headerTitle: 'Cadastrar Ponto' }} />
            <Stack.Screen name="CadastrarEventoScreen" component={CadastrarEventoScreen} options={{ headerShown: true, headerTitle: 'Cadastrar Evento' }} />
            <Stack.Screen name="PontoScreen" component={PontoScreen} options={{ headerShown: true }} />
            <Stack.Screen name="EventoScreen" component={EventoScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Success" component={SuccessScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Failure" component={RetryPaymentScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Main" component={DrawerRoutes} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}
