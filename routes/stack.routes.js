import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../src/screens/LoginScreen';
import RegisterScreen from '../src/screens/RegisterScreen';
import DrawerRoutes from './drawer.routes'; // Drawer como principal navegação após login.
import CadastrarPonto from '../src/screens/CadastrarPonto';
import PontoScreen from '../src/screens/PontoScreen';

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
            <Stack.Screen name="Cadastro" component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CadastrarPonto" component={CadastrarPonto} options={{ headerShown: true }} />
            <Stack.Screen name="PontoScreen" component={PontoScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Main" component={DrawerRoutes} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}
