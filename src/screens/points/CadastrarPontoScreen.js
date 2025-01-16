import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    ActivityIndicator
} from 'react-native';

import { MaskedTextInput } from "react-native-mask-text";
import { Button, Dialog, Portal, Snackbar } from 'react-native-paper';

const CadastrarPonto = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [form, setForm] = useState({
        nome: '',
        endereco: '',
        descricao: '',
        valorMinAlimentacao: '',
        valorMaxAlimentacao: '',
        valorMinHospedagem: '',
        valorMaxHospedagem: '',
        informacoes: '',
        linkVideo: '',
        horaAbertura: '',
        horaFechamento: '',
    });

    const hideDialog = () => setVisible(false);

    const handleInputChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const handleSubmit = () => {
        try {
            setIsLoading(true);
            setVisible(!visible)
            console.log('Formulário submetido:', form);
        } catch (error) {
            console.error("Erro ao enviar o formulário:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const voltar = () => {
        navigation.replace('Main');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>

            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog} theme={{ colors: { primary: 'green' } }}>
                    <Dialog.Title>Sucesso!</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">Este Ponto foi cadastrado com sucesso!</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>Done</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <TextInput
                style={styles.input}
                placeholder="Nome do local"
                value={form.nome}
                onChangeText={(text) => handleInputChange('nome', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Endereço do local"
                value={form.endereco}
                onChangeText={(text) => handleInputChange('endereco', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Descrição do local"
                value={form.descricao}
                onChangeText={(text) => handleInputChange('descricao', text)}
            />

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
                placeholder="Informações complementares"
                multiline
                numberOfLines={4}
                value={form.informacoes}
                onChangeText={(text) => handleInputChange('informacoes', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Id do vídeo"
                value={form.linkVideo}
                onChangeText={(text) => handleInputChange('linkVideo', text)}
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

            <View>
                <TouchableOpacity style={styles.buttonVoltar} onPress={voltar}>
                    <Text style={styles.buttonText}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        {isLoading ? ( // Condição para verificar se está carregando
                            <>
                                <ActivityIndicator style={{ marginRight: 10 }} size="small" color="#fff" />
                                <Text style={styles.buttonText}>Finalizando cadastro</Text>
                            </>
                        ) : (
                            <Text style={styles.buttonText}>Cadastrar</Text>  // Caso não esteja carregando
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#007BFF',
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        borderBottomWidth: 2,
        borderBottomColor: '#007BFF',
        borderWidth: 0,
    },
    textArea: {
        height: 80,
        borderBottomWidth: 2,
        borderBottomColor: '#007BFF',
        borderColor: '#007BFF',
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        textAlignVertical: 'top',
    },
    button: {
        height: 50,
        backgroundColor: '#007BFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10,
    },
    buttonVoltar: {
        height: 50,
        backgroundColor: '#6c757d',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CadastrarPonto;
