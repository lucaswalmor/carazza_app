import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

const FormDadosLogin = ({ dados, onInputChange }) => {
    const [errors, setErrors] = useState({});

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, marginTop: 50, }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.inputView}>
                    <TextInput
                        style={styles.input}
                        placeholder="E-mail"
                        value={dados.email}
                        onChangeText={(text) => onInputChange('email', text)}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email[0]}</Text>}
                </View>

                <View style={styles.inputView}>
                    <TextInput
                        style={styles.input}
                        placeholder="Senha"
                        secureTextEntry
                        value={dados.senha}
                        onChangeText={(text) => onInputChange('senha', text)}
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password[0]}</Text>}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    imageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        color: '#7d7d7d',
        fontSize: 14,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#ccc',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginLeft: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonVoltar: {
        backgroundColor: '#6c757d',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    buttonTextVoltar: {
        color: '#DDDDDD',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    registerContainer: {
        flexDirection: 'row',
        marginBottom: 5,
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
    buttonsContainer: {
        flexDirection: 'row',
        marginTop: 5,
    },
    inputView: {
        width: '100%',
    },
    errorText: {
        marginBottom: 5,
        color: 'red'
    },
    select: {
        borderWidth: 1,
        marginTop: 10,
        paddingHorizontal: 10,
        height: 50,
        backgroundColor: '#f5f5f5',
        borderRadius: 5,
    },
    label: {
        marginBottom: 5,
        fontSize: 16,
        color: '#333',
    },
});

export default FormDadosLogin;
