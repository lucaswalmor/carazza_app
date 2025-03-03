import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Button, Modal as RNModal, Alert, Linking } from 'react-native';
import styles from '../assets/css/styles';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications';

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAssinaturaVisible, setModalAssinaturaVisible] = useState(false);
  const [msgCadastro, setMsgCadastro] = useState(false);
  const [msgConfirmResumeSubscription, setMsgConfirmResumeSubscription] = useState(false);
  const [modalConfirmResumeSubscriptionVisible, setModalConfirmResumeSubscriptionVisible] = useState(false);
  const [modalResumeSubscription, setModalResumeSubscription] = useState(false);

  ///////////////////////////// EXPO PUSH NOTIFICATION /////////////////////////////////

  const registerForPushNotifications = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // if (existingStatus !== 'granted') {
    //   const { status } = await Notifications.requestPermissionsAsync();
    //   finalStatus = status;
    // }

    // Exibe uma mensagem personalizada antes de solicitar a permissão
    if (existingStatus !== 'granted') {
      Alert.alert(
        "Permissão para Notificações",
        "Precisamos de sua permissão para enviar notificações. Elas serão usadas para te avisar sobre novos eventos e atualizações importantes.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "OK", onPress: async () => {
              const { status } = await Notifications.requestPermissionsAsync();
              finalStatus = status;
              if (finalStatus !== 'granted') {
                Alert.alert('Permissões de notificações não concedidas!');
              }
            }
          }
        ]
      );
    }

    if (finalStatus !== 'granted') {
      alert('Permissões de notificações não concedidas!');
      return;
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
          navigation.replace('Main');
        } else {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          checkBiometricAuth();
        }
      } catch (error) {
        console.log('Erro ao recuperar token:', error);
      }
    };

    getToken();
  }, []);

  useEffect(() => {
    if (route.params?.message) {
      setMsgCadastro(route.params?.message);
      setModalVisible(true);
    }
  }, [route.params]);

  const checkBiometricAuth = async () => {
    const storedEmail = await AsyncStorage.getItem('email');
    const storedPassword = await AsyncStorage.getItem('password');
    if (storedEmail && storedPassword) {
      handleBiometricLogin();
    }
  };

  const handleBiometricLogin = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      Alert.alert('Este dispositivo não tem suporte para autenticação biométrica.');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync();

    if (result.success) {
      const storedEmail = await AsyncStorage.getItem('email');
      const storedPassword = await AsyncStorage.getItem('password');

      if (storedEmail != null && storedPassword != null) {
        handleLogin(storedEmail, storedPassword);
      }
    } else {
      // Alert.alert('Falha na autenticação biométrica');
    }
  };

  const handleLogin = async (emailBiometria, passwordBiometria) => {
    if (!email && !emailBiometria) {
      Alert.alert('O campo email é obrigatório');
      return
    } else if (!password && !passwordBiometria) {
      Alert.alert('O campo senha é obrigatório');
      return
    }

    setIsLoading(true);
    try {
      // const token = expoPushToken || (await Notifications.getExpoPushTokenAsync()).data;

      const response = await api.post('/login', { email: email || emailBiometria, password: password || passwordBiometria });
      // const response = await api.post('/login', { expoToken: token, email: email || emailBiometria, password: password || passwordBiometria });
      const data = response.data;

      if (data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
      } else {
        await AsyncStorage.removeItem('user');
      }

      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
      } else {
        await AsyncStorage.removeItem('token');
      }

      await AsyncStorage.setItem('email', email || emailBiometria);
      await AsyncStorage.setItem('password', password || passwordBiometria);

      if (data && data.user.subscription_status) {
        navigation.replace('Main');
      } else {
        setModalAssinaturaVisible(true)
      }
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response && error.response.data.error) {
        setErrors({ email: [error.response.data.error], password: [error.response.data.error] });
      } else {
        console.log('Erro:', error.message);
      }
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterNavigation = async () => {
    const baseUrl = 'https://motostrada.com.br/cadastro?ref=&inf=0';
    const supported = await Linking.canOpenURL(baseUrl);

    if (supported) {
      await Linking.openURL(baseUrl);
    } else {
      Alert.alert('Erro', 'Não foi possível abrir o link: ' + baseUrl);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      const response = await api.get(`/asaas/subscription/status?email=${email}`);
      setMsgConfirmResumeSubscription(response.data.message)
      setModalResumeSubscription(false)
      setModalConfirmResumeSubscriptionVisible(true)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <View style={stylesLogin.container}>
      <View style={stylesLogin.logoView}>
        <Image source={require('../assets/img/logo1.png')} style={stylesLogin.logo} resizeMode="contain" />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      {errors && errors.email && <Text style={styles.errorText}>{errors.email[0]}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {errors && errors.password && <Text style={styles.errorText}>{errors.password[0]}</Text>}

      <View style={stylesLogin.registerContainer}>
        <Text style={stylesLogin.registerText}>Não tem uma conta?</Text>
        <TouchableOpacity onPress={handleRegisterNavigation}>
          <Text style={stylesLogin.registerLink}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
        <View style={styles.buttonContent}>
          {isLoading ? (
            <>
              <ActivityIndicator
                style={styles.loadingIndicator}
                size="small"
                color="#fff"
              />
              <Text style={styles.buttonText}>Aguarde</Text>
            </>
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </View>
      </TouchableOpacity>

      <RNModal
        animationType="slide"
        transparent={true}
        visible={modalConfirmResumeSubscriptionVisible}
        onRequestClose={() => setModalConfirmResumeSubscriptionVisible(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.h4}>
              {msgConfirmResumeSubscription}
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalConfirmResumeSubscriptionVisible(false)}
            >
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>

      <RNModal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.h4}>
              {msgCadastro}
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>

      <RNModal
        animationType="slide"
        transparent={true}
        visible={modalAssinaturaVisible}
        onRequestClose={() => setModalAssinaturaVisible(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="warning-outline" size={100} color="#FFCA00" style={{ marginRight: 8 }} />
              <Text style={{ marginBottom: 20, fontWeight: 'bold' }}>
                Nenhuma assinatura ativa encontrada.
              </Text>
            </View>

            <TouchableOpacity onPress={() => navigation.replace('Cadastro')} style={{ marginBottom: 20, flexDirection: 'row' }}>
              <Text style={stylesLogin.registerText}>Não é assinante ainda? </Text>
              <Text style={stylesLogin.registerLink}>Cadastre-se</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setModalAssinaturaVisible(false), setModalResumeSubscription(true) }} style={{ marginBottom: 20, flexDirection: 'row' }}>
              <Text style={stylesLogin.registerText}>Quer reativar sua assinatura? </Text>
              <Text style={stylesLogin.registerLink}>Clique aqui!</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalAssinaturaVisible(false)} style={{ marginBottom: 20, flexDirection: 'row' }}>
              <Text style={stylesLogin.registerLink}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>

      <RNModal
        animationType="slide"
        transparent={true}
        visible={modalResumeSubscription}
        onRequestClose={() => setModalResumeSubscription(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text>
              Digite seu email de login para reativar sua assinatura
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email de login"
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity onPress={handleResumeSubscription} style={styles.button}>
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Confirmar Rativação de assinatura</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalResumeSubscription(false)} style={styles.buttonDanger}>
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>
    </View>
  );
}

const stylesLogin = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  logoView: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 40,
    alignSelf: 'center',
    flexShrink: 1,
  },
  registerContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    marginTop: 15,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1d1e22',
    marginLeft: 5,
  },
});
