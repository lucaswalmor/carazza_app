import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EventosScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Bem-vindo à tela de Eventos!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
});