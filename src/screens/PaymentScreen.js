import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import { handleIntegration } from '../utils/MercadoPago';
import { openBrowserAsync } from 'expo-web-browser';

const PaymentScreen = () => {
    const [status, setStatus] = useState('');

    const handlePayment = async () => {
        const data = await handleIntegration();
        console.log(data)

        if (!data) {
            return console.log('erro')
        }

        const url = `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=${data}`;
        await openBrowserAsync(url);
    };

    const renderPaymentStatus = () => {
        switch (status) {
            case 'approved':
                return (
                    <View>
                        <Text>Pagamento aprovado! 🎉</Text>
                    </View>
                );
            case 'rejected':
                return (
                    <View>
                        <Text>Pagamento rejeitado. Por favor, tente novamente.</Text>
                    </View>
                );
            case 'pending':
                return (
                    <View>
                        <Text>Pagamento pendente. Aguarde a confirmação.</Text>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View>
            <Button title="Pagar" onPress={handlePayment} />

            {renderPaymentStatus()}
        </View>
    );
};

export default PaymentScreen;