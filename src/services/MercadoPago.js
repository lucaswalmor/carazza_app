const accessTokenSandBox = 'TEST-4801631620954080-011516-7c52f46bc9682dd45b65abec8e979aba-211131302';
const accessTokenProducao = 'APP_USR-4801631620954080-011516-e48abaf132aa47aba407375440c22c9f-211131302';

export async function createPreference(email) {
    try {
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessTokenProducao}`,
            },
            body: JSON.stringify({
                items: [
                    {
                        title: 'Assinatura Carazza Motoclube',
                        description: 'Assinatura mensal do plano',
                        quantity: 1,
                        currency_id: 'BRL',
                        unit_price: 4.99,
                    }
                ],
                payer: {
                    email: email,  // Email do cliente
                },
                back_urls: {
                    success: 'myapp://success',
                    failure: 'myapp://failure',
                },
                auto_recurring: {
                    frequency: 1,  // Frequência mensal
                    frequency_type: 'months',
                    start_date: new Date().toISOString(),
                    end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                    transaction_amount: 4.99,  // Valor da transação mensal
                    currency_id: 'BRL',
                },
                payer_email: 'customer_email@example.com',
                notification_url: '/notifications',  // URL para notificações
                external_reference: 'CARAZZA',  // Identificação externa para o cliente
                payment_methods: {
                    excluded_payment_types: [
                        { id: 'ticket' },  // Excluir pagamento por boleto
                        { id: 'atm' },     // Excluir pagamento por débito
                    ],
                    excluded_payment_methods: [
                        { id: 'promotional' },  // Excluir pagamentos promocionais
                        { id: 'pix' },     // Excluir PIX
                    ],
                },
            }),
        });

        const data = await response.json();

        if (response.ok) {
            const checkoutUrl = data.init_point;  // URL do Checkout
            return checkoutUrl;
        } else {
            console.error('Erro ao criar preferência de pagamento', data);
            throw new Error(data);
        }
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

export const criarAssinatura = async () => {
    const url = `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380849469a4a1019485312b350edb`;
    await openBrowserAsync(url);
};