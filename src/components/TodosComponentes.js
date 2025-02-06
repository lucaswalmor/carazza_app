import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Button } from 'react-native';
import Accordion from '../components/Accordion';
import { borders, colors, display, fontWeights, gap, paddings, textAlign, fontSize, textTransforms, widths } from '../assets/css/primeflex';
import Card from '../components/Card';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '../components/Tabs';
import Toast from '../components/Toast';
import Message from '../components/Message';
import Botao from '../components/Botao';
import BotaoOutLine from '../components/BotaoOutLine';

export default function Componentes({ routeData }) {
    const [activeIndex, setActiveIndex] = useState(null); // Controla qual item está aberto
    const [toast, setToast] = useState({ visible: false, message: '', position: 'top', severity: '' });

    const showToast = (message, position, severity) => {
        setToast({ visible: true, message, position, severity });

        // Esconde o toast após 3 segundos
        setTimeout(() => setToast({ ...toast, visible: false }), 3000);
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ padding: 20 }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <BotaoOutLine severity="success" onPress={() => alert('Botão de Sucesso pressionado!')}>
                        <Text style={{ color: 'green' }}>Success Button</Text>
                    </BotaoOutLine>

                    <BotaoOutLine severity="warn" onPress={() => alert('Botão de Sucesso pressionado!')}>
                        <Text style={{ color: colors.orange[500] }}>Warning Button</Text>
                    </BotaoOutLine>

                    <BotaoOutLine severity="error" onPress={() => alert('Botão de Erro pressionado!')} />

                    <BotaoOutLine severity="info" onPress={() => alert('Botão de Informação pressionado!')}>
                        <Text style={{ color: 'blue', fontSize: 18 }}>Informative Button</Text>
                    </BotaoOutLine>

                    <BotaoOutLine severity="secondary" onPress={() => alert('Botão de Sucesso pressionado!')}>
                        <Text style={{ color: colors.gray[500] }}>secondary Button</Text>
                    </BotaoOutLine>
                </View>

                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Botao severity="success" onPress={() => alert('Botão de Sucesso pressionado!')}>
                        <Text style={{ color: 'white', fontSize: 18 }}>Success Botao</Text>
                    </Botao>

                    <Botao severity="info" onPress={() => alert('Botão de Informação pressionado!')}>
                        <Text style={{ color: 'white', fontSize: 18 }}>Informative Botao</Text>
                    </Botao>

                    <Botao severity="warn" onPress={() => alert('Botão de Informação pressionado!')}>
                        <Text style={{ color: 'white', fontSize: 18 }}>Warning Botao</Text>
                    </Botao>

                    <Botao severity="error" onPress={() => alert('Botão de Erro pressionado!')} />

                    <Botao severity="secondary" onPress={() => alert('Botão de Informação pressionado!')}>
                        <Text style={{ color: 'white', fontSize: 18 }}>Secondary Botao</Text>
                    </Botao>
                </View>

                <Message severity="success">Success Message</Message>
                <Message severity="info">Info Message</Message>
                <Message severity="warn">Warn Message</Message>
                <Message severity="error">Error Message</Message>
                <Message severity="secondary">Secondary Message</Message>
                <Message severity="contrast">Contrast Message</Message>

                <Accordion title="Accordion Item 1" index={0} activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
                    <Button title="Show Toast (Top)" onPress={() => showToast('Mensagem no Topo', 'top', 'success')} />
                    <Button title="Show Toast (Center)" onPress={() => showToast('Mensagem no Centro', 'center', 'danger')} />
                    <Button title="Show Toast (Bottom)" onPress={() => showToast('Mensagem em Baixo', 'bottom', 'help')} />
                </Accordion>

                <Accordion title="Accordion Item 2" index={1} activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
                    <Text style={{ fontSize: 16 }}>Este é o conteúdo do item 2. Pode ser um texto diferente ou qualquer outro conteúdo.</Text>
                </Accordion>

                <Accordion title="Accordion Item 3" index={2} activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
                    <Text style={{ fontSize: 16 }}>Aqui está o conteúdo do item 3. Expanda para ver mais.</Text>
                </Accordion>

                <Card
                    title={<Text>Título do Card</Text>}
                    content={<Text>Este é o conteúdo principal do card.</Text>}
                // footer={<Text>Teste</Text>}
                />

                <Tabs initialValue={0}>
                    <TabList>
                        <Tab
                        // activeBackgroundColor="#28a745"
                        // activeBackgroundColor={colors.green['500']}
                        // inactiveBackgroundColor="#f8f9fa"
                        // activeTextColor="#fff"
                        // inactiveTextColor="#6c757d"
                        >
                            Pontos
                        </Tab>
                        <Tab>
                            Eventos
                        </Tab>
                        <Tab>Encontros</Tab>
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
                            <View style={[display.row, display.flexWrap]}>
                                <View style={[widths['5'], { backgroundColor: colors.indigo[500] }]}>
                                    <Text style={[textTransforms['none'], textAlign['center'], fontSize['xs'], fontWeights['bold'], { color: colors.alpha['1000'] }]}>
                                        Lorem ipsum
                                    </Text>
                                </View>

                                <View style={[widths['5']]}>
                                    <Text style={[fontSize['xs'], textAlign['right'], fontWeights['semibold'], { color: colors.red['600'] }]}>
                                        Lorem ipsum
                                    </Text>
                                </View>

                                <View style={[widths['5']]}>
                                    <Text style={[fontSize['xs'], fontWeights['medium'], { color: colors.red['600'] }]}>
                                        Lorem ipsum
                                    </Text>
                                </View>

                                <View style={[widths['5']]}>
                                    <Text style={[fontSize['xs'], fontWeights['normal'], { color: colors.red['600'] }]}>
                                        Lorem ipsum
                                    </Text>
                                </View>

                                <View style={[widths['5']]}>
                                    <Text style={[fontSize['xs'], fontWeights['light'], { color: colors.red['600'] }]}>
                                        Lorem ipsum
                                    </Text>
                                </View>
                            </View>
                        </TabPanel>
                        <TabPanel>
                            <Text>
                                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
                            </Text>
                        </TabPanel>
                        <TabPanel>
                            <Text>
                                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.
                            </Text>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </ScrollView>

            {toast.visible && (
                <Toast
                    message={toast.message}
                    position={toast.position}
                    onClose={() => setToast({ ...toast, visible: false })}
                    severity={toast.severity}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
});
