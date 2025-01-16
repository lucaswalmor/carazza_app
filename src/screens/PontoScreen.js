import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

const PointsScreen = ({ navigation }) => {
    const [playing, setPlaying] = useState(false);
    const handleLogout = () => {
        navigation.replace('Login');
    };

    const CadastrarPonto = () => {
        navigation.replace('CadastrarPonto');
    };

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                <View style={{ padding: 10, width: '100%' }}>
                    <TouchableOpacity style={styles.button} onPress={CadastrarPonto}>
                        <Text style={styles.buttonText}>Cadastrar Point</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    <TouchableOpacity style={styles.button} onPress={handleLogout}>
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        
            {/* <View style={{ flex: 1, padding: 10 }}>
                <YoutubePlayer
                    height={200}
                    play={true}
                    videoId="XVstIx75NS8"
                    onChangeState={(state) => console.log(state)}
                />
            </View> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    button: {
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },
});

export default PointsScreen;
