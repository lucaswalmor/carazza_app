import Routes from "./routes";
import 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    // Listener para notificações enquanto o app está aberto
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificação recebida:', notification);

      // Exibe manualmente a notificação na barra
      Notifications.presentNotificationAsync({
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data,
      });
    });

    // Listener para quando o app está em segundo plano ou fechado
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Usuário interagiu com a notificação:', response);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#007BFF" />
      <Routes />
    </>
  )
}