import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  ActivityIndicator, Modal, Alert, StyleSheet,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { COLORS, globalStyles } from '../styles/theme';
import { api } from '../services/api';

export default function EmployeeScreen() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm();

  const loadEmployees = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await api.getEmployees();
      if (res.code === 200) setEmployees(res.data);
      else Alert.alert('提示', res.message);
    } catch {
      Alert.alert('错误', '加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const openModal = (employee) => {
    if (employee) {
      setEditingEmployee(employee);
      reset({ name: employee.name, age: String(employee.age), email: employee.email });
    } else {
      setEditingEmployee(null);
      reset({ name: '', age: '18', email: '' });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingEmployee(null);
    reset({ name: '', age: '18', email: '' });
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = { name: data.name, age: parseInt(data.age, 10), email: data.email };
      const res = editingEmployee
        ? await api.updateEmployee(editingEmployee.id, payload)
        : await api.createEmployee(payload);
      if (res.code === 200) {
        Alert.alert('成功', res.message);
        closeModal();
        loadEmployees();
      } else {
        Alert.alert('提示', res.message);
      }
    } catch {
      Alert.alert('错误', '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert('确认删除', `确定要删除员工「${item.name}」吗？此操作不可恢复。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除', style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const res = await api.deleteEmployee(item.id);
            if (res.code === 200) {
              Alert.alert('成功', res.message);
              loadEmployees();
            } else {
              Alert.alert('提示', res.message);
            }
          } catch {
            Alert.alert('错误', '删除失败');
          } finally { setLoading(false); }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={globalStyles.card}>
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName}>{item.name}</Text>
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>{item.age}岁</Text>
            </View>
          </View>
          <Text style={styles.cardEmail}>✉ {item.email}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => openModal(item)}>
            <Text style={styles.editBtnText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
            <Text style={styles.delBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={globalStyles.headerBar}>
        <Text style={globalStyles.headerTitle}>员工列表</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal(null)}>
          <Text style={styles.addBtnText}>＋ 添加员工</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading && employees.length === 0 ? (
        <View style={globalStyles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={employees.length === 0 ? { flex: 1 } : globalStyles.listContent}
          refreshing={refreshing}
          onRefresh={() => loadEmployees(true)}
          ListEmptyComponent={
            <Text style={globalStyles.emptyText}>暂无员工数据</Text>
          }
        />
      )}

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={globalStyles.modalOverlay}>
          <View style={[globalStyles.modalContent, styles.modalScroll]}>
            <View style={styles.modalHeader}>
              <Text style={globalStyles.modalTitle}>
                {editingEmployee ? '编辑员工' : '添加员工'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Controller control={control} name="name"
              rules={{ required: '请输入姓名', minLength: { value: 1, message: '至少1个字符' }, maxLength: { value: 20, message: '不超过20个字符' } }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.fieldWrap}>
                  <Text style={globalStyles.label}>姓名 *</Text>
                  <TextInput style={[globalStyles.input, errors.name && globalStyles.inputError]}
                    placeholder="请输入姓名" placeholderTextColor={COLORS.textMuted}
                    value={value} onChangeText={onChange} onBlur={onBlur} />
                  {errors.name && <Text style={globalStyles.errorText}>{errors.name.message}</Text>}
                </View>
              )}
            />

            <Controller control={control} name="age"
              rules={{ required: '请输入年龄', min: { value: 18, message: '年龄≥18' }, max: { value: 60, message: '年龄≤60' } }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.fieldWrap}>
                  <Text style={globalStyles.label}>年龄 *</Text>
                  <TextInput style={[globalStyles.input, errors.age && globalStyles.inputError]}
                    placeholder="请输入年龄" placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric" value={value} onChangeText={onChange} onBlur={onBlur} />
                  {errors.age && <Text style={globalStyles.errorText}>{errors.age.message}</Text>}
                </View>
              )}
            />

            <Controller control={control} name="email"
              rules={{ required: '请输入邮箱', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: '邮箱格式不合法' } }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.fieldWrap}>
                  <Text style={globalStyles.label}>邮箱 *</Text>
                  <TextInput style={[globalStyles.input, errors.email && globalStyles.inputError]}
                    placeholder="请输入邮箱" placeholderTextColor={COLORS.textMuted}
                    keyboardType="email-address" autoCapitalize="none"
                    value={value} onChangeText={onChange} onBlur={onBlur} />
                  {errors.email && <Text style={globalStyles.errorText}>{errors.email.message}</Text>}
                </View>
              )}
            />

            <View style={globalStyles.rowButtons}>
              <TouchableOpacity style={[globalStyles.btnSecondary, globalStyles.flex1]} onPress={closeModal}>
                <Text style={globalStyles.btnSecondaryText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.btnPrimary, globalStyles.flex1, submitting && { opacity: 0.5 }]}
                onPress={handleSubmit(onSubmit)} disabled={submitting}>
                {submitting ? <ActivityIndicator color={COLORS.white} /> : <Text style={globalStyles.btnPrimaryText}>确定</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#EBF0FF', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 22 },
  cardInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  ageBadge: { backgroundColor: COLORS.blue50, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  ageBadgeText: { fontSize: 12, color: COLORS.primary },
  cardEmail: { fontSize: 13, color: COLORS.textSecondary },
  cardActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 8, borderRadius: 8 },
  editBtnText: { fontSize: 16 },
  delBtnText: { fontSize: 16 },
  addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '500' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  closeBtn: { fontSize: 20, color: COLORS.textMuted, padding: 4 },
  modalScroll: { maxHeight: '80%' },
  fieldWrap: { marginBottom: 14 },
});
