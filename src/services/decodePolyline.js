export default function decodePolyline (encoded) {
    let index = 0;
    const coordinates = [];
    let lat = 0, lng = 0;

    while (index < encoded.length) {
        let shift = 0, result = 0;
        let byte;

        // Decodifica latitude
        do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1F) << shift;
            shift += 5;
        } while (byte >= 0x20);

        let deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
        lat += deltaLat;

        // Decodifica longitude
        shift = 0;
        result = 0;

        do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1F) << shift;
            shift += 5;
        } while (byte >= 0x20);

        let deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
        lng += deltaLng;

        coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return coordinates;
};