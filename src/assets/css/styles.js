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
    inputComum: {
        height: 50,
        borderColor: '#007BFF',
        borderRadius: 5,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    clearButton: {
        position: 'absolute',
        right: 30,
        top: 75,
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
    buttonSend: {
        height: 30,
        backgroundColor: '#007BFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        marginTop: 10,
        width: '25%'
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
    buttonAddPatrocinador: {
        height: 30,
        width: '40%',
        backgroundColor: '#198754',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 5,
        marginTop: 10,
        marginBottom: 10,
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
    buttonTextSend: {
        color: '#fff',
        fontSize: 12,
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
    imageBannerContainer: {
        width: '100%',
        height: 120,
        borderRadius: 10,
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
        fontWeight: '600' // Corrigido para valor numérico válido
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
    logoEvento: {
        width: 100,
        height: 100,
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
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        margin: 20,
        width: '90%',
        alignItems: 'stretch'
    },
    timer: {
        fontSize: 20,
        paddingLeft: 30,
        fontWeight: "bold",
        color: '#cce5ff'
    },
    patrocinadorContainer: {
      marginBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    actionsContainer: {
        flexDirection: 'row', // Alinha os botões horizontalmente
        justifyContent: 'space-between', // Espaço igual entre os botões
        marginTop: 10,
    },
    actionButton: {
        flexDirection: 'row', // Ícone e texto na mesma linha
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    textCardTitle: {
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 5, height: 5 },
        textShadowRadius: 4,
        fontSize: 20,
    },
    textCard: {
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        fontSize: 18,
        fontWeight: 'medium'
    },
    textInfoCard: {
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        fontSize: 16,
        fontWeight: 'medium'
    },
    textCardTitleEncontros: {
        fontWeight: 'bold',
        color: '#007BFF',
        fontSize: 18,
    },
    textCardEncontros: {
        color: '#333333',
        fontSize: 16,
        fontWeight: 'medium'
    },
    video: {
      width: '100%',
      height: 600,
      marginBottom: 20,
      borderRadius: 10,
      overflow: 'hidden'
    },
})

export default styles