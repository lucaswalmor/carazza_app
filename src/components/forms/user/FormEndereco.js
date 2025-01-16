import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';

const FormEndereco = ({ dados, onInputChange }) => {
    const [errors, setErrors] = useState({});

    return (
        <View style={styles.container}>
            <View style={styles.inputView}>
                <TextInputMask
                    style={styles.input}
                    type={'zip-code'}
                    value={dados.cep}
                    placeholder="CEP"
                    onChangeText={(text) => onInputChange('cep', text)}
                />
                {errors.cep && <Text style={styles.errorText}>{errors.cep[0]}</Text>}
            </View>

            <View style={styles.inputView}>
                <TextInput
                    style={styles.input}
                    placeholder="Rua"
                    value={dados.rua}
                    onChangeText={(text) => onInputChange('rua', text)}
                />
                {errors.rua && <Text style={styles.errorText}>{errors.rua[0]}</Text>}
            </View>

            <View style={styles.inputView}>
                <TextInput
                    style={styles.input}
                    placeholder="Bairro"
                    value={dados.bairro}
                    onChangeText={(text) => onInputChange('bairro', text)}
                />
                {errors.bairro && <Text style={styles.errorText}>{errors.bairro[0]}</Text>}
            </View>

            <View style={styles.inputView}>
                <TextInput
                    style={styles.input}
                    placeholder="Número"
                    value={dados.numero}
                    onChangeText={(text) => onInputChange('numero', text)}
                />
                {errors.numero && <Text style={styles.errorText}>{errors.numero[0]}</Text>}
            </View>

            <View style={styles.inputView}>
                <TextInput
                    style={styles.input}
                    placeholder="Complemento"
                    value={dados.complemento}
                    onChangeText={(text) => onInputChange('complemento', text)}
                />
                {errors.complemento && <Text style={styles.errorText}>{errors.complemento[0]}</Text>}
            </View>

            <View style={styles.inputView}>
                <TextInput
                    style={styles.input}
                    placeholder="Cidade"
                    value={dados.cidade}
                    onChangeText={(text) => onInputChange('cidade', text)}
                    editable={false}
                />
                {errors.cidade && <Text style={styles.errorText}>{errors.cidade[0]}</Text>}
            </View>

            <View style={styles.inputView}>
                <TextInput
                    style={styles.input}
                    placeholder="Estado"
                    value={dados.estado}
                    onChangeText={(text) => onInputChange('estado', text)}
                    editable={false}
                />
                {errors.estado && <Text style={styles.errorText}>{errors.estado[0]}</Text>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
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

export default FormEndereco;
