import React from 'react';
import { View, Text, Button } from 'react-native';

export default function RetryPaymentScreen({ navigation }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>O pagamento falhou. Tente novamente!</Text>
            <Button title="Re-tentar Pagamento" onPress={() => navigation.navigate('Cadastro')} />
        </View>
    );
}
