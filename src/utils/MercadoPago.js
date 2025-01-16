import { openBrowserAsync } from "expo-web-browser";

export const handleIntegration = async (emailDoUsuario) => {
    const accessToken = 'TEST-4801631620954080-011516-7c52f46bc9682dd45b65abec8e979aba-211131302';
    const plano = {
        "reason": "Carazza motoclube",
        "payer_email": emailDoUsuario,
        "auto_recurring": {
            "frequency": 1,
            "frequency_type": "months",
            "transaction_amount": 4.99,
            "currency_id": "BRL"
        },
        "payment_methods_allowed": {
            "payment_types": [
                { "id": "credit_card" }
            ]
        },
        "preapproval_plan_id": "2c938084726fca480172750000000000",
        "back_url": "https://3e66-2804-1e68-c209-4131-257c-2895-c349-d7b3.ngrok-free.app/api/mercadopago-webhook"
    };
 
    try {
        const response = await fetch('https://api.mercadopago.com/preapproval_plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(plano)
        });
        
        const data = await response.json();

        console.log(data)

        return data.id;
    } catch (error) {
        console.log('error: ', error)
    }
};

export const criarAssinatura = async (idDoPlano) => {
    const url = `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=${idDoPlano}`;
    await openBrowserAsync(url);
};