import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function EventosScreen() {
    const [screenView, setScreenView] = useState('encontros')

    const buttonScreenView = async () => {
        
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerButtons}>
                <TouchableOpacity
                    style={[styles.button, styles.buttonEventos]}
                    onPress={() => console.log('Lista de eventos')}
                >
                    <MaterialIcons name="calendar-month" size={22} color="white" />
                    <Text style={styles.buttonText}>Eventos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.buttonEncontros]}
                    onPress={() => console.log('Lista de encontros')}
                >
                    <MaterialIcons name="location-on" size={22} color="white" />
                    <Text style={styles.buttonText}>Encontros</Text>
                </TouchableOpacity>
            </View>

            <View style={{ marginTop: 20, padding: 10 }}>
                <Text>teste</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerButtons: {
        flexDirection: 'row',
    },
    button: {
        padding: 15,
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 10
    },
    buttonEventos: {
        backgroundColor: '#4CAF50',
    },
    buttonEncontros: {
        backgroundColor: '#2196F3',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20
    },
});