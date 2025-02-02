import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const Message = ({ severity, children }) => {
    const severityStyles = {
        success: {
            backgroundColor: '#F1FDF5',
            textColor: '#10B981',
        },
        info: {
            backgroundColor: '#F0F7FF',
            textColor: '#3B82F6',
        },
        warn: {
            backgroundColor: '#FEFCE9',
            textColor: '#F97316',
        },
        error: {
            backgroundColor: '#FEF3F3',
            textColor: '#EF4444',
        },
        secondary: {
            backgroundColor: '#F1F5F9',
            textColor: '#6B7280',
        },
    };

    const { backgroundColor, textColor } = severityStyles[severity] || severityStyles.info;

    return (
        <View style={[styles.messageContainer, { backgroundColor, borderColor: textColor, borderWidth: 1 }]}>
          <Text style={[styles.messageText, { color: textColor }]}>{children}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    messageContainer: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    messageText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    success: {
        backgroundColor: '#F1FDF5',
        color: '#10B981',
    },
    info: {
        backgroundColor: '#F0F7FF',
        color: '#3B82F6',
    },
    warn: {
        backgroundColor: '#FEFCE9',
        color: '#F97316',
    },
    error: {
        backgroundColor: '#FEF3F3',
        color: '#EF4444',
    },
    secondary: {
        backgroundColor: '#F1F5F9',
        color: '#6B7280',
    },
});

export default Message;
