import Routes from "./routes";
import 'react-native-gesture-handler';
import { StatusBar } from 'react-native';

export default function App() {

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#007BFF" />
      <Routes />
    </>
  )
}