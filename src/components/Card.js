import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const Card = ({ title, content, footer, borderRadius = 10, marginBottom = 10, borderBottomWidth = 5, borderBottomColor = '#1d1e22', backgroundColor = '#fff' }) => {
    return (
        <View style={[styles.card, { borderBottomColor, backgroundColor, borderRadius, marginBottom, borderBottomWidth }]}>
            {title && <View style={styles.cardTitle}>{title}</View>}

            {/* Verificar se content foi passado */}
            {content && <View style={styles.cardContent}>{content}</View>}

            {/* Verificar se footer foi passado */}
            {footer && <View style={styles.cardFooter}>{footer}</View>}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    cardContent: {
        fontSize: 14,
    },
    cardFooter: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
    },
});

// Definindo as propTypes
Card.propTypes = {
    title: PropTypes.node,
    content: PropTypes.node,
    footer: PropTypes.node,
};

export default Card;
