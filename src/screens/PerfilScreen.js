import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../assets/css/styles';

export default function PerfilScreen({ navigation }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true)

        const token = await AsyncStorage.getItem('token');

        if (token) {
            const response = await api.post('/logout', null, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            navigation.navigate('Login');
        }

        setIsLoading(false)
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={styles.button} onPress={handleLogout} disabled={isLoading}>
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
                        <Text style={styles.buttonText}>Logout</Text>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
}