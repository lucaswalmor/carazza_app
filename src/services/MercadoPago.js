import { openBrowserAsync } from "expo-web-browser";

export default async function handleIntregrationMP() {
    const preference = {
        "preapproval_plan_id": "2c9380849469a43c019484ffd8b70ef0",
        "reason": "Carazza Motoclube",
        "external_reference": "CARAZZA",
        "payer_email": "test_user@testuser.com",
        "card_token_id": "e3ed6f098462036dd2cbabe314b9de2a",
        "auto_recurring": {
            "frequency": 1,
            "frequency_type": "months",
            "start_date": "2020-06-02T13:07:14.260Z",
            "end_date": "2022-07-20T15:59:52.581Z",
            "transaction_amount": 10,
            "currency_id": "ARS"
        },
        "back_url": "https://www.mercadopago.com.ar",
        "status": "authorized"
    }

    const accessToken = 'TEST-4801631620954080-011516-7c52f46bc9682dd45b65abec8e979aba-211131302';

    try {
        const response = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(preference)
        });
        const data = await response.json();
        if (response.ok) {
            console.log('Assinatura criada com sucesso!', data);
        } else {
            console.log('Erro ao criar assinatura', data);
        }
    } catch (error) {
        console.log('Erro', error);
    }
}
