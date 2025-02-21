import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '../components/Card';
import { colors, display, fontSize, fontWeights } from '../assets/css/primeflex';
import { FontAwesome5 } from '@expo/vector-icons';

export default function MeusDesafiosScreen({ navigation }) {
  const [desafios, setDesafios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    getDesafios();
  }, [])

  const getDesafios = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');

    try {
      const response = await api.get('/user/desafios', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setDesafios(response.data)
    } catch (error) {
      console.log(error.response.data)
    } finally {
      setIsLoading(false);
    }
  }

  const navigateToDesafio = (id) => {
    navigation.navigate('DetalhesDesafioScreen', { id: id });
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1d1e22" />
      </View>
    );
  }

  const refreshDesafios = async () => {
    setIsRefreshing(true);
    await getDesafiosPorTipo();
    setIsRefreshing(false);
  };

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
        {desafios.map((desafio) => (
          <TouchableOpacity
            onPress={() => navigateToDesafio(desafio.desafio_id)}
          >
            <Card
              key={desafio.id}
              content={
                <View style={[display.row, display.justifyContentBetween, display.alignItemsCenter]}>
                  <Text style={[{ color: colors.blue[500] }, fontWeights['bold'], fontSize['xl']]}>{desafio.desafio_nome}</Text>
                  <FontAwesome5 name="arrow-right" size={20} style={[{ color: colors.blue[500], marginRight: 8 }]} />
                </View>
              }
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});