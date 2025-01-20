import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabRoutes from './tab.routes';
import LoginScreen from '../src/screens/LoginScreen';
import RegisterScreen from '../src/screens/RegisterScreen';
import PontoScreen from '../src/screens/PontoScreen';
import CadastrarPonto from '../src/screens/CadastrarPonto';
import SuccessScreen from '../src/screens/SuccessScreen';
import RetryPaymentScreen from '../src/screens/RetryPaymentScreen';

const Stack = createNativeStackNavigator();

export default function StackRoutes() {
    return (
        <Stack.Navigator
            screenOptions={({ route }) => ({
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
            <Stack.Screen
                name="Success"
                component={SuccessScreen}
                options={{ title: 'Sucesso' }}
            />
            <Stack.Screen
                name="Failure"
                component={RetryPaymentScreen}
                options={{ title: 'Re-tentar Pagamento' }}
            />
        </Stack.Navigator>
    );
}
