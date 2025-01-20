import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createPreference, criarAssinatura } from '../services/MercadoPago'; // Ajustado para Mercado Pago
import { openBrowserAsync } from 'expo-web-browser';
import { MaskedTextInput } from 'react-native-mask-text';
import styles from '../../styles';
import api from '../services/api';

const RegisterScreen = ({ navigation }) => {
    const [profileImage, setProfileImage] = useState(null);
    const [nome, setNome] = useState('Teste');
    const [telefone, setTelefone] = useState('(00) 0 0000-0000');
    const [cpf, setCpf] = useState('000.000.000-00');

    const [cep, setCep] = useState('38080-615');
    const [rua, setRua] = useState(null);
    const [bairro, setBairro] = useState(null);
    const [numero, setNumero] = useState('147');
    const [complemento, setComplemento] = useState(null);
    const [estado, setEstado] = useState(null);
    const [cidade, setCidade] = useState(null);

    const [email, setEmail] = useState('teste@gmail.com');
    const [password, setPassword] = useState('12345678');

    const [subscriptionId, setSubscriptionId] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [userId, setUserId] = useState(null);

    const [errors, setErrors] = useState({});
    const [dados, setDados] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [showSteps, setShowSteps] = useState(true);

    const [cardData, setCardData] = useState({ cardNumber: '5031433215406351', expirationDate: '11/25', securityCode: '123', cardholderName: 'teste' });

    const handleNext = () => {
        setCurrentStep((prevStep) => prevStep + 1);
    };

    const handlePrevious = () => {
        setCurrentStep((prevStep) => prevStep - 1);
    };

    const handleProfileImageChange = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permissão para acessar a galeria é necessária!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
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
            if (data.localidade) setCidade(data.localidade)
        } catch (error) {
            console.error('Erro ao buscar o CEP:', error);
        }
    };

    const handleRegister = async () => {
        setIsLoading(true);

        const formData = new FormData();

        // Adicionar campos ao FormData
        formData.append('nome', nome);
        formData.append('telefone', telefone);
        formData.append('cpf', cpf);

        formData.append('cep', cep);
        formData.append('rua', rua);
        formData.append('bairro', bairro);
        formData.append('numero', numero);
        formData.append('complemento', complemento);
        formData.append('estado', estado);
        formData.append('cidade', cidade);

        formData.append('email', email);
        formData.append('password', password);

        // Adicionar imagem ao FormData (se existir)
        if (profileImage) {
            const fileName = profileImage.split('/').pop();
            const fileType = fileName.split('.').pop();
            formData.append('img_perfil', {
                uri: profileImage,
                name: fileName,
                type: `image/${fileType}`,
            });
        }

        try {
            const response = await api.post('/user/store', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            handlePayment();
            setUserId(response.data.data.id)
        } catch (err) {
            if (err.response && err.response.data) {
                console.log('Erros de validação:', err.response.data.errors);
                setErrors(err.response.data.errors);
                setIsLoading(false);
            } else {
                console.log('Erro:', err.message);
                setIsLoading(false);
            }
        }
    };

    const handlePayment = async () => {
        if (!email) {
            Alert.alert('Digite seu email')
        }

        // const checkoutUrl = await createPreference(email); // Utiliza o Mercado Pago
        const url = `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380849469a4a1019485312b350edb`;
        
        try {
            await openBrowserAsync(url);
        } catch (error) {
            console.error('Erro ao abrir o checkout:', error);
        }
    }

    const backToLogin = () => {
        navigation.replace('Login');
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, paddingTop: 60, }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                {!showSteps ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ textAlign: 'center', margin: 20 }}>
                            Parece que você não finalizou o pagamento.
                        </Text>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => handlePayment()}>
                            <Text style={styles.buttonText}>Realizar Pagamento</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {currentStep === 1 && (
                            <View style={{ flex: 1 }}>
                                <Text style={{ textAlign: 'center', margin: 20, fontSize: 16, fontWeight: 'bold' }}>
                                    Dados Pessoais
                                </Text>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <TouchableOpacity style={styles.imageContainer} onPress={handleProfileImageChange}>
                                        {profileImage ? (
                                            <Image source={{ uri: profileImage }} style={styles.image} />
                                        ) : (
                                            <Text style={styles.imagePlaceholder}>Foto de Perfil</Text>
                                        )}
                                    </TouchableOpacity>
                                    {errors.img_perfil && <Text style={styles.errorText}>{errors.img_perfil[0]}</Text>}
                                </View>

                                <View style={styles.inputView}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nome Completo"
                                        value={nome}
                                        onChangeText={(text) => setNome(text)}
                                    />
                                    {errors.nome && <Text style={styles.errorText}>{errors.nome[0]}</Text>}
                                </View>

                                <View style={styles.inputView}>
                                    <MaskedTextInput
                                        mask="999.999.999-99"
                                        keyboardType="numeric"
                                        style={styles.input}
                                        value={cpf}
                                        placeholder="CPF"
                                        onChangeText={(text) => setCpf(text)}
                                    />
                                    {errors.cpf && <Text style={styles.errorText}>{errors.cpf[0]}</Text>}
                                </View>

                                <View style={styles.inputView}>
                                    <MaskedTextInput
                                        mask="(99) 9 9999-9999"
                                        keyboardType="numeric"
                                        style={styles.input}
                                        value={telefone}
                                        placeholder="Telefone"
                                        onChangeText={(text) => setTelefone(text)}
                                    />
                                    {errors.telefone && <Text style={styles.errorText}>{errors.telefone[0]}</Text>}
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
                                        mask="99999-990"
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
                                        placeholder="Complemento (opcional)"
                                        value={complemento}
                                        onChangeText={(text) => setComplemento(text)}
                                    />
                                    {errors.complemento && <Text style={styles.errorText}>{errors.complemento[0]}</Text>}
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
                                    Dados de Acesso
                                </Text>

                                <View style={styles.inputView}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        value={email}
                                        onChangeText={(text) => setEmail(text)}
                                    />
                                    {errors.email && <Text style={styles.errorText}>{errors.email[0]}</Text>}
                                </View>

                                <View style={styles.inputView}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Senha"
                                        secureTextEntry
                                        value={password}
                                        onChangeText={(text) => setPassword(text)}
                                    />
                                    {errors.password && <Text style={styles.errorText}>{errors.password[0]}</Text>}
                                </View>
                            </View>
                        )}

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                            {currentStep == 1 && (
                                <TouchableOpacity
                                    style={styles.buttonVoltar}
                                    onPress={backToLogin}
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
                                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                                    <Text style={styles.buttonText}>Cadastrar</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default RegisterScreen;