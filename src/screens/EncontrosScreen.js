import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function EncontrosScreen() {
  const region = {
    latitude: -18.922632, // Latitude da localização
    longitude: -48.296174, // Longitude da localização
    latitudeDelta: 0.01, // Controle do zoom no mapa (menores valores = mais próximo)
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bem-vindo à tela de Encontros!</Text>
    </View>
  );
};

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
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});