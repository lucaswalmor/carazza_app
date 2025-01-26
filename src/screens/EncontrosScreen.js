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
      <MapView style={styles.map} initialRegion={region}>
        <Marker
          provider={PROVIDER_GOOGLE}
          coordinate={{ latitude: region.latitude, longitude: region.longitude }}
          title="Minha Localização"
          description="Rua Izídio Antônio da Silva, 147, Uberlândia"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});