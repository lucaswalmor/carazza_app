import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { display, gap } from '../assets/css/primeflex';

const Toast = ({ message, position = 'top', duration = 5000, onClose, severity = 'info' }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const colors = {
        danger: '#EF4444',  // Vermelho
        success: '#059669', // Verde
        warning: '#F59E0B', // Amarelo
        info: '#14B8A6',    // Ciano
        help: '#6366F1',    // Azul
    };

    const icons = {
        danger: 'times-circle',  // Ícone de erro
        success: 'check-circle', // Ícone de sucesso
        warning: 'exclamation-circle', // Ícone de aviso
        info: 'info-circle',    // Ícone de info
        help: 'question-circle', // Ícone de ajuda
    };

    // Cor do fundo com base no severity
    const backgroundColor = colors[severity] || colors.info;
    const iconName = icons[severity] || icons.info;

    useEffect(() => {
        // Animação de fade-in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Fechar o toast automaticamente após o tempo definido
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => onClose && onClose());
        }, duration);

        return () => clearTimeout(timer);
    }, [fadeAnim, duration, onClose]);

    const getPositionStyle = () => {
        switch (position) {
            case 'center':
                return styles.center;
            case 'bottom':
                return styles.bottom;
            default:
                return styles.top;
        }
    };

    return (
        <Animated.View style={[styles.toastContainer, getPositionStyle(), { opacity: fadeAnim, backgroundColor }]}>
            <View style={[display.row, display.alignItemsCenter]}>
                <View style={styles.iconContainer}>
                    <FontAwesome5 name={iconName} size={20} color="#fff" />
                </View>
                <Text style={styles.toastText}>{message}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 8,
        zIndex: 1000,
        elevation: 5,
    },
    toastText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        flexShrink: 1,
        flexWrap: 'wrap',
    },
    iconContainer: {
        marginRight: 10, // Espaço entre o ícone e o texto
    },
    top: {
        top: 10,
    },
    center: {
        top: '50%',
        transform: [{ translateY: -30 }],
    },
    bottom: {
        bottom: 10,
    },
});

export default Toast;
