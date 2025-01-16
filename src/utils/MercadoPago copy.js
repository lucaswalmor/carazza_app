export const handleIntegration = async () => {
    const accessToken = 'TEST-4801631620954080-011516-7c52f46bc9682dd45b65abec8e979aba-211131302';

    const preferencia = {
        "items": [
            {
                title: 'Carazza motoclube',
                description: 'Carazza motoclube',
                unit_price: 4.99,
                quantity: 1,
                auto_repeat: true,
                auto_repeat_frequency: 'monthly',
            },
        ],
        "payment_methods": {
            "excluded_payment_methods": [
                {
                    "id": "master"
                },
                {
                    "id": "bank_transfer",
                },
                {
                    "id": "atm",
                },
                {
                    "id": "pix"
                },
            ],
            "excluded_payment_types": [
                {
                    "id": "ticket"
                },
            ],
            "default_payment_method_id": "amex",
            "installments": 1,
            "default_installments": 1
        },
    }

    try {
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(preferencia)
        })

        const data = await response.json();

        return data.init_point;
    } catch (error) {
        console.log('error: ', error)
    }
}