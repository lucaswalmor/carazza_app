import { Image, View } from "react-native";
import { shadows } from "../assets/css/primeflex";

export default function CartaoScreen() {
    return (
        <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center' 
        }}>
            <Image
                source={require('../assets/img/cartao.png')}
                style={[
                    {
                        width: '150%', 
                        transform: [{ rotate: '90deg' }],
                        resizeMode: "contain",
                    },
                ]}
            />
        </View>
    );
}
