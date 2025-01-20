import { NavigationContainer } from "@react-navigation/native";
import StackRoutes from "./stack.routes";
import { useEffect } from "react";
import { Linking } from "react-native";

export default function Routes() {
    const linking = {
        prefixes: ['myapp://', 'exp://192.168.100.29:8081/--/myapp'],
        config: {
            screens: {
                Success: 'success',
                Failure: 'failure',
                Home: '',
            }
        }
    }

    useEffect(() => {
        const handleDeepLink = ({ url }) => {};

        // Captura URL inicial
        Linking.getInitialURL().then((url) => {
            if (url) handleDeepLink({ url });
        });

        // Captura alterações dinâmicas
        const subscription = Linking.addEventListener('url', handleDeepLink);

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <NavigationContainer linking={linking}>
            <StackRoutes />
        </NavigationContainer>
    )
}