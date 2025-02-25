import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, Alert } from 'react-native';
import styles from '../assets/css/styles';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import { borders, colors, display, fontSize, fontWeights, gap, paddings, widths } from '../assets/css/primeflex';
import Toast from '../components/Toast';
import { FontAwesome5 } from '@expo/vector-icons';

export default function DesafioListScreen({ navigation, route }) {
  const { desafio } = route.params;
  const [user, setUser] = useState({});
  const [desafios, setDesafios] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', position: 'bottom', severity: '' });

  useFocusEffect(
    useCallback(() => {
      getDesafiosPorTipo();
    }, [])
  );

  useEffect(() => {
    getUser();
  }, [])

  const navigateToDesafio = (id) => {
    navigation.navigate('DetalhesDesafioScreen', { id: id });
  };

  const getUser = async () => {
    const user = await AsyncStorage.getItem('user');

    if (user) {
      setUser(JSON.parse(user))
    }
  }

  const getDesafiosPorTipo = async () => {
    const token = await AsyncStorage.getItem('token');

    try {
      setIsLoading(true);
      const response = await api.get(`/desafio/index/${desafio}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setDesafios(response.data)
    } catch (error) {
      console.error('Erro ao enviar o formulário:', error);
    } finally {
      setIsLoading(false)
    }
  }

  const refreshDesafios = async () => {
    setIsRefreshing(true);
    await getDesafiosPorTipo();
    setIsRefreshing(false);
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1d1e22" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 150 }}>
      <ScrollView
        style={{ flex: 1, padding: 10 }}
        contentContainerStyle={{ paddingBottom: 200 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refreshDesafios} />
        }
      >
        {desafios && desafios.length > 0 ? (
          <>
            {desafios.map((desafio) => (
              <TouchableOpacity
                key={desafio.id ?? `desafio-${index}`}
                onPress={() => navigateToDesafio(desafio.id)}
              >
                <Card
                  content={
                    <View style={[display.row, display.justifyContentBetween, display.alignItemsCenter]}>
                      <Text style={[{ color: colors.blue[500] }, fontWeights['bold'], fontSize['xl']]}>{desafio.nome}</Text>
                      <FontAwesome5 name="arrow-right" size={20} style={[{ color: colors.blue[500], marginRight: 8 }]} />
                    </View>
                  }
                />
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <Text style={{backgroundColor: colors.gray[200], fontStyle: 'italic', padding: 10, textAlign: 'center'}}>
            No momento não há desafios disponíveis
          </Text>
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
    </SafeAreaView>
  );
}