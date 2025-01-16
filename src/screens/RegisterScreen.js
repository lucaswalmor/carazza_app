import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import ProgressSteps, { Title, Content, ProgressStep } from '@joaosousa/react-native-progress-steps';
import FormDadosPessoas from '../components/forms/user/FormDadosPessoais'
import FormEndereco from '../components/forms/user/FormEndereco'
import PaymentScreen from './PaymentScreen';
import FormDadosLogin from '../components/forms/user/FormDadosLogin'
import { handleIntegration } from '../utils/MercadoPago';
import { openBrowserAsync } from 'expo-web-browser';

const RegisterScreen = ({ navigation }) => {
    const [profileImage, setProfileImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [dados, setDados] = useState({});
    const [step, setStep] = useState(0);

    const handleInputChange = (key, value) => {
        if (key === 'cep' && value.length === 9) {
            pesquisacep(value);
        } else {
            setDados((prevState) => ({
                ...prevState,
                [key]: value,
            }));
        }
    };

    const handleProfileImageChange = (imageUri) => {
        setProfileImage(imageUri);
    };

    const pesquisacep = async (valor) => {
        const cep = valor.replace(/\D/g, '');

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            setDados((prevState) => ({
                ...prevState,
                cep: data.cep,
                rua: data.logradouro || '',
                bairro: data.bairro || '',
                cidade: data.localidade || '',
                estado: data.uf || '',
            }));
        } catch (error) {
            console.error('Erro ao buscar o CEP:', error);
        }
    };

    const handlePayment = async () => {
        console.log(dados)
        const data = await handleIntegration(dados.email);
        console.log(data)

        if (!data) {
            console.log('Erro ao criar plano');
            return;
        }
    
        const subscriptionId = data.id; // ID da assinatura
        const customerData = {
            name: dados.name,
            email: dados.email,
            subscriptionId,
        };

        const url = `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=${data}`;
        await openBrowserAsync(url);
    };

    const handleRegister = async () => {
        console.log(dados)
        // const formData = new FormData();

        // Object.keys(dados).forEach((key) => {
        //     formData.append(key, dados[key]);
        // });

        // // Adicionar imagem ao FormData
        // if (profileImage) {
        //     const fileName = profileImage.split('/').pop();
        //     const fileType = fileName.split('.').pop();
        //     formData.append('imagem', {
        //         uri: profileImage,
        //         name: fileName,
        //         type: `image/${fileType}`,
        //     });
        // }

        // api.post('/user/store', formData, {
        //     headers: {
        //         'Content-Type': 'multipart/form-data',
        //     },
        // }).then(res => {
        //     console.log(res)
        // }).catch(err => {
        //     if (err.response && err.response.data) {
        //         console.log('Erros de validação:', err.response.data.errors);
        //         setErrors(err.response.data.errors);
        //     } else {
        //         console.log('Erro:', err.message);
        //     }
        // })
    };

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
                <ProgressSteps
                    currentStep={step}
                    orientation="horizontal"
                    steps={[
                        {
                            id: 1,
                            title: <Title>Dados Pessoais</Title>,
                            content: <Content>
                                <FormDadosPessoas
                                    dados={dados}
                                    onInputChange={handleInputChange}
                                    handleProfileImageChange={handleProfileImageChange}
                                />

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                                    <TouchableOpacity style={styles.buttonVoltar} onPress={() => backToLogin()}>
                                        <Text style={styles.buttonText}>Voltar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.button} onPress={() => setStep(1)}>
                                        <Text style={styles.buttonText}>Próximo</Text>
                                    </TouchableOpacity>
                                </View>
                            </Content>,
                        },
                        {
                            id: 2,
                            title: <Title>Endereço</Title>,
                            content: <Content>
                                <FormEndereco
                                    dados={dados}
                                    onInputChange={handleInputChange}
                                />

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                                    <TouchableOpacity style={styles.buttonVoltar} onPress={() => setStep(0)}>
                                        <Text style={styles.buttonText}>Voltar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
                                        <Text style={styles.buttonText}>Próximo</Text>
                                    </TouchableOpacity>
                                </View>
                            </Content>,
                        },
                        {
                            id: 3,
                            title: <Title>Login</Title>,
                            content: <Content>
                                <View>
                                    <FormDadosLogin
                                        dados={dados}
                                        onInputChange={handleInputChange}
                                    />

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                                        <TouchableOpacity style={styles.buttonVoltar} onPress={() => setStep(1)}>
                                            <Text style={styles.buttonText}>Voltar</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.button} onPress={() => handlePayment()}>
                                            <Text style={styles.buttonText}>Finalizar Cadastro</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Content>,
                        },
                    ]}
                    colors={{
                        title: {
                            text: {
                                normal: '#66b0ff',
                                active: '#007bff',
                                completed: '#007bff',
                            },
                        },
                        marker: {
                            text: {
                                normal: '#66b0ff',
                                active: '#007bff',
                                completed: '#f4f3ee',
                            },
                            line: {
                                normal: '#66b0ff',
                                active: '#007bff',
                                completed: '#007bff',
                            },
                        },
                    }}
                />
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

export default RegisterScreen;
