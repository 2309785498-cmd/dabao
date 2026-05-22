import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';
import EmployeeScreen from './EmployeeScreen';
import CategoryScreen from './CategoryScreen';
import DeviceScreen from './DeviceScreen';

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('employees');

  const tabs = [
    { key: 'employees', label: '员工管理', icon: '👥' },
    { key: 'categories', label: '设备分类', icon: '📁' },
    { key: 'devices', label: '设备管理', icon: '🖥' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'employees':
        return <EmployeeScreen />;
      case 'categories':
        return <CategoryScreen navigation={navigation} />;
      case 'devices':
        return <DeviceScreen />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.screen}>
      {/* 顶部状态栏模拟 */}
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>9:41</Text>
        <View style={styles.statusIcons}>
          <Text style={styles.statusIcon}>📶</Text>
          <Text style={styles.statusIcon}>📶</Text>
          <Text style={styles.statusIcon}>🔋</Text>
        </View>
      </View>

      {/* 科技蓝渐变头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>企业办公助手</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* 主内容区 */}
      <View style={styles.content}>{renderContent()}</View>

      {/* 底部 Tab 栏 */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function MainTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Device" component={DeviceScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  statusBar: {
    height: 44,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statusTime: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  statusIcons: { flexDirection: 'row', gap: 4 },
  statusIcon: { fontSize: 12 },
  header: {
    height: 64,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  logoutBtn: { padding: 8, borderRadius: 8 },
  logoutIcon: { fontSize: 20 },
  content: { flex: 1, overflow: 'hidden' },
  tabBar: {
    height: 64,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  tabIcon: { fontSize: 22, marginBottom: 2 },
  tabLabel: { fontSize: 11, color: COLORS.textMuted },
  tabLabelActive: { color: COLORS.primary, fontWeight: '600' },
});
