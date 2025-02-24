import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import logo from '../assets/img/logo3.png';

const Loader = () => {
    const rotate = useSharedValue(0);

    useFocusEffect(
        useCallback(() => {
            // Resetar o valor para garantir que reinicie sempre
            rotate.value = 0;
            rotate.value = withRepeat(withTiming(360, { duration: 2000 }), -1, false);

            return () => {
                rotate.value = 0;
            };
        }, [])
    );

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotate.value}deg` }], // Corrigido para `rotate` ao invés de `rotateY`
    }));

    return (
        <View style={styles.container}>
            <Animated.Image source={logo} style={[styles.image, animatedStyle]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
});

export default Loader;
