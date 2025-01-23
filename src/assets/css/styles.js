import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    subTitle: {
        fontSize: 18,
        fontWeight: 'medium',
        marginBottom: 5,
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#007BFF',
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        borderBottomWidth: 2,
        borderBottomColor: '#007BFF',
        borderWidth: 0,
    },
    textArea: {
        height: 80,
        borderBottomWidth: 2,
        borderBottomColor: '#007BFF',
        borderColor: '#007BFF',
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        textAlignVertical: 'top',
    },
    button: {
        height: 50,
        backgroundColor: '#007BFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10,
        padding: 10,
    },
    buttonDanger: {
        height: 50,
        backgroundColor: '#E8003F',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10,
        padding: 10
    },
    buttonSecondary: {
        height: 50,
        backgroundColor: '#6C747E',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10,
        padding: 10
    },
    buttonSelectImage: {
        height: 50,
        backgroundColor: '#9333EA',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 5,
        marginTop: 10,
        padding: 10
    },
    buttonVoltar: {
        height: 50,
        backgroundColor: '#6c757d',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10,
        padding: 10
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    imageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        color: '#7d7d7d',
        fontSize: 14,
        textAlign: 'center',
    },
    buttonContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginBottom: 10
    },
    loadingIndicator: {
        marginRight: 10
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        borderBottomWidth: 5,
        borderBottomColor: '#007BFF',
    },
    cardDanger: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        borderBottomWidth: 5,
        borderBottomColor: '#E8003F',
    },
    h1: {
        fontSize: 32,
        fontWeight: 'bold'
    },
    h2: {
        fontSize: 28,
        fontWeight: 'semi-bold'
    },
    h3: {
        fontSize: 24,
        fontWeight: 'normal'
    },
    h4: {
        fontSize: 20,
        fontWeight: 'normal'
    },
    h5: {
        fontSize: 18,
        fontWeight: 'normal'
    },
    span: {
        fontSize: 14,
        fontWeight: 'normal'
    },
    p: {
        fontSize: 16,
        fontWeight: 'normal'
    },
    textDanger: {
        color: '#E8003F'
    },
    textWarning: {
        color: '#FFCA00'
    },
    textPrimary: {
        color: '#007BFF'
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 50,
        resizeMode: 'cover',
    },
    infoLabel: {
        fontSize: 14,
        color: '#777',
        marginTop: 8,
        fontWeight: 'bold',
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    infoTitle: {
        fontSize: 16,
        color: '#007BFF',
        fontWeight: 'bold'
    },
    modalCenteredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%', // Ou `width: width` se usar Dimensions
        padding: 20,   // Adicione um padding para melhor espaçamento
    },
})

export default styles