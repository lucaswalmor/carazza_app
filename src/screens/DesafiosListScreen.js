import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MapScreen() {
  const apiKey = 'AIzaSyB2PKyiPLwysX53zSFx7Vv2wgIFb88oTL4';
  const originLatitude = -18.8934049;
  const originLongitude = -48.2936802;
  const destinationLatitude = -18.9127608;
  const destinationLongitude = -48.2753807;

  // HTML com a Google Maps JavaScript API
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        #map {
          height: 100%;
          width: 100%;
        }
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
        }
      </style>
      <script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}"></script>
      <script>
        function initMap() {
          const origin = { lat: ${originLatitude}, lng: ${originLongitude} };
          const destination = { lat: ${destinationLatitude}, lng: ${destinationLongitude} };

          const map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: origin,
          });

          const directionsService = new google.maps.DirectionsService();
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: false,
          });

          directionsService.route(
            {
              origin: origin,
              destination: destination,
              travelMode: 'DRIVING',
            },
            (response, status) => {
              if (status === 'OK') {
                directionsRenderer.setDirections(response);
              } else {
                console.error('Directions request failed due to ' + status);
              }
            }
          );
        }
      </script>
    </head>
    <body onload="initMap()">
      <div id="map"></div>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
