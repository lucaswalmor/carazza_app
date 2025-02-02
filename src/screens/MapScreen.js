import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function EncontrosScreen() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: -23.561684,
          longitude: -46.655981,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        zoomEnabled={true}
        showsUserLocation={true}
      >
        <Marker
          coordinate={{ latitude: -23.561684, longitude: -46.655981 }}
          title={"Avenida Paulista"}
          description={"Ponto inicial no coração de São Paulo!"}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    height: '100%'
  },
});
