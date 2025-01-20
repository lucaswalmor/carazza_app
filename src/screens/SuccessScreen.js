import React from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import styles from '../../styles';

export default function SuccessScreen({ navigation }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>Assinatura concluída com sucesso!</Text>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.buttonText}>Ir para tela de Login</Text>
            </TouchableOpacity>
        </View>
    );
}
