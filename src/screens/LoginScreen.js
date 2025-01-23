import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Button, Modal as RNModal, Alert } from 'react-native';
import styles from '../../styles';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons'

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

  useEffect(() => {
    checkBiometricAuth();
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

  const handleRegisterNavigation = () => {
    navigation.navigate('Cadastro');
  };

  const handleLogin = async (emailBiometria, passwordBiometria) => {
    if (!email && !emailBiometria) {
      Alert.alert('O campo email é obrigatório');
    } else if (!password && !passwordBiometria) {
      Alert.alert('O campo senha é obrigatório');
    }

    setIsLoading(true);
    try {
      const response = await api.post('/login', { email: email || emailBiometria, password: password || passwordBiometria });
      const data = response.data;

      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('email', email || emailBiometria);
      await AsyncStorage.setItem('password', password || passwordBiometria);

      if (data && data.user.subscription_status) {
        navigation.replace('Main');
      } else {
        setModalAssinaturaVisible(true)
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data.errors);
      } else {
        console.log('Erro:', error.message);
      }
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      const response = await api.get(`/stripe/subscription/resume?email=${email}`);
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
        <Image source={require('../assets/img/logo.png')} style={stylesLogin.logo} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email[0]}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password[0]}</Text>}

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
              <Text style={{color: '#FFFFFF', fontWeight: 'bold'}}>Confirmar Rativação de assinatura</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalResumeSubscription(false)} style={styles.buttonDanger}>
              <Text style={{color: '#FFFFFF', fontWeight: 'bold'}}>Cancelar</Text>
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
    color: '#007BFF',
    marginLeft: 5,
  },
});
