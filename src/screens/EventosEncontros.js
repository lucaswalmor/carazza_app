import { ScrollView, Text, View } from 'react-native';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '../components/Tabs';
import EventosListScreen from './EventosListScreen';
import EncontrosListScreen from './EncontrosListScreen';
import PontosListScreen from './PontosListScreen';
import { borders, display, gap, paddings } from '../assets/css/primeflex';
import { FontAwesome5 } from '@expo/vector-icons';

export default function EventosEncontros() {

    return (
        <View style={{ flex: 1 }}>
            <ScrollView>
                <Tabs initialValue={0}>
                    <TabList>
                        <Tab>
                            {({ isActive }) => (
                                <View style={[display.row, gap[2]]}>
                                    <FontAwesome5 name="map-marked-alt" size={16} color={isActive ? "#FFF" : "#000"} />
                                    <Text style={{ color: isActive ? "#FFF" : "#000" }}>Pontos</Text>
                                </View>
                            )}
                        </Tab>
                        <Tab>
                            {({ isActive }) => (
                                <View style={[display.row, gap[2]]}>
                                    <FontAwesome5 name="calendar" size={16} color={isActive ? "#FFF" : "#000"} />
                                    <Text style={{ color: isActive ? "#FFF" : "#000" }}>Eventos</Text>
                                </View>
                            )}
                        </Tab>
                        <Tab>
                            {({ isActive }) => (
                                <View style={[display.row, gap[2]]}>
                                    <FontAwesome5 name="map-marker-alt" size={16} color={isActive ? "#FFF" : "#000"} />
                                    <Text style={{ color: isActive ? "#FFF" : "#000" }}>Encontros</Text>
                                </View>
                            )}
                        </Tab>
                    </TabList>

                    <TabPanels
                        // backgroundColor="#6c757d"
                        // backgroundColor={colors.cyan['500']}
                        borderRadius={borders.borderRoundSm}
                        padding={paddings[3]}
                    // borderRoundLeft={borders.borderRoundLeft}
                    // borderRoundBottom={borders.borderRoundBottomSm}
                    >
                        <TabPanel>
                            <PontosListScreen />
                        </TabPanel>
                        <TabPanel>
                            <EventosListScreen />
                        </TabPanel>
                        <TabPanel>
                            <EncontrosListScreen />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </ScrollView>
        </View>
    )
}

