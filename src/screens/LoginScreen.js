import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Button, Modal as RNModal, Alert } from 'react-native';
import styles from '../assets/css/styles';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = React.useState(false);

    useEffect(() => {
        Alert.alert('Entrou na tela de login')
        checkBiometricAuth();
    }, []);

    const checkBiometricAuth = async () => {
        const storedEmail = await AsyncStorage.getItem('email');
        const storedPassword = await AsyncStorage.getItem('password');
        Alert.alert('Entrou funcao de checar a biometria')
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
                setModalVisible(true)
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
            Alert.alert('Porfavor Digite seu e-mail');
        }

        if (user && token) {
            try {
                setIsLoading(true);
                const response = await api.get(`/stripe/subscription/resume?email=${email}`);
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


            <RNModal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalCenteredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.h4}>
                            Sua assinatura expirou ou está pausada, gostaria de renovar sua assinatura ?
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 20 }}>
                            <TouchableOpacity style={styles.buttonSecondary} onPress={() => setModalVisible(false)} disabled={isLoading}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.button} onPress={handlePauseSubscription} disabled={isLoading}>
                                <View style={[styles.buttonContent, { flex: 1 }]}>
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
                                        <Text style={styles.buttonText}>Renovar</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
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
