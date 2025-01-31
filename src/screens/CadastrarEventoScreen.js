import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput, Alert, Linking, Switch, Button, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaskedTextInput } from 'react-native-mask-text';
import styles from '../assets/css/styles';
import api from '../services/api';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from 'react-native-vector-icons';

const CadastrarUsuarioScreen = ({ navigation }) => {
    const [nome, setNome] = useState('Encontro Nacional de Harley-Davidson 2024');
    const [local, setLocal] = useState('Autódromo de Interlagos - SP');
    const [descricao, setDescricao] = useState('Evento anual para entusiastas da marca');
    const [dataInicio, setDataInicio] = useState('01/05/2025');
    const [dataTermino, setDataTermino] = useState('03/05/2025');
    const [horaInicio, setHoraInicio] = useState('08:00');
    const [horaTermino, setHoraTermino] = useState('20:00');
    const [pathLogo, setPathLogo] = useState(null);
    const [pathBanner, setPathBanner] = useState(null);

    const [cep, setCep] = useState('38080-615');
    const [rua, setRua] = useState(null);
    const [bairro, setBairro] = useState(null);
    const [numero, setNumero] = useState('147');
    const [complemento, setComplemento] = useState(null);
    const [estado, setEstado] = useState(null);
    const [estadoCompleto, setEstadoCompleto] = useState(null);
    const [cidade, setCidade] = useState(null);

    const [nomeOrganizador, setNomeOrganizador] = useState('Lucas Steinbach');
    const [whatsapp, setWhatsapp] = useState('(34) 99202-1394');
    const [email, setEmail] = useState('lucaswsb52@gmail.com');
    const [instagram, setInstagram] = useState('@lucassteinbach');
    const [site, setSite] = useState('ivendas.com.br');
    const [contatoEmergencia, setContatoEmergencia] = useState('(34) 99202-1394');

    const [bolEntradaPaga, setBolEntradaPaga] = useState(false);
    const [valorEntrada, setValorEntrada] = useState(0);
    const [linkIngressos, setLinkIngressos] = useState('ivendas.com.br');
    const [lotacaoMaxima, setLotacaoMaxima] = useState(1000);
    const [regras, setRegras] = useState('Capacete obrigatório, documento da moto em dia');
    const [idadeMinima, setIdadeMinima] = useState(18);

    const [bolShowsMusicais, setBolShowsMusicais] = useState(true);
    const [bolFoodTruck, setBolFoodTruck] = useState(true);
    const [bolRotaPasseio, setBolRotaPasseio] = useState(true);
    const [enderecoInicioPasseio, setEnderecoInicioPasseio] = useState('Praça da Sé, 1');
    const [enderecoFimPasseio, setEnderecoFimPasseio] = useState('Autódromo de Interlagos');
    const [bolEstacionamento, setBolEstacionamento] = useState(true);
    const [bolEstacionamentoPago, setBolEstacionamentoPago] = useState(false);
    const [valorEstacionamento, setValorEstacionamento] = useState(0);


    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const [patrocinadores, setPatrocinadores] = useState([{ nome: '', instagram: '', path_logo: '' }]);

    const addPatrocinador = () => {
        if (patrocinadores.length < 5) {
            setPatrocinadores([...patrocinadores, { nome: '', instagram: '', path_logo: '' }]);
        }
    };

    // Função para atualizar os dados de um patrocinador específico
    const handlePatrocinadorChange = (index, field, value) => {
        const newPatrocinadores = [...patrocinadores];
        newPatrocinadores[index][field] = value;
        setPatrocinadores(newPatrocinadores);
    };

    // Função para pegar a imagem da galeria
    const pickImage = async (index) => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.granted) {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                const imageUri = result.uri || (result.assets && result.assets[0]?.uri);
                if (imageUri) {
                    setPatrocinadores((prevPatrocinadores) => {
                        const newPatrocinadores = [...prevPatrocinadores];
                        newPatrocinadores[index] = {
                            ...newPatrocinadores[index],
                            path_logo: imageUri,
                        };
                        return newPatrocinadores;
                    });
                } else {
                    console.warn('Nenhuma imagem válida retornada.');
                }
            }
        }
    };

    const handlePathBannerImageChange = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permissão para acessar a galeria é necessária!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [2, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPathBanner(result.assets[0].uri);
        }
    };

    const handlePathLogoImageChange = async () => {
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
            setPathLogo(result.assets[0].uri);
        }
    };

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

    const backToEventos = () => {
        navigation.navigate('Main', { screen: 'Tabs', params: { screen: 'Eventos' } });
    };

    const handleRegister = async () => {
        setIsLoading(true);

        const formData = new FormData();

        formData.append('nome', nome);
        formData.append('local', local);
        formData.append('descricao', descricao);
        formData.append('data_inicio', dataInicio);
        formData.append('data_termino', dataTermino);
        formData.append('horario_inicio', horaInicio);
        formData.append('horario_termino', horaTermino);

        formData.append('cep', cep);
        formData.append('rua', rua);
        formData.append('bairro', bairro);
        formData.append('numero', numero);
        formData.append('complemento', complemento);
        formData.append('estado', estado);
        formData.append('estado_completo', estadoCompleto);
        formData.append('cidade', cidade);

        formData.append('nome_organizador', nomeOrganizador);
        formData.append('whatsapp', whatsapp);
        formData.append('email_contato', email);
        formData.append('instagram', instagram);
        formData.append('site', site);
        formData.append('contato_emergencia', contatoEmergencia);

        formData.append('bol_entrada_paga', bolEntradaPaga);
        formData.append('valor_entrada', valorEntrada);
        formData.append('link_ingressos', linkIngressos);
        formData.append('lotacao_maxima', lotacaoMaxima);
        formData.append('regras', regras);
        formData.append('idade_minima', idadeMinima);

        formData.append('bol_shows_musicais', bolShowsMusicais);
        formData.append('bol_foodtrucks', bolFoodTruck);
        formData.append('bol_rota_passeio', bolRotaPasseio);
        formData.append('endereco_inicio_passeio', enderecoInicioPasseio);
        formData.append('endereco_fim_passeio', enderecoFimPasseio);
        formData.append('bol_estacionamento', bolEstacionamento);
        formData.append('bol_estacionamento_pago', bolEstacionamentoPago);
        formData.append('valor_estacionamento', valorEstacionamento);

        // Adicionar patrocinadores
        patrocinadores.forEach((patrocinador, index) => {
            formData.append(`patrocinadores_evento[${index}][nome]`, patrocinador.nome);
            formData.append(`patrocinadores_evento[${index}][instagram]`, patrocinador.instagram);

            if (patrocinador.path_logo) {
                const fileName = patrocinador.path_logo.split('/').pop();
                const fileType = fileName.split('.').pop();

                formData.append(`patrocinadores_evento[${index}][path_logo]`, {
                    uri: patrocinador.path_logo,
                    name: fileName,
                    type: `image/${fileType}`,
                });
            }
        });

        // Adicionar imagem ao FormData (se existir)
        if (pathBanner) {
            const fileName = pathBanner.split('/').pop();
            const fileType = fileName.split('.').pop();
            formData.append('path_banner', {
                uri: pathBanner,
                name: fileName,
                type: `image/${fileType}`,
            });
        }

        // Adicionar imagem ao FormData (se existir)
        if (pathLogo) {
            const fileName = pathLogo.split('/').pop();
            const fileType = fileName.split('.').pop();
            formData.append('path_logo', {
                uri: pathLogo,
                name: fileName,
                type: `image/${fileType}`,
            });
        }

        formData.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });

        try {
            const response = await api.post('/evento/store', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log(response.data);
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

                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <TouchableOpacity style={styles.imageBannerContainer} onPress={handlePathBannerImageChange}>
                                            {pathBanner ? (
                                                <Image source={{ uri: pathBanner }} style={styles.image} />
                                            ) : (
                                                <Text style={styles.imagePlaceholder}>Banner do Evento</Text>
                                            )}
                                        </TouchableOpacity>
                                        {errors.path_banner && <Text style={styles.errorText}>{errors.path_banner[0]}</Text>}
                                    </View>

                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <TouchableOpacity style={styles.imageContainer} onPress={handlePathLogoImageChange}>
                                            {pathLogo ? (
                                                <Image source={{ uri: pathLogo }} style={styles.image} />
                                            ) : (
                                                <Text style={styles.imagePlaceholder}>Logo do Evento</Text>
                                            )}
                                        </TouchableOpacity>
                                        {errors.path_logo && <Text style={styles.errorText}>{errors.path_logo[0]}</Text>}
                                    </View>

                                    <View style={styles.inputView}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Nome do Evento"
                                            value={nome}
                                            onChangeText={(text) => setNome(text)}
                                        />
                                        {errors.nome && <Text style={styles.errorText}>{errors.nome[0]}</Text>}
                                    </View>

                                    <View style={styles.inputView}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Local do evento"
                                            value={local}
                                            onChangeText={(text) => setLocal(text)}
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
                                        Organização do Evento
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

                                    <View style={styles.inputView}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Site (não obrigatório)"
                                            value={site}
                                            onChangeText={(text) => setSite(text)}
                                        />
                                        {errors.site && <Text style={styles.errorText}>{errors.site[0]}</Text>}
                                    </View>

                                    <View style={styles.inputView}>
                                        <MaskedTextInput
                                            mask="(99) 99999-9999"
                                            keyboardType="numeric"
                                            style={styles.input}
                                            value={contatoEmergencia}
                                            placeholder="Contato de Emergência (não obrigatório)"
                                            onChangeText={(text) => setContatoEmergencia(text)}
                                        />
                                        {errors.contato_emergencia && <Text style={styles.errorText}>{errors.contato_emergencia[0]}</Text>}
                                    </View>
                                </View>
                            )}

                            {currentStep === 4 && (
                                <View style={{ flex: 1 }}>
                                    <Text style={{ textAlign: 'center', margin: 20, fontSize: 16, fontWeight: 'bold' }}>
                                        Detalhes do Evento
                                    </Text>

                                    <View style={styles.inputView}>
                                        <TextInput
                                            keyboardType="numeric"
                                            style={styles.input}
                                            placeholder="Lotação Máxima (não obrigatório)"
                                            value={lotacaoMaxima}
                                            onChangeText={(text) => setLotacaoMaxima(text)}
                                        />
                                    </View>

                                    <TextInput
                                        style={styles.textArea}
                                        placeholder="Regras (não obrigatório)"
                                        multiline
                                        numberOfLines={4}
                                        value={regras}
                                        onChangeText={(text) => setRegras(text)}
                                    />

                                    <View style={styles.inputView}>
                                        <TextInput
                                            keyboardType="numeric"
                                            style={styles.input}
                                            placeholder="Idade Mínima (não obrigatório)"
                                            value={idadeMinima}
                                            onChangeText={(text) => setIdadeMinima(text)}
                                        />
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <Switch
                                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                                            thumbColor={bolShowsMusicais ? '#007BFF' : '#f4f3f4'}
                                            ios_backgroundColor="#3e3e3e"
                                            onValueChange={() => setBolShowsMusicais(previousState => !previousState)}
                                            value={bolShowsMusicais}
                                        />

                                        <Text>
                                            Show ao vivo ?
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <Switch
                                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                                            thumbColor={bolFoodTruck ? '#007BFF' : '#f4f3f4'}
                                            ios_backgroundColor="#3e3e3e"
                                            onValueChange={() => setBolFoodTruck(previousState => !previousState)}
                                            value={bolFoodTruck}
                                        />

                                        <Text>
                                            FoodTruck no local ?
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <Switch
                                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                                            thumbColor={bolEntradaPaga ? '#007BFF' : '#f4f3f4'}
                                            ios_backgroundColor="#3e3e3e"
                                            onValueChange={() => setBolEntradaPaga(previousState => !previousState)}
                                            value={bolEntradaPaga}
                                        />

                                        <Text>
                                            Entrada paga?
                                        </Text>
                                    </View>

                                    {bolEntradaPaga &&
                                        <>
                                            <View>
                                                <Text>
                                                    Valor da entrada
                                                </Text>
                                                <MaskedTextInput
                                                    type="currency"
                                                    options={{
                                                        prefix: 'R$ ',
                                                        decimalSeparator: '.',
                                                        groupSeparator: ',',
                                                        precision: 2
                                                    }}
                                                    value={valorEntrada}
                                                    onChangeText={(text) => setValorEntrada(text)}
                                                    style={styles.input}
                                                    keyboardType="numeric"
                                                />
                                            </View>

                                            <View style={styles.inputView}>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Site Ingresso (não obrigatório)"
                                                    value={linkIngressos}
                                                    onChangeText={(text) => setLinkIngressos(text)}
                                                />
                                            </View>
                                        </>
                                    }



                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <Switch
                                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                                            thumbColor={bolRotaPasseio ? '#007BFF' : '#f4f3f4'}
                                            ios_backgroundColor="#3e3e3e"
                                            onValueChange={() => setBolRotaPasseio(previousState => !previousState)}
                                            value={bolRotaPasseio}
                                        />

                                        <Text>
                                            Passeio de moto até o local?
                                        </Text>
                                    </View>

                                    {bolRotaPasseio &&
                                        <>
                                            <View style={styles.inputView}>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Endereço de início (obrigatório)"
                                                    value={enderecoInicioPasseio}
                                                    onChangeText={(text) => setEnderecoInicioPasseio(text)}
                                                />
                                            </View>
                                            <View style={styles.inputView}>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Endereço do destino (obrigatório)"
                                                    value={enderecoFimPasseio}
                                                    onChangeText={(text) => setEnderecoFimPasseio(text)}
                                                />
                                            </View>
                                        </>
                                    }

                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <Switch
                                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                                            thumbColor={bolEstacionamento ? '#007BFF' : '#f4f3f4'}
                                            ios_backgroundColor="#3e3e3e"
                                            onValueChange={() => setBolEstacionamento(previousState => !previousState)}
                                            value={bolEstacionamento}
                                        />

                                        <Text>
                                            Estacionamento para motos no local ?
                                        </Text>
                                    </View>

                                    {bolEstacionamento &&
                                        <>

                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                <Switch
                                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                                    thumbColor={bolEstacionamentoPago ? '#007BFF' : '#f4f3f4'}
                                                    ios_backgroundColor="#3e3e3e"
                                                    onValueChange={() => setBolEstacionamentoPago(previousState => !previousState)}
                                                    value={bolEstacionamentoPago}
                                                />

                                                <Text>
                                                    Estacionamento é pago ?
                                                </Text>
                                            </View>

                                            {bolEstacionamentoPago &&
                                                <>
                                                    <View>
                                                        <Text>
                                                            Valor do Estacionamento
                                                        </Text>
                                                        <MaskedTextInput
                                                            type="currency"
                                                            options={{
                                                                prefix: 'R$ ',
                                                                decimalSeparator: '.',
                                                                groupSeparator: ',',
                                                                precision: 2
                                                            }}
                                                            value={valorEstacionamento}
                                                            onChangeText={(text) => setValorEstacionamento(text)}
                                                            style={styles.input}
                                                            keyboardType="numeric"
                                                        />
                                                    </View>
                                                </>
                                            }
                                        </>
                                    }
                                </View>
                            )}

                            {currentStep === 5 && (
                                <View style={{ flex: 1 }}>
                                    <Text style={{ textAlign: 'center', margin: 20, fontSize: 16, fontWeight: 'bold' }}>
                                        Patrocinadores do Evento
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.buttonAddPatrocinador}
                                        onPress={addPatrocinador}
                                    >
                                        <Ionicons name="add" size={18} color="#fff" style={styles.icon} />
                                        <Text style={{ fontSize: 12, color: '#fff', fontWeight: 'bold' }}>Add Patrocinador</Text>
                                    </TouchableOpacity>

                                    {patrocinadores.map((patrocinador, index) => (
                                        <View key={index} style={styles.patrocinadorContainer}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Nome do Patrocinador"
                                                value={patrocinador.nome}
                                                onChangeText={(text) => handlePatrocinadorChange(index, 'nome', text)}
                                            />

                                            <TextInput
                                                style={styles.input}
                                                placeholder="Instagram do Patrocinador"
                                                value={patrocinador.instagram}
                                                onChangeText={(text) => handlePatrocinadorChange(index, 'instagram', text)}
                                            />

                                            <TouchableOpacity
                                                style={styles.buttonSelectImage}
                                                onPress={() => pickImage(index)}
                                            >
                                                <Text style={styles.buttonText}>Escolher logo</Text>
                                            </TouchableOpacity>

                                            {/* {patrocinador.path_logo ? (
                                                <Image source={{ uri: patrocinador.path_logo }} style={styles.image} />
                                            ) : null} */}
                                        </View>
                                    ))}
                                </View>
                            )}

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                                {currentStep == 1 && (
                                    <TouchableOpacity
                                        style={styles.buttonVoltar}
                                        onPress={backToEventos}
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
                                {currentStep < 5 ? (
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

export default CadastrarUsuarioScreen;