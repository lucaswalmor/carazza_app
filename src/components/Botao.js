import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../assets/css/primeflex';

const Botao = ({ severity, children, onPress, style }) => {
    // Definir cores para cada "severity"
    const severityStyles = {
        success: {
            backgroundColor: '#10B981', // Verde
            textColor: '#FFFFFF', // Branco
        },
        info: {
            backgroundColor: '#3B82F6', // Azul
            textColor: '#FFFFFF', // Branco
        },
        warn: {
            backgroundColor: '#F97316', // Laranja
            textColor: '#FFFFFF', // Branco
        },
        error: {
            backgroundColor: '#EF4444', // Vermelho
            textColor: '#FFFFFF', // Branco
        },
        secondary: {
            backgroundColor: '#6B7280', // Cinza
            textColor: '#FFFFFF', // Branco
        },
        help: {
            backgroundColor: colors.indigo[500], // Cinza
            textColor: '#FFFFFF', // Branco
        },
    };

    // Atribuindo as cores com fallback para 'info' caso o tipo não seja válido
    const { backgroundColor, textColor } = severityStyles[severity] || severityStyles.info;

    return (
        <TouchableOpacity
            style={[styles.buttonContainer, { backgroundColor }, style]}
            onPress={onPress}
        >
            <View style={styles.buttonContent}>
                {children ? (
                    children
                ) : (
                    <Text style={[styles.buttonText, { color: textColor }]}>Clique Aqui</Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        width: '100%'
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default Botao;
