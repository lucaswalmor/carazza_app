const pesquisacep = async (valor) => {
    const cep = valor.replace(/\D/g, '');

    try {
        if (cep.length != 8) {
            return {message: 'CEP inválido'}
        }

        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Erro ao buscar o CEP:', error);
    }
};

export default pesquisacep;