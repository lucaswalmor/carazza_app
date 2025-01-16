import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { TextInputMask } from 'react-native-masked-text';

const FormDadosPessoais = ({ dados, handleProfileImageChange, onInputChange }) => {
    const [errors, setErrors] = useState({});
    const [profileImage, setProfileImage] = useState(null);

    const handleSelectImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permissão para acessar a galeria é necessária!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
            handleProfileImageChange(result.assets[0].uri)
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.imageContainer} onPress={handleSelectImage}>
                {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.image} />
                ) : (
                    <Text style={styles.imagePlaceholder}>Foto de Perfil</Text>
                )}
            </TouchableOpacity>

            <View style={styles.inputView}>
                <TextInput
                    style={styles.input}
                    placeholder="Nome Completo"
                    value={dados.nome}
                    onChangeText={(text) => onInputChange('nome', text)}
                />
                {errors.nome && <Text style={styles.errorText}>{errors.nome[0]}</Text>}
            </View>

            <View style={styles.inputView}>
                <TextInputMask
                    style={styles.input}
                    type={'cpf'}
                    value={dados.cpf}
                    onChangeText={(text) => onInputChange('cpf', text)}
                    placeholder="CPF"
                />
                {errors.cpf && <Text style={styles.errorText}>{errors.cpf[0]}</Text>}
            </View>

            <View style={styles.inputView}>
                <TextInputMask
                    style={styles.input}
                    type={'cel-phone'}
                    options={{
                        maskType: 'BRL',
                        withDDD: true,
                        dddMask: '(99) '
                    }}
                    value={dados.telefone}
                    placeholder="Telefone"
                    onChangeText={(text) => onInputChange('telefone', text)}
                />
                {errors.telefone && <Text style={styles.errorText}>{errors.telefone[0]}</Text>}
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

export default FormDadosPessoais;
