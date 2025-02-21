import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Tabs = ({ children, initialValue = 0 }) => {
    const [activeTab, setActiveTab] = useState(initialValue);

    return React.Children.map(children, (child) =>
        React.cloneElement(child, { activeTab, setActiveTab })
    );
};

const TabList = ({
    children,
    activeTab,
    setActiveTab,
    borderRadius = 0
}) => (
    <View style={[styles.tabList, { borderRadius }]}>
        {React.Children.map(children, (child, index) =>
            React.cloneElement(child, { isActive: activeTab === index, onPress: () => setActiveTab(index) })
        )}
    </View>
);

const Tab = ({
    children,
    isActive,
    onPress,
    activeBackgroundColor = '#1d1e22',
    inactiveBackgroundColor = '#e9ecef',
    activeTextColor = '#fff',
    inactiveTextColor = '#000',
}) => (
    <TouchableOpacity
        onPress={onPress}
        style={[
            styles.tab,
            { backgroundColor: isActive ? activeBackgroundColor : inactiveBackgroundColor }
        ]}
    >
        {typeof children === 'function' ? children({ isActive }) : (
            <Text style={{
                color: isActive ? activeTextColor : inactiveTextColor,
                fontWeight: 'bold'
            }}>
                {children}
            </Text>
        )}
    </TouchableOpacity>
);

const TabPanels = ({
    children,
    activeTab,
    backgroundColor = '#fff',
    borderRadius = {},
    borderRoundLeft = {},
    borderRoundTop = {},
    borderRoundBottom = {},
    borderRoundRight = {},
    padding = 8
}) => (
    <View
        style={[
            styles.tabPanels,
            {
                padding,
                backgroundColor,
                ...borderRadius,
                ...borderRoundLeft,
                ...borderRoundTop,
                ...borderRoundBottom,
                ...borderRoundRight,
            }
        ]}>
        {React.Children.map(children, (child, index) =>
            index === activeTab ? child : null
        )}
    </View>
);

const TabPanel = ({ children, padding = 0 }) => <View style={{ padding }}>{children}</View>;

const styles = StyleSheet.create({
    tabList: {
        flexDirection: 'row',
        backgroundColor: '#e9ecef',
        overflow: 'hidden',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#1d1e22',
    },
    tabText: {
        color: '#000',
        fontWeight: 'bold',
    },
    activeTabText: {
        color: '#fff',
    },
    tabPanels: {
        elevation: 2,
    },
    tabPanel: {
        padding: 10,
    },
});

export { Tabs, TabList, Tab, TabPanels, TabPanel };
