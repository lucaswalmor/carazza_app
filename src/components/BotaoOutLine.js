import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

const BotaoOutLine = ({ severity, children, onPress }) => {
    // Definir as cores para cada tipo de severidade
    const severityStyles = {
        success: {
            borderColor: '#10B981', // Verde
            textColor: '#10B981', // Verde
        },
        info: {
            borderColor: '#3B82F6', // Azul
            textColor: '#3B82F6', // Azul
        },
        warn: {
            borderColor: '#F97316', // Laranja
            textColor: '#F97316', // Laranja
        },
        error: {
            borderColor: '#EF4444', // Vermelho
            textColor: '#EF4444', // Vermelho
        },
        secondary: {
            borderColor: '#6B7280', // Cinza
            textColor: '#6B7280', // Cinza
        },
    };

    // Atribuindo as cores com fallback para 'info' caso o tipo não seja válido
    const { borderColor, textColor } = severityStyles[severity] || severityStyles.info;

    return (
        <TouchableOpacity
            style={[styles.buttonContainer, { borderColor }]}
            onPress={onPress}
        >
            <View style={styles.buttonContent}>
                {/* JSX passado como children */}
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
        borderWidth: 1,  // Borda com 2px
        backgroundColor: '#FFFFFF', // Fundo branco
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

export default BotaoOutLine;
