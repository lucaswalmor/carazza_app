import React from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { borders } from '../assets/css/primeflex';
import { FontAwesome5 } from '@expo/vector-icons';

const Accordion = ({ title, children, index, activeIndex, setActiveIndex, backgroundColor = '#007BFF', textColor = '#fff' }) => {
    const toggleAccordion = () => {
        if (activeIndex === index) {
            setActiveIndex(null);
        } else {
            setActiveIndex(index);
        }
    };

    return (
        <View style={{ marginBottom: 10 }}>
            <TouchableOpacity
                onPress={toggleAccordion}
                style={[styles.accordionHeader, { backgroundColor }, borders.borderRoundTop]}
            >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                    {title}
                </Text>
                <FontAwesome5
                    name={activeIndex === index ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#fff"
                />
            </TouchableOpacity>

            {activeIndex === index && (
                <Animated.View style={[styles.accordionContent, borders.borderRoundBottom]}>
                    {children}
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    accordionContent: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#f8f9fa', // Cor de fundo do conteúdo
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',  // Linha fina no topo (se parecer com o Bootstrap)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    accordionHeader: {
        backgroundColor: '#007BFF',  // Azul do Bootstrap
        paddingVertical: 15,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,                // Sombras para o Android
        flexDirection: 'row', // Alinha o título e a seta horizontalmente
        justifyContent: 'space-between', // Garantir que o título e a seta fiquem nas extremidades
        alignItems: 'center', // Alinhar verticalmente
    },
    arrow: {
        color: '#fff',
        fontSize: 20,  // Tamanho da seta
    },
});

export default Accordion;
