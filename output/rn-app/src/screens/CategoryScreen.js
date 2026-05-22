import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  ActivityIndicator, Modal, Alert, StyleSheet,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { COLORS, globalStyles } from '../styles/theme';
import { api } from '../services/api';

export default function CategoryScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm();

  const loadCategories = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await api.getCategories();
      if (res.code === 200) setCategories(res.data);
      else Alert.alert('提示', res.message);
    } catch {
      Alert.alert('错误', '加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const openModal = (category) => {
    if (category) {
      setEditingCategory(category);
      reset({ name: category.name });
    } else {
      setEditingCategory(null);
      reset({ name: '' });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
    reset({ name: '' });
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = editingCategory
        ? await api.updateCategory(editingCategory.id, data.name)
        : await api.createCategory(data.name);
      if (res.code === 200) {
        Alert.alert('成功', res.message);
        closeModal();
        loadCategories();
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
    const hasDevices = item.deviceCount > 0;
    const warnMsg = hasDevices ? `\n该分类下有 ${item.deviceCount} 个设备，删除可能失败。` : '';
    Alert.alert('确认删除', `确定要删除分类「${item.name}」吗？${warnMsg}`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除', style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const res = await api.deleteCategory(item.id);
            if (res.code === 200) {
              Alert.alert('成功', res.message);
              loadCategories();
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

  const handleViewDevices = (categoryId) => {
    navigation.navigate('Device', { categoryId });
  };

  const renderItem = ({ item }) => (
    <View style={[globalStyles.card, styles.categoryCard]}>
      <View style={styles.badgeCount}>
        <Text style={styles.badgeCountText}>{item.deviceCount}</Text>
      </View>

      <View style={styles.cardCenter}>
        <View style={styles.categoryIcon}>
          <Text style={styles.categoryIconText}>📁</Text>
        </View>
        <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
      </View>

      <View style={styles.categoryActions}>
        <TouchableOpacity style={styles.actionSm} onPress={() => openModal(item)}>
          <Text style={styles.actionSmText}>✏️ 编辑</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionSm, { backgroundColor: COLORS.successBg }]}
          onPress={() => handleViewDevices(item.id)}>
          <Text style={[styles.actionSmText, { color: COLORS.success }]}>👁 查看</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionSm, { backgroundColor: COLORS.dangerBg, marginTop: 4 }]}
          onPress={() => handleDelete(item)}>
          <Text style={[styles.actionSmText, { color: COLORS.danger }]}>🗑 删除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.headerBar}>
        <Text style={globalStyles.headerTitle}>设备分类</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal(null)}>
          <Text style={styles.addBtnText}>＋ 添加分类</Text>
        </TouchableOpacity>
      </View>

      {loading && categories.length === 0 ? (
        <View style={globalStyles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          renderItem={renderItem}
          contentContainerStyle={categories.length === 0 ? { flex: 1 } : globalStyles.listContent}
          refreshing={refreshing}
          onRefresh={() => loadCategories(true)}
          ListEmptyComponent={
            <Text style={globalStyles.emptyText}>暂无分类数据</Text>
          }
        />
      )}

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={globalStyles.modalTitle}>
                {editingCategory ? '编辑分类' : '添加分类'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Controller control={control} name="name"
              rules={{ required: '请输入分类名称', minLength: { value: 1, message: '至少1个字符' }, maxLength: { value: 20, message: '不超过20个字符' } }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={{ marginBottom: 14 }}>
                  <Text style={globalStyles.label}>分类名称 *</Text>
                  <TextInput style={[globalStyles.input, errors.name && globalStyles.inputError]}
                    placeholder="请输入分类名称" placeholderTextColor={COLORS.textMuted}
                    value={value} onChangeText={onChange} onBlur={onBlur} />
                  {errors.name && <Text style={globalStyles.errorText}>{errors.name.message}</Text>}
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
  gridRow: { justifyContent: 'space-between', marginBottom: 0 },
  categoryCard: {
    width: '48%',
    alignItems: 'center',
    paddingTop: 20,
    position: 'relative',
  },
  badgeCount: {
    position: 'absolute', top: -8, right: -8,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  badgeCountText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  cardCenter: { alignItems: 'center', marginBottom: 12 },
  categoryIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EBF0FF', justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  categoryIconText: { fontSize: 22 },
  categoryName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' },
  categoryActions: { width: '100%' },
  actionSm: {
    backgroundColor: COLORS.blue50, borderRadius: 8,
    paddingVertical: 6, alignItems: 'center', marginBottom: 4,
  },
  actionSmText: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '500' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  closeBtn: { fontSize: 20, color: COLORS.textMuted, padding: 4 },
});
