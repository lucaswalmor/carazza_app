import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput, Alert, SafeAreaView } from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';
import styles from '../assets/css/styles';
import api from '../services/api';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CadastrarEncontroScreen({ navigation }) {
    const [nome, setNome] = useState('Encontro Nacional de Harley-Davidson 2024');
    const [descricao, setDescricao] = useState('Encontro anual para entusiastas da marca');
    const [dataInicio, setDataInicio] = useState('01/05/2025');
    const [dataTermino, setDataTermino] = useState('03/05/2025');
    const [horaInicio, setHoraInicio] = useState('08:00');
    const [horaTermino, setHoraTermino] = useState('20:00');
    const [local, setLocal] = useState('Autódromo de Interlagos - SP');

    const [cep, setCep] = useState('38080-615');
    const [rua, setRua] = useState(null);
    const [bairro, setBairro] = useState(null);
    const [numero, setNumero] = useState('147');
    const [cidade, setCidade] = useState(null);
    const [estado, setEstado] = useState(null);
    const [estadoCompleto, setEstadoCompleto] = useState(null);

    const [nomeOrganizador, setNomeOrganizador] = useState('Lucas Steinbach');
    const [whatsapp, setWhatsapp] = useState('(34) 99202-1394');
    const [email, setEmail] = useState('lucaswsb52@gmail.com');
    const [instagram, setInstagram] = useState('@lucassteinbach');
    const [regras, setRegras] = useState('Capacete obrigatório, documento da moto em dia');

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const handleNext = () => {
        setCurrentStep((prevStep) => prevStep + 1);
    };

    const handlePrevious = () => {
        setCurrentStep((prevStep) => prevStep - 1);
    };

    const pesquisacep = async (valor) => {
        const cep = valor.replace(/\D/g, '');
        setCep(valor)
        try {
            if (cep.length != 8) return;

            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.logradouro) setRua(data.logradouro)
            if (data.bairro) setBairro(data.bairro)
            if (data.uf) setEstado(data.uf)
            if (data.estado) setEstadoCompleto(data.estado)
            if (data.localidade) setCidade(data.localidade)
        } catch (error) {
            console.error('Erro ao buscar o CEP:', error);
        }
    };

    const backToEncontros = () => {
        navigation.navigate('Main', { screen: 'Tabs', params: { screen: 'Encontros' } });
    };

    const handleRegister = async () => {
        setIsLoading(true);

        const formData = new FormData();

        formData.append('nome', nome);
        formData.append('descricao', descricao);
        formData.append('data_inicio', dataInicio);
        formData.append('data_termino', dataTermino);
        formData.append('horario_inicio', horaInicio);
        formData.append('horario_termino', horaTermino);
        formData.append('local', local);

        formData.append('cep', cep);
        formData.append('rua', rua);
        formData.append('bairro', bairro);
        formData.append('numero', numero);
        formData.append('estado', estado);
        formData.append('estado_completo', estadoCompleto);
        formData.append('cidade', cidade);

        formData.append('nome_organizador', nomeOrganizador);
        formData.append('whatsapp', whatsapp);
        formData.append('email_contato', email);
        formData.append('instagram', instagram);
        formData.append('regras', regras);

        formData.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });

        const token = await AsyncStorage.getItem('token');

        try {
            const response = await api.post('/encontro/store', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
            });

            Alert.alert(response.data.message)
        } catch (err) {
            if (err.response && err.response.data) {
                console.log('Erros de validação:', err.response.data.errors);
                setErrors(err.response.data.errors);
            } else {
                console.log('Erro:', err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, marginBottom: 50 }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView
                        contentContainerStyle={{ padding: 20 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View>
                            {currentStep === 1 && (
                                <View style={{ flex: 1 }}>
                                    <Text style={{ textAlign: 'center', margin: 20, fontSize: 16, fontWeight: 'bold' }}>
                                        Informações Básicas
                                    </Text>

                                    <View style={styles.inputView}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Nome do Encontro"
                                            value={nome}
                                            onChangeText={(text) => setNome(text)}
                                        />
                                        {errors.nome && <Text style={styles.errorText}>{errors.nome[0]}</Text>}
                                    </View>

                                    <View style={styles.inputView}>
                                        <TextInput
                                            style={styles.textArea}
                                            placeholder="Descrição do local"
                                            multiline
                                            numberOfLines={4}
                                            value={descricao}
                                            onChangeText={(text) => setDescricao(text)}
                                        />
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
                                            value={dataTermino}
                                            placeholder="Data de Término"
                                            onChangeText={(text) => setDataTermino(text)}
                                        />
                                        {errors.data_termino && <Text style={styles.errorText}>{errors.data_termino[0]}</Text>}
                                    </View>

                                    <View style={styles.inputView}>
                                        <MaskedTextInput
                                            mask="99:99"
                                            keyboardType="numeric"
                                            style={styles.input}
                                            value={horaInicio}
                                            placeholder="Hora de Início"
                                            onChangeText={(text) => setHoraInicio(text)}
                                        />
                                        {errors.horario_inicio && <Text style={styles.errorText}>{errors.horario_inicio[0]}</Text>}
                                    </View>

                                    <View style={styles.inputView}>
                                        <MaskedTextInput
                                            mask="99:99"
                                            keyboardType="numeric"
                                            style={styles.input}
                                            value={horaTermino}
                                            placeholder="Hora de Término"
                                            onChangeText={(text) => setHoraTermino(text)}
                                        />
                                        {errors.horario_termino && <Text style={styles.errorText}>{errors.horario_termino[0]}</Text>}
                                    </View>

                                    <View style={styles.inputView}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Local do encontro"
                                            value={local}
                                            onChangeText={(text) => setLocal(text)}
                                        />
                                        {errors.nome && <Text style={styles.errorText}>{errors.nome[0]}</Text>}
                                    </View>
                                </View>
                            )}

                            {currentStep === 2 && (
                                <View style={{ flex: 1 }}>
                                    <Text style={{ textAlign: 'center', margin: 20, fontSize: 16, fontWeight: 'bold' }}>
                                        Endereço
                                    </Text>

                                    <View style={styles.inputView}>
                                        <MaskedTextInput
                                            mask="99999-999"
                                            keyboardType="numeric"
                                            style={styles.input}
                                            value={cep}
                                            placeholder="CEP"
                                            onChangeText={(text) => pesquisacep(text)}
                                        />
                                        {errors.cep && <Text style={styles.errorText}>{errors.cep[0]}</Text>}
                                    </View>

                                    <View style={styles.inputView}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Rua"
                                            value={rua}
                                            onChangeText={(text) => setRua(text)}
                                        />
                                        {errors.rua && <Text style={styles.errorText}>{errors.rua[0]}</Text>}
                                    </View>

                                    <View style={styles.inputView}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Bairro"
                                            value={bairro}
                                            onChangeText={(text) => setBairro(text)}
                                        />
                                        {errors.bairro && <Text style={styles.errorText}>{errors.bairro[0]}</Text>}
                                    </View>

                                    <View style={styles.inputView}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Número"
                                            value={numero}
                                            onChangeText={(text) => setNumero(text)}
                                        />
                                        {errors.numero && <Text style={styles.errorText}>{errors.numero[0]}</Text>}
                                    </View>

                                    <View style={styles.inputView}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Estado"
                                            value={estado}
                                            onChangeText={(text) => setEstado(text)}
                                        />
                                        {errors.estado && <Text style={styles.errorText}>{errors.estado[0]}</Text>}
                                    </View>

                                    <View style={styles.inputView}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Cidade"
                                            value={cidade}
                                            onChangeText={(text) => setCidade(text)}
                                        />
                                        {errors.cidade && <Text style={styles.errorText}>{errors.cidade[0]}</Text>}
                                    </View>
                                </View>
                            )}

                            {currentStep === 3 && (
                                <View style={{ flex: 1 }}>
                                    <Text style={{ textAlign: 'center', margin: 20, fontSize: 16, fontWeight: 'bold' }}>
                                        Organizador do Encontro
                                    </Text>

                                    <View style={styles.inputView}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Nome do Organizador"
                                            value={nomeOrganizador}
                                            onChangeText={(text) => setNomeOrganizador(text)}
                                        />
                                        {errors.nome_organizador && <Text style={styles.errorText}>{errors.nome_organizador[0]}</Text>}
                                    </View>

                                    <View style={styles.inputView}>
                                        <MaskedTextInput
                                            mask="(99) 99999-9999"
                                            keyboardType="numeric"
                                            style={styles.input}
                                            value={whatsapp}
                                            placeholder="Whatsapp"
                                            onChangeText={(text) => setWhatsapp(text)}
                                        />
                                        {errors.whatsapp && <Text style={styles.errorText}>{errors.whatsapp[0]}</Text>}
                                    </View>

                                    <View style={styles.inputView}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Email de Contato"
                                            value={email}
                                            onChangeText={(text) => setEmail(text)}
                                        />
                                        {errors.email_contato && <Text style={styles.errorText}>{errors.email_contato[0]}</Text>}
                                    </View>

                                    <View style={styles.inputView}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Instagram"
                                            value={instagram}
                                            onChangeText={(text) => setInstagram(text)}
                                        />
                                        {errors.instagram && <Text style={styles.errorText}>{errors.instagram[0]}</Text>}
                                    </View>

                                    <TextInput
                                        style={styles.textArea}
                                        placeholder="Regras"
                                        multiline
                                        numberOfLines={4}
                                        value={regras}
                                        onChangeText={(text) => setRegras(text)}
                                    />
                                </View>
                            )}

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                                {currentStep == 1 && (
                                    <TouchableOpacity
                                        style={styles.buttonVoltar}
                                        onPress={backToEncontros}
                                    >
                                        <Text style={styles.buttonText}>Voltar</Text>
                                    </TouchableOpacity>
                                )}
                                {currentStep > 1 && (
                                    <TouchableOpacity
                                        style={styles.buttonVoltar}
                                        onPress={handlePrevious}
                                    >
                                        <Text style={styles.buttonText}>Voltar</Text>
                                    </TouchableOpacity>
                                )}
                                {currentStep < 3 ? (
                                    <TouchableOpacity style={styles.button} onPress={handleNext}>
                                        <Text style={styles.buttonText}>Próximo</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
                                        <View style={styles.buttonContent}>
                                            {isLoading ? (
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
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};