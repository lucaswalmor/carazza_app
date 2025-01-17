import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import styles from '../assets/css/styles';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);

        try {
            const response = await api.post('/login', { email: email, password: password });

            const data = response.data;

            if (data && data.user.subscription_status) {
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
                await AsyncStorage.setItem('token', data.token);
                navigation.replace('Main');
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
