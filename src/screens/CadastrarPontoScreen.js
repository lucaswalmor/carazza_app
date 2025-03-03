import React, { useState } from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    ActivityIndicator,
    Image,
    Alert
} from 'react-native';
import { MaskedTextInput } from "react-native-mask-text";
import styles from '../assets/css/styles';
import pesquisacep from '../services/viacep';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function CadastrarPontoScreen({ navigation }) {
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [images, setImages] = useState([]);
    const [video, setVideo] = useState(null);
    const [form, setForm] = useState({
        nome: '',
        cep: '',
        rua: '',
        bairro: '',
        numero: '',
        cidade: '',
        estado: '',
        estado_completo: '',
        valorMinAlimentacao: '',
        valorMaxAlimentacao: '',
        valorMinHospedagem: '',
        valorMaxHospedagem: '',
        descricao: '',
        informacoesComplementares: '',
        horaAbertura: '',
        horaFechamento: '',
    });

    const isDisabled = images.length >= 3;

    const handleInputChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const handleSubmit = async () => {
        const token = await AsyncStorage.getItem('token');
        const formData = new FormData();

        // Adicione os dados do formulário
        Object.keys(form).forEach((key) => {
            formData.append(key, form[key]);
        });

        // Adicione as imagens ao FormData
        images.forEach((imageUri, index) => {
            const filename = imageUri.split('/').pop();
            const ext = filename.split('.').pop();
            const type = `image/${ext}`;

            formData.append(`images[${index}]`, {
                uri: imageUri,
                name: filename,
                type,
            });
        });

        if (video) {
            const videoFilename = video.uri.split('/').pop();
            const videoExt = videoFilename.split('.').pop();

            formData.append('video', {
                uri: video.uri,
                name: `video.${videoExt}`,
                type: `video/${videoExt}`,
            });
        }

        try {
            setIsLoading(true);
            const response = await api.post('/ponto/store', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            Alert.alert(response.data.message)

            setForm({
                nome: '',
                cep: '',
                rua: '',
                cidade: '',
                bairro: '',
                estado: '',
                estado_completo: '',
                numero: '',
                descricao: '',
                valorMinAlimentacao: '',
                valorMaxAlimentacao: '',
                valorMinHospedagem: '',
                valorMaxHospedagem: '',
                informacoesComplementares: '',
                horaAbertura: '',
                horaFechamento: '',
            });
            setImages([]);
            setVideo(null);
        } catch (error) {
            console.log('Erro:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeImage = (index) => {
        setImages(prevState => prevState.filter((_, i) => i !== index));
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert('Permissão para acessar a galeria é necessária!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: false,
            quality: 0.7,
        });

        if (!result.canceled) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    const removeVideo = () => {
        setVideo(null);
    };

    const pickVideo = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert('Permissão para acessar a galeria é necessária!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setVideo(result.assets[0]);
        }
    };

    const handleCep = async (cep) => {
        if (cep.length != 9) return;

        const data = await pesquisacep(cep);

        if (data.erro) {
            Alert.alert('Erro', 'CEP não encontrado.');
        } else {
            setForm({
                ...form,
                rua: data.logradouro,
                bairro: data.bairro,
                estado: data.uf,
                estado_completo: data.estado,
                cidade: data.localidade,
                cep: cep,
            });
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Nome do local"
                value={form.nome}
                onChangeText={(text) => handleInputChange('nome', text)}
            />

            <View style={styles.inputView}>
                <MaskedTextInput
                    mask="99999-999"
                    keyboardType="numeric"
                    onChangeText={(text) => handleCep(text)}
                    style={styles.input}
                    value={form.cep}
                    placeholder='CEP'
                />

                {errors.cep && <Text style={styles.errorText}>{errors.cep[0]}</Text>}
            </View>

            <View style={styles.inputView}>
                <TextInput
                    style={styles.input}
                    placeholder="Rua"
                    value={form.rua}
                    onChangeText={(text) => handleInputChange('rua', text)}
                />
                {errors.rua && <Text style={styles.errorText}>{errors.rua[0]}</Text>}
            </View>

            <View style={styles.inputView}>
                <TextInput
                    style={styles.input}
                    placeholder="Bairro"
                    value={form.bairro}
                    onChangeText={(text) => handleInputChange('bairro', text)}
                />
                {errors.bairro && <Text style={styles.errorText}>{errors.bairro[0]}</Text>}
            </View>

            <View style={styles.inputView}>
                <TextInput
                    style={styles.input}
                    placeholder="Número"
                    value={form.numero}
                    onChangeText={(text) => handleInputChange('numero', text)}
                />
                {errors.numero && <Text style={styles.errorText}>{errors.numero[0]}</Text>}
            </View>

            <View style={styles.inputView}>
                <TextInput
                    style={styles.input}
                    placeholder="Cidade"
                    value={form.cidade}
                    onChangeText={(text) => handleInputChange('cidade', text)}
                />
                {errors.cidade && <Text style={styles.errorText}>{errors.cidade[0]}</Text>}
            </View>

            <View style={styles.inputView}>
                <TextInput
                    style={styles.input}
                    placeholder="Estado"
                    value={form.estado}
                    onChangeText={(text) => handleInputChange('estado', text)}
                />
                {errors.estado && <Text style={styles.errorText}>{errors.estado[0]}</Text>}
            </View>

            <View>
                <Text>
                    Mínimo Alimentação
                </Text>
                <MaskedTextInput
                    type="currency"
                    options={{
                        prefix: 'R$ ',
                        decimalSeparator: '.',
                        groupSeparator: ',',
                        precision: 2
                    }}
                    onChangeText={(text) => handleInputChange('valorMinAlimentacao', text)}
                    style={styles.input}
                    keyboardType="numeric"
                />
            </View>

            <View>
                <Text>
                    Máximo Alimentação
                </Text>
                <MaskedTextInput
                    type="currency"
                    options={{
                        prefix: 'R$ ',
                        decimalSeparator: '.',
                        groupSeparator: ',',
                        precision: 2
                    }}
                    onChangeText={(text) => handleInputChange('valorMaxAlimentacao', text)}
                    style={styles.input}
                    keyboardType="numeric"
                />
            </View>

            <View>
                <Text>
                    Mínimo Hospedagem
                </Text>
                <MaskedTextInput
                    type="currency"
                    options={{
                        prefix: 'R$ ',
                        decimalSeparator: '.',
                        groupSeparator: ',',
                        precision: 2
                    }}
                    onChangeText={(text) => handleInputChange('valorMinHospedagem', text)}
                    style={styles.input}
                    keyboardType="numeric"
                />
            </View>

            <View>
                <Text>
                    Máximo Hospedagem
                </Text>
                <MaskedTextInput
                    type="currency"
                    options={{
                        prefix: 'R$ ',
                        decimalSeparator: '.',
                        groupSeparator: ',',
                        precision: 2
                    }}
                    onChangeText={(text) => handleInputChange('valorMaxHospedagem', text)}
                    style={styles.input}
                    keyboardType="numeric"
                />
            </View>

            <TextInput
                style={styles.textArea}
                placeholder="Descrição do local"
                multiline
                numberOfLines={4}
                value={form.descricao}
                onChangeText={(text) => handleInputChange('descricao', text)}
            />

            <TextInput
                style={styles.textArea}
                placeholder="Informações complementares"
                multiline
                numberOfLines={4}
                value={form.informacoesComplementares}
                onChangeText={(text) => handleInputChange('informacoesComplementares', text)}
            />

            <MaskedTextInput
                mask="99:99"
                keyboardType="numeric"
                onChangeText={(text) => handleInputChange('horaAbertura', text)}
                style={styles.input}
                value={form.horaAbertura}
                placeholder='Hora Abertura'
            />

            <MaskedTextInput
                mask="99:99"
                keyboardType="numeric"
                onChangeText={(text) => handleInputChange('horaFechamento', text)}
                style={styles.input}
                value={form.horaFechamento}
                placeholder='Hora Fechamento'
            />

            <TouchableOpacity
                style={styles.buttonSelectImage}
                onPress={pickVideo}
            >
                <Ionicons name="videocam-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Selecionar Vídeo</Text>
            </TouchableOpacity>

            {video ? (
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#f0f0f0',
                        borderRadius: 8,
                        padding: 10,
                        marginTop: 10,
                    }}
                >
                    <Text style={{ flex: 1, color: '#333' }}>
                        {video.name || 'video.mp4'}
                    </Text>

                    <TouchableOpacity
                        style={{
                            backgroundColor: 'red',
                            padding: 5,
                            borderRadius: 5,
                            marginLeft: 10,
                        }}
                        onPress={removeVideo}
                    >
                        <Ionicons name="trash-outline" size={26} color="white" />
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={{ color: 'gray', fontStyle: 'italic', marginTop: 10, marginBottom: 20 }}>
                    Nenhum vídeo selecionado  (Max: 1 vídeo)
                </Text>
            )}

            <TouchableOpacity
                style={[styles.buttonSelectImage, isDisabled && { backgroundColor: '#ccc' }]}
                onPress={pickImage}
                disabled={isDisabled}
            >
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Fotos do Local</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10, gap: 10 }}>
                {images.length > 0 ? images.map((uri, index) => (
                    <View key={index} style={{ position: 'relative' }}>
                        <Image
                            source={{ uri }}
                            style={{ width: 90, height: 90, marginRight: 10, borderRadius: 10 }}
                            onError={() => console.log('Error loading image')}
                        />
                        <TouchableOpacity
                            style={{ position: 'absolute', top: 5, right: 15, backgroundColor: 'red', padding: 5, borderRadius: 5 }}
                            onPress={() => removeImage(index)}
                        >
                            <Text style={{ color: 'white', fontSize: 10 }}>X</Text>
                        </TouchableOpacity>
                    </View>
                )) : (
                    <Text style={{ textAlign: 'center', color: 'gray', fontStyle: 'italic' }}>Nenhuma imagem selecionada (Max: 3 imagems)</Text>
                )}
            </View>

            <View style={{ flex: 1, marginBottom: 50 }}>
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        {isLoading ? (
                            <>
                                <ActivityIndicator style={{ marginRight: 10 }} size="small" color="#fff" />
                                <Text style={styles.buttonText}>Finalizando cadastro</Text>
                            </>
                        ) : (
                            <Text style={styles.buttonText}>Cadastrar</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}