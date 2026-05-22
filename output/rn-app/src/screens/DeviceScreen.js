import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  ActivityIndicator, Modal, Alert, StyleSheet,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { COLORS, globalStyles } from '../styles/theme';
import { api } from '../services/api';

export default function DeviceScreen({ route }) {
  const initialCategoryId = route?.params?.categoryId;

  const [devices, setDevices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId || null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const loadCategories = useCallback(async () => {
    try {
      const res = await api.getCategories();
      if (res.code === 200) setCategories(res.data);
    } catch { /* silent */ }
  }, []);

  const loadDevices = useCallback(async (categoryId, isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await api.getDevices(categoryId);
      if (res.code === 200) setDevices(res.data);
      else Alert.alert('提示', res.message);
    } catch {
      Alert.alert('错误', '加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  useEffect(() => {
    if (initialCategoryId) {
      setSelectedCategoryId(initialCategoryId);
      loadDevices(initialCategoryId);
    } else {
      loadDevices();
    }
  }, [initialCategoryId, loadDevices]);

  const handleFilter = (categoryId) => {
    const cid = categoryId === 'all' ? null : categoryId;
    setSelectedCategoryId(cid);
    setPickerVisible(false);
    loadDevices(cid);
  };

  const openModal = () => {
    const defaultCatId = selectedCategoryId || (categories[0]?.id ?? null);
    setValue('categoryId', defaultCatId);
    reset({ name: '', model: '', categoryId: defaultCatId });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await api.createDevice({
        name: data.name,
        model: data.model || '',
        categoryId: data.categoryId,
      });
      if (res.code === 200) {
        Alert.alert('成功', res.message);
        closeModal();
        loadDevices(selectedCategoryId);
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

  const selectedLabel = selectedCategoryId
    ? categories.find(c => c.id === selectedCategoryId)?.name || '已选分类'
    : '全部分类';

  const renderItem = ({ item }) => (
    <View style={globalStyles.card}>
      <View style={styles.cardRow}>
        <View style={styles.deviceIcon}>
          <Text style={styles.deviceIconText}>🖥</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          {item.model ? <Text style={styles.deviceModel}>型号：{item.model}</Text> : null}
          <View style={styles.tagWrap}>
            <Text style={styles.tag}>{item.categoryName}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={[globalStyles.headerBar, { flexDirection: 'column', gap: 10 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Text style={globalStyles.headerTitle}>设备列表</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openModal}>
            <Text style={styles.addBtnText}>＋ 添加设备</Text>
          </TouchableOpacity>
        </View>

        {/* Filter */}
        <TouchableOpacity style={styles.filterBtn} onPress={() => setPickerVisible(true)}>
          <Text style={styles.filterText}>{selectedLabel}</Text>
          <Text style={styles.filterArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading && devices.length === 0 ? (
        <View style={globalStyles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={devices.length === 0 ? { flex: 1 } : globalStyles.listContent}
          refreshing={refreshing}
          onRefresh={() => loadDevices(selectedCategoryId, true)}
          ListEmptyComponent={
            <Text style={globalStyles.emptyText}>
              {selectedCategoryId ? '该分类下暂无设备' : '暂无设备数据'}
            </Text>
          }
        />
      )}

      {/* Filter Picker Modal */}
      <Modal visible={pickerVisible} transparent animationType="fade">
        <TouchableOpacity style={globalStyles.modalOverlay} activeOpacity={1}
          onPress={() => setPickerVisible(false)}>
          <View style={[globalStyles.modalContent, styles.pickerBox]}>
            <Text style={styles.pickerTitle}>选择分类</Text>
            <TouchableOpacity style={[styles.pickerItem, !selectedCategoryId && styles.pickerItemActive]}
              onPress={() => handleFilter('all')}>
              <Text style={[styles.pickerItemText, !selectedCategoryId && { color: COLORS.primary, fontWeight: '600' }]}>
                全部分类
              </Text>
            </TouchableOpacity>
            {categories.map(cat => (
              <TouchableOpacity key={cat.id}
                style={[styles.pickerItem, selectedCategoryId === cat.id && styles.pickerItemActive]}
                onPress={() => handleFilter(cat.id)}>
                <Text style={[styles.pickerItemText, selectedCategoryId === cat.id && { color: COLORS.primary, fontWeight: '600' }]}>
                  {cat.name} ({cat.deviceCount})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={globalStyles.modalOverlay}>
          <View style={[globalStyles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={globalStyles.modalTitle}>添加设备</Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Controller control={control} name="name"
              rules={{ required: '请输入设备名称' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.fieldWrap}>
                  <Text style={globalStyles.label}>设备名称 *</Text>
                  <TextInput style={[globalStyles.input, errors.name && globalStyles.inputError]}
                    placeholder="请输入设备名称" placeholderTextColor={COLORS.textMuted}
                    value={value} onChangeText={onChange} onBlur={onBlur} />
                  {errors.name && <Text style={globalStyles.errorText}>{errors.name.message}</Text>}
                </View>
              )}
            />

            <Controller control={control} name="model"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.fieldWrap}>
                  <Text style={globalStyles.label}>设备型号</Text>
                  <TextInput style={globalStyles.input}
                    placeholder="请输入设备型号（可选）" placeholderTextColor={COLORS.textMuted}
                    value={value} onChangeText={onChange} onBlur={onBlur} />
                </View>
              )}
            />

            <Controller control={control} name="categoryId"
              rules={{ required: '请选择所属分类' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.fieldWrap}>
                  <Text style={globalStyles.label}>所属分类 *</Text>
                  <View style={styles.selectWrap}>
                    {categories.map(cat => (
                      <TouchableOpacity key={cat.id}
                        style={[styles.selectItem, value === cat.id && styles.selectItemActive]}
                        onPress={() => { setValue('categoryId', cat.id); onChange(cat.id); }}>
                        <Text style={[styles.selectItemText, value === cat.id && { color: COLORS.primary, fontWeight: '600' }]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {errors.categoryId && <Text style={globalStyles.errorText}>{errors.categoryId.message}</Text>}
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
  deviceIcon: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: '#EBF0FF', justifyContent: 'center', alignItems: 'center',
  },
  deviceIconText: { fontSize: 22 },
  cardInfo: { flex: 1 },
  deviceName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  deviceModel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  tagWrap: { flexDirection: 'row' },
  tag: {
    backgroundColor: COLORS.blue50, color: COLORS.primary,
    fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    overflow: 'hidden', fontWeight: '500',
  },
  addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '500' },
  filterBtn: {
    width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.gray100, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.gray200,
  },
  filterText: { fontSize: 14, color: COLORS.textPrimary },
  filterArrow: { fontSize: 12, color: COLORS.textMuted },
  pickerBox: { padding: 20 },
  pickerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 14, textAlign: 'center' },
  pickerItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  pickerItemActive: { backgroundColor: COLORS.blue50, borderRadius: 8, paddingHorizontal: 12 },
  pickerItemText: { fontSize: 15, color: COLORS.textPrimary },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  closeBtn: { fontSize: 20, color: COLORS.textMuted, padding: 4 },
  fieldWrap: { marginBottom: 14 },
  selectWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectItem: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.gray200, backgroundColor: COLORS.white,
  },
  selectItemActive: { borderColor: COLORS.primary, backgroundColor: COLORS.blue50 },
  selectItemText: { fontSize: 14, color: COLORS.textPrimary },
});
