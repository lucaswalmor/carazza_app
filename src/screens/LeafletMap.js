import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const LeafletMap = ({
    initialPosition = [-23.5505, -46.6333], // São Paulo
    zoomLevel = 13,
    markerPosition = [-23.5505, -46.6333],
    style = {},
}) => {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
            <head>
                <link 
                    rel="stylesheet" 
                    href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
                    integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
                    crossorigin=""
                />
                <style>
                    #map { height: 100%; width: 100%; }
                    body { margin: 0; padding: 0; }
                </style>
            </head>
            <body>
                <div id="map"></div>
                
                <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
                integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
                crossorigin=""></script>
                
                <script>
                const map = L.map('map').setView([${initialPosition}], ${zoomLevel});
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);

                L.marker([${markerPosition}]).addTo(map)
                    .bindPopup('Localização selecionada');
                </script>
            </body>
        </html>
  `;

    return (
        <View style={[styles.container, style]}>
            <WebView
                source={{ html: htmlContent }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
                mixedContentMode="always"
                style={styles.webview}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 400,
        width: '100%',
    },
    webview: {
        flex: 1,
    },
});

export default LeafletMap;