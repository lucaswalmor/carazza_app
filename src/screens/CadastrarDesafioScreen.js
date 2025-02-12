import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, TextInput, Alert } from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';
import styles from '../assets/css/styles';
import api from '../services/api';
import { Ionicons } from 'react-native-vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from '../components/Toast';
import { Picker } from '@react-native-picker/picker';
import Botao from '../components/Botao';

export default function CadastrarDesafioScreen({ navigation }) {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [tipo, setTipo] = useState('');
    const [regras, setRegras] = useState('');
    const [pontos, setPontos] = useState('');
    const [dataInicio, setDataInicio] = useState(null);
    const [dataFim, setDataFim] = useState(null);
    const [toast, setToast] = useState({ visible: false, message: '', position: 'bottom', severity: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const tiposDesafios = [
        { label: 'Quilometragem', value: 1 },
        { label: 'Chek-in em Eventos', value: 2 },
        { label: 'Chek-in em Encontros', value: 3 },
        { label: 'Chek-in em Pontos', value: 4 },
    ];

    const handleRegister = async () => {
        setIsLoading(true);

        const formData = new FormData();

        formData.append('nome', nome);
        formData.append('descricao', descricao);
        formData.append('tipo', tipo);
        formData.append('regras', regras);
        formData.append('pontos', pontos);
        formData.append('data_inicio', dataInicio);
        formData.append('data_termino', dataFim);

        formData.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });

        const token = await AsyncStorage.getItem('token');

        try {
            const response = await api.post('/desafio/store', formData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
            });

            showToast(response.data.message, 'top', 'success')
        } catch (error) {
            if (error.response.data.errors) {
                setErrors(error.response.data.errors)
            } else {
                showToast(error.response.data.error, 'top', 'danger')
            }
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (message, position, severity) => {
        setToast({ visible: true, message, position, severity });

        // Esconde o toast após 3 segundos
        setTimeout(() => setToast({ ...toast, visible: false }), 3000);
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={{ padding: 20 }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={{ flex: 1 }}>
                    <View style={styles.inputView}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nome do Desafio"
                            value={nome}
                            onChangeText={(text) => setNome(text)}
                        />
                        {errors.nome && <Text style={styles.errorText}>{errors.nome[0]}</Text>}
                    </View>

                    <View style={styles.inputView}>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Descrição do Desafio"
                            multiline
                            numberOfLines={4}
                            value={descricao}
                            onChangeText={(text) => setDescricao(text)}
                        />
                        {errors.descricao && <Text style={styles.errorText}>{errors.descricao[0]}</Text>}
                    </View>

                    <View style={styles.inputView}>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Regras do Desafio"
                            multiline
                            numberOfLines={4}
                            value={regras}
                            onChangeText={(text) => setRegras(text)}
                        />
                        {errors.regras && <Text style={styles.errorText}>{errors.regras[0]}</Text>}
                    </View>

                    <View style={styles.inputView}>
                        <MaskedTextInput
                            mask="99999"
                            keyboardType="numeric"
                            style={styles.input}
                            value={pontos}
                            placeholder="Pontos do Desafio"
                            onChangeText={(text) => setPontos(text)}
                        />
                        {errors.pontos && <Text style={styles.errorText}>{errors.pontos[0]}</Text>}
                    </View>

                    <View style={styles.inputView}>
                        <MaskedTextInput
                            mask="99/99/9999"
                            keyboardType="numeric"
                            style={styles.input}
                            value={dataInicio}
                            placeholder="Data de Início"
                            onChangeText={(text) => setDataInicio(text)}
                        />
                        {errors.data_inicio && <Text style={styles.errorText}>{errors.data_inicio[0]}</Text>}
                    </View>

                    <View style={styles.inputView}>
                        <MaskedTextInput
                            mask="99/99/9999"
                            keyboardType="numeric"
                            style={styles.input}
                            value={dataFim}
                            placeholder="Data de Término"
                            onChangeText={(text) => setDataFim(text)}
                        />
                        {errors.data_fim && <Text style={styles.errorText}>{errors.data_fim[0]}</Text>}
                    </View>

                    <View style={styles.inputView}>
                        <Picker
                            selectedValue={tipo}
                            onValueChange={(itemValue) => setTipo(itemValue)}
                            style={styles.input}
                        >
                            <Picker.Item label="Selecione o Tipo do Desafio" value="" />
                            {tiposDesafios.map((item) => (
                                <Picker.Item key={item.value} label={item.label} value={item.value} />
                            ))}
                        </Picker>
                        {errors.tipo && <Text style={styles.errorText}>{errors.tipo[0]}</Text>}
                    </View>

                    <View>
                        <Botao onPress={handleRegister}>
                            {
                                isLoading ? (
                                    <>
                                        <ActivityIndicator
                                            style={styles.loadingIndicator}
                                            size="small"
                                            color="#fff"
                                        />
                                        <Text style={styles.buttonText}>Aguarde</Text>
                                    </>
                                ) : (
                                    <Text style={styles.buttonText}>Finalizar Cadastro</Text>
                                )}
                        </Botao>
                    </View>
                </View>
            </ScrollView>

            {toast.visible && (
                <Toast
                    message={toast.message}
                    position={toast.position}
                    onClose={() => setToast({ ...toast, visible: false })}
                    severity={toast.severity}
                />
            )}
        </View>
    );
};