import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../services/api';
import styles from '../assets/css/styles';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import Toast from '../components/Toast';

export default function EncontroScreen({ route }) {
  const { id } = route.params;
  const [encontro, setEncontro] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', position: 'bottom', severity: '' });

  useEffect(() => {
    fetchEncontro();
  }, []);

  const fetchEncontro = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');

    try {
      const response = await api.get(`/encontro/show/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setEncontro(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const localizacaoEncontro = async () => {
    Linking.openURL(encontro?.localizacao_local);
  };

  const confirmPresenca = async () => {
    Alert.alert(
      'Gostaria de confirmar presença neste encontro?',
      'Ao confirmar presença neste encontro você entrará na lista de presenças confirmadas',
      [
        { text: 'Cancelar', onPress: () => { }, style: 'cancel' },
        { text: 'OK', onPress: () => handleConfirm() },
      ],
      { cancelable: true }
    );
  }

  const showToast = (message, position, severity) => {
    setToast({ visible: true, message, position, severity });

    // Esconde o toast após 3 segundos
    setTimeout(() => setToast({ ...toast, visible: false }), 3000);
  };

  const handleConfirm = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const response = await api.get(`/encontro/confirmar-presenca/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      showToast(response.data.message, 'top', 'success')
      fetchEncontro();
    } catch (error) {
      showToast(error.response.data.error, 'top', 'danger')
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {isLoading ? (
          <>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ActivityIndicator size="large" color="#007BFF" />
            </View>
          </>
        ) : (
          <>
            {/* Card 1: Nome do encontro */}
            <View style={[styles.card, { gap: 10, alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={styles.infoTitle}>
                {encontro?.nome}
              </Text>
            </View>

            {/* Card 2: Datas e horários */}
            <View style={styles.card}>
              <Text style={styles.infoTitle}>Datas e Horários</Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.infoLabel}>Data de início:</Text>
                  <Text style={styles.infoText}>{encontro?.data_inicio}</Text>
                </View>
                <View>
                  <Text style={styles.infoLabel}>Data de Término:</Text>
                  <Text style={styles.infoText}>{encontro?.data_termino}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.infoLabel}>Horários do encontro</Text>
                <Text style={styles.infoText}>
                  {encontro?.horario_inicio} às {encontro?.horario_termino}
                </Text>
              </View>
            </View>

            {/* Card 3: Detalhes do encontro */}
            <View style={styles.card}>
              <Text style={styles.infoTitle}>Detalhes do Encontro</Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.infoLabel}>Descrição:</Text>
                  <Text style={styles.infoText}>
                    {encontro?.descricao}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.infoLabel}>Regras:</Text>
                  <Text style={styles.infoText}>
                    {encontro?.regras}
                  </Text>
                </View>
              </View>
            </View>

            {/* Card 4: Outros */}
            <View style={styles.card}>
              <Text style={styles.infoTitle}>Organização</Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.infoLabel}>Nome do organizador:</Text>
                  <Text style={styles.infoText}>
                    {encontro?.nome_organizador}
                  </Text>
                </View>

                <View>
                  <Text style={styles.infoLabel}>Whatsapp:</Text>
                  <Text style={styles.infoText}>
                    {encontro?.whatsapp}
                  </Text>
                </View>
              </View>

              <View>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoText}>
                  {encontro?.email_contato}
                </Text>
              </View>

              <View>
                <Text style={styles.infoLabel}>Instagram:</Text>
                <Text style={styles.infoText}>
                  {encontro?.instagram}
                </Text>
              </View>
            </View>

            {/* Card 6: Rota de passeio */}
            <View style={styles.card}>
              <View>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { flexDirection: 'row', marginBottom: 20 },
                  ]}
                  onPress={localizacaoEncontro}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.buttonText}>Abrir no Google Maps</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Card 8: Participação */}
            <View style={[styles.card, { marginBottom: 100 }]}>
              <TouchableOpacity
                style={[
                  styles.button,
                  { flexDirection: 'row', marginBottom: 20 },
                ]}
                onPress={confirmPresenca}>
                <FontAwesome5 name="user-check" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Confirmar Presença</Text>
              </TouchableOpacity>

              <Text style={[styles.infoTitle, { textAlign: 'center' }]}>List de Presenças Confirmadas</Text>


              {encontro?.participantes && encontro.participantes.length > 0 ? (
                <View style={{ marginTop: 20 }}>
                  {encontro.participantes.map((participante) => (
                    <TouchableOpacity
                      key={participante.id}
                      onPress={() => Alert.alert('Participante', participante.apelido)}
                      style={{ marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 10, borderRadius: 10 }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                          source={{ uri: participante.img_perfil }}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 20,
                            marginRight: 10,
                          }}
                        />
                        <Text style={{ fontWeight: 'bold' }}>
                          {participante.apelido}
                        </Text>
                      </View>
                      <FontAwesome5 name="eye" size={18} color="#007BFF" style={{ marginRight: 8 }} />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={{ textAlign: 'center', padding: 10, backgroundColor: '#f5f5f5', fontStyle: 'italic', marginTop: 10 }}>Ainda não hà presenças confirmadas.</Text>
              )}
            </View>
          </>
        )}
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
}
