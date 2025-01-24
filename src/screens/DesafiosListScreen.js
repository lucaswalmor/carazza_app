import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MapScreen({ routeData }) {

  return (
    <View style={styles.container}>
      <Text>Bem vindo a tela de Desafios</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
