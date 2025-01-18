import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import styles from '../assets/css/styles';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal, Portal } from 'react-native-paper';
import * as LocalAuthentication from 'expo-local-authentication';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        checkBiometricAuth();
    }, []);

    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);
    const containerStyle = { backgroundColor: 'white', padding: 20, margin: 20 };

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
            Alert.alert('Falha na autenticação biométrica');
        }
    };

    const handleLogin = async (emailBiometria, passwordBiometria) => {
        setIsLoading(true);
        try {
            const response = await api.post('/login', { email: email || emailBiometria, password: password || passwordBiometria });
            const data = response.data;
            await AsyncStorage.setItem('email', email || emailBiometria);
            await AsyncStorage.setItem('password', password || passwordBiometria);

            if (data && data.user.subscription_status) {
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
                await AsyncStorage.setItem('token', data.token);
                navigation.replace('Main');
            } else {
                showModal();
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

    const handleRegisterNavigation = () => {
        navigation.navigate('Register');
    };

    const handlePauseSubscription = async () => {
        const token = await AsyncStorage.getItem('token');
        const user = JSON.parse(await AsyncStorage.getItem('user'));

        if (!email) {
            Alert.alert('Porfavor Digite seu E-MAIL');
        }

        if (user && token) {
            try {
                setIsLoading(true);
                const response = await api.get(`/stripe/subscription/resume?email=${email}`);
                hideModal();
                handleLogin();
            } catch (error) {
                console.error('Erro ao enviar o formulário:', error);
            } finally {
                setIsLoading(false)
            }
        }
    };

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
                placeholder="Password"
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

            <Portal style={{ margin: 20 }}>
                <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
                    <Text style={{ fontSize: 18 }}>
                        Seu plano está pausado, gostaria de reativa-lo?
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={handlePauseSubscription} disabled={isLoading}>
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
                                <Text style={styles.buttonText}>Reativar Assinatura</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </Modal>
            </Portal>
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
