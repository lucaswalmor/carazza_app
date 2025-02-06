import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import Accordion from "../components/Accordion";
import { useState } from "react";
import Toast from "../components/Toast";
import api from "../services/api";
import styles from "../assets/css/styles";
import Botao from "../components/Botao";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdminScreen({ }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [toast, setToast] = useState({ visible: false, message: '', position: 'top', severity: '' });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const enviarNotificacao = async () => {
        const token = await AsyncStorage.getItem('token');

        setIsLoading(true)
        try {
            const response = await api.post('/notificacoes/admin/criar', { message: message }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })

            showToast(response.data.message, 'top', 'success')
        } catch (error) {
            showToast(error.response.data.error, 'top', 'danger')
        } finally {
            setIsLoading(false)
        }
    }

    const showToast = (message, position, severity) => {
        setToast({ visible: true, message, position, severity });

        // Esconde o toast após 3 segundos
        setTimeout(() => setToast({ ...toast, visible: false }), 3000);
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ padding: 20 }}>
                <View style={{ flex: 1 }}>
                    <Accordion title="Notificações" index={0} activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
                        <View style={styles.inputView}>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Mensagem"
                                multiline
                                numberOfLines={4}
                                value={message}
                                onChangeText={(text) => setMessage(text)}
                            />
                        </View>

                        <Botao severity="success" onPress={enviarNotificacao}>
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
                                <Text style={styles.buttonText}>Enviar notificação</Text>
                            )}
                        </Botao>
                    </Accordion>
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
    )
}