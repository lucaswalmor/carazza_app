import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export default function MapScreen({ routeData }) {

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bem-vindo à tela de Desafios!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
