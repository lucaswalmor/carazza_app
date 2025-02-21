import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../src/screens/LoginScreen';
import DrawerRoutes from './drawer.routes';
import CadastrarPontoScreen from '../src/screens/CadastrarPontoScreen';
import PontoScreen from '../src/screens/PontoScreen';
import CadastrarEventoScreen from '../src/screens/CadastrarEventoScreen';
import EventoScreen from '../src/screens/EventoScreen';
import MeusDesafiosScreen from '../src/screens/MeusDesafiosScreen';
import EncontroScreen from '../src/screens/EncontroScreen'
import CadastrarEncontroScreen from '../src/screens/CadastrarEncontroScreen';
import PerfilPublicoScreen from '../src/screens/PerfilPublicoScreen';
import RotaUsuarioScreen from '../src/screens/RotaUsuarioScreen';
import ListaRotasPublicasUsuarioScreen from '../src/screens/ListaRotasPublicasUsuarioScreen';
import NotificacoesScreen from '../src/screens/NotificacoesScreen';
import DesafiosListScreen from '../src/screens/DesafiosListScreen';
import DetalhesDesafioScreen from '../src/screens/DetalhesDesafioScreen';
import RankingGeralScreen from '../src/screens/RankingGeralScreen';
import CadastrarDesafioScreen from '../src/screens/CadastrarDesafioScreen';
import GPSNavigatorByMarkerScreen from '../src/screens/GPSNavigatorByMarkerScreen';
import ListaDeSeguidoresScreen from '../src/screens/ListaDeSeguidoresScreen';
import ListaDeSeguindoScreen from '../src/screens/ListaDeSeguindoScreen';
import BuscarPerfilScreen from '../src/screens/BuscarPerfilScreen';

const Stack = createNativeStackNavigator();

export default function StackRoutes() {
    return (
        <Stack.Navigator screenOptions={{
            tabBarActiveTintColor: '#fff', // Cor dos ícones ativos
            tabBarInactiveTintColor: '#000c19', // Cor dos ícones inativos
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
        }}>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CadastrarPontoScreen" component={CadastrarPontoScreen} options={{ headerShown: true, headerTitle: 'Cadastrar Ponto' }} />
            <Stack.Screen name="CadastrarEventoScreen" component={CadastrarEventoScreen} options={{ headerShown: true, headerTitle: 'Cadastrar Evento' }} />
            <Stack.Screen name="CadastrarEncontroScreen" component={CadastrarEncontroScreen} options={{ headerShown: true, headerTitle: 'Cadastrar Encontro' }} />
            <Stack.Screen name="PontoScreen" component={PontoScreen} options={{ headerShown: true, headerTitle: 'Ponto' }} />
            <Stack.Screen name="EventoScreen" component={EventoScreen} options={{ headerShown: true, headerTitle: 'Evento' }} />
            <Stack.Screen name="EncontroScreen" component={EncontroScreen} options={{ headerShown: true, headerTitle: 'Encontros' }} />
            <Stack.Screen name="PerfilPublicoScreen" component={PerfilPublicoScreen} options={{ headerShown: true, headerTitle: 'Perfil' }} />
            <Stack.Screen name="ListaRotasPublicasUsuarioScreen" component={ListaRotasPublicasUsuarioScreen} options={{ headerShown: true, headerTitle: 'Rotas' }} />
            <Stack.Screen name="RotaUsuarioScreen" component={RotaUsuarioScreen} options={{ headerShown: true, headerTitle: 'Rota' }} />
            <Stack.Screen name="NotificacoesScreen" component={NotificacoesScreen} options={{ headerShown: true, headerTitle: 'Notificações' }} />
            <Stack.Screen name="CadastrarDesafioScreen" component={CadastrarDesafioScreen} options={{ headerShown: true, headerTitle: 'Cadastrar Desafio' }} />
            <Stack.Screen name="DesafiosListScreen" component={DesafiosListScreen} options={{ headerShown: true, headerTitle: 'Lista de Desafios' }} />
            <Stack.Screen name="DetalhesDesafioScreen" component={DetalhesDesafioScreen} options={{ headerShown: true, headerTitle: 'Detalhes do Desafio' }} />
            <Stack.Screen name="MeusDesafiosScreen" component={MeusDesafiosScreen} options={{ headerShown: true, headerTitle: 'Meus Desafios' }} />
            <Stack.Screen name="RankingGeralScreen" component={RankingGeralScreen} options={{ headerShown: true, headerTitle: 'Maiores Pontuadores' }} />
            <Stack.Screen name="GPSNavigatorByMarkerScreen" component={GPSNavigatorByMarkerScreen} options={{ headerShown: true, headerTitle: 'GPS' }} />
            <Stack.Screen name="ListaDeSeguidoresScreen" component={ListaDeSeguidoresScreen} options={{ headerShown: true, headerTitle: 'Meus Seguidores' }} />
            <Stack.Screen name="ListaDeSeguindoScreen" component={ListaDeSeguindoScreen} options={{ headerShown: true, headerTitle: 'Seguindo' }} />
            <Stack.Screen name="BuscarPerfilScreen" component={BuscarPerfilScreen} options={{ headerShown: true, headerTitle: 'Pesquisar Usuário' }} />
            <Stack.Screen name="Main" component={DrawerRoutes} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}
