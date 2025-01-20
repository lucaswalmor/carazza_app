import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabRoutes from './tab.routes';
import LoginScreen from '../src/screens/LoginScreen'
import PontoScreen from '../src/screens/PontoScreen';
import RegisterScreen from '../src/screens/RegisterScreen';
import CadastrarPonto from '../src/screens/CadastrarPonto';

const Stack = createNativeStackNavigator();

export default function StackRoutes() {
    return (
        <Stack.Navigator
            screenOptions={({ route }) => ({
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
            })}>
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Cadastro"
                component={RegisterScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Main"
                component={TabRoutes}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PontoScreen"
                component={PontoScreen}
                options={{ title: 'Detalhes do Ponto' }}
            />
            <Stack.Screen
                name="CadastrarPonto"
                component={CadastrarPonto}
                options={{ title: 'Cadastrar Ponto' }}
            />
        </Stack.Navigator>
    );
}