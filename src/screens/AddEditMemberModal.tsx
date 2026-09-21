import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { useExpenseStore } from '../store/useExpenseStore';
import { useThemeStore } from '../store/useThemeStore';
import { getTheme } from '../theme';
import { Header } from '../components/common/Header';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ColorPicker } from '../components/member/ColorPicker';
import { AVATAR_COLOR_PALETTE } from '../domain/constants';
import { memberSchema } from '../utils/validation';
import { CreateMemberInput } from '../models/member';
import { VIETNAM_BANKS, BankInfo, fetchVietQRBanks, getBankLogoUrl, matchBankSearch } from '../domain/vietqr';
import { Card } from '../components/common/Card';

interface AddEditMemberModalProps {
  navigation: any;
  route: any;
}

export const AddEditMemberModal: React.FC<AddEditMemberModalProps> = ({ navigation, route }) => {
  const existingMember = route.params?.member;
  const { addMember, updateMember } = useExpenseStore();
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const [name, setName] = useState(existingMember ? existingMember.name : '');
  const [color, setColor] = useState(
    existingMember ? existingMember.color : AVATAR_COLOR_PALETTE[Math.floor(Math.random() * AVATAR_COLOR_PALETTE.length)]
  );

  const [bankList, setBankList] = useState<BankInfo[]>(VIETNAM_BANKS);

  // Fetch latest bank list with logos from VietQR API on mount
  useEffect(() => {
    let isMounted = true;
    fetchVietQRBanks().then((banks) => {
      if (isMounted && banks && banks.length > 0) {
        setBankList(banks);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Banking state
  const [selectedBank, setSelectedBank] = useState<BankInfo | null>(() => {
    if (existingMember?.bankBin) {
      return VIETNAM_BANKS.find(b => b.bin === existingMember.bankBin || b.shortName === existingMember.bankBin || b.code === existingMember.bankBin) || null;
    }
    return null;
  });
  const [accountNumber, setAccountNumber] = useState(existingMember?.accountNumber || '');
  const [accountHolder, setAccountHolder] = useState(existingMember?.accountHolder || '');
  
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  const filteredBanks = bankList.filter((b) => matchBankSearch(b, bankSearch));

  const handleSubmit = async () => {
    setError(null);
    const memberData: CreateMemberInput = {
      name,
      color,
      bankBin: selectedBank ? selectedBank.shortName : '',
      bankName: selectedBank ? selectedBank.name : '',
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
    };

    const result = memberSchema.safeParse(memberData);

    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      if (existingMember) {
        await updateMember(existingMember.id, memberData);
      } else {
        await addMember(memberData);
      }
      setLoading(false);
      navigation.goBack();
    } catch (e: any) {
      setLoading(false);
      setError(e.message || 'Lỗi khi lưu thông tin thành viên');
    }
  };

  const handleImageError = (code: string) => {
    setImageErrorMap((prev) => ({ ...prev, [code]: true }));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        onBack={() => navigation.goBack()}
        title={existingMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input
          autoFocus={!existingMember}
          error={error || undefined}
          label="Tên thành viên *"
          onChangeText={(val) => {
            setName(val);
            if (error) setError(null);
          }}
          placeholder="Ví dụ: Thanh Phong, Hoàng An..."
          value={name}
        />

        <ColorPicker onSelectColor={setColor} selectedColor={color} />

        {/* BANKING SECTION */}
        <View style={styles.sectionDivider}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            💳 Tài Khoản Ngân Hàng (Tạo VietQR)
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>
            Cần thiết để bạn bè nhận mã VietQR chuyển khoản tự động
          </Text>
        </View>

        <Card style={styles.bankCard}>
          {/* Bank Picker Trigger */}
          <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Ngân hàng</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowBankPicker(true)}
            style={[
              styles.bankSelector,
              { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.bankSelectorInner}>
              {selectedBank ? (
                <View style={styles.bankLogoBadge}>
                  {!imageErrorMap[selectedBank.code] && (selectedBank.logo || getBankLogoUrl(selectedBank.shortName)) ? (
                    <Image
                      source={{ uri: selectedBank.logo || getBankLogoUrl(selectedBank.shortName) }}
                      style={styles.bankLogoImage}
                      resizeMode="contain"
                      onError={() => handleImageError(selectedBank.code)}
                    />
                  ) : (
                    <View style={[styles.fallbackBrandTag, { backgroundColor: selectedBank.color }]}>
                      <Text style={styles.fallbackBrandText}>{selectedBank.code}</Text>
                    </View>
                  )}
                </View>
              ) : null}
              <Text
                style={[
                  styles.bankSelectorText,
                  { color: selectedBank ? theme.colors.textPrimary : theme.colors.textMuted },
                ]}
                numberOfLines={1}
              >
                {selectedBank ? selectedBank.name : 'Chọn ngân hàng...'}
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: theme.colors.textMuted }}>▼</Text>
          </TouchableOpacity>

          {/* Account Number */}
          <Input
            keyboardType="number-pad"
            label="Số tài khoản"
            onChangeText={setAccountNumber}
            placeholder="Ví dụ: 1012345678"
            value={accountNumber}
          />

          {/* Account Holder */}
          <Input
            autoCapitalize="characters"
            label="Chủ tài khoản (Không bắt buộc)"
            onChangeText={setAccountHolder}
            placeholder={name ? `Mặc định: ${name.toUpperCase()}` : 'Ví dụ: NGUYEN VAN A'}
            value={accountHolder}
          />
        </Card>

        <Button
          loading={loading}
          onPress={handleSubmit}
          style={styles.saveBtn}
          title={existingMember ? 'Cập nhật thành viên' : 'Thêm thành viên'}
        />
      </ScrollView>

      {/* BANK PICKER MODAL */}
      <Modal animationType="slide" visible={showBankPicker} onRequestClose={() => setShowBankPicker(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <Header title="Chọn ngân hàng (VietQR)" onBack={() => setShowBankPicker(false)} />

          <View style={styles.searchBox}>
            <TextInput
              onChangeText={setBankSearch}
              placeholder="Tìm nhanh: Sacombank, Vietcombank, MB, Techcombank..."
              placeholderTextColor={theme.colors.textMuted}
              style={[
                styles.searchInput,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                },
              ]}
              value={bankSearch}
            />
          </View>

          <FlatList
            data={filteredBanks}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => {
              const hasError = imageErrorMap[item.code];
              const logoUri = item.logo || getBankLogoUrl(item.shortName);

              return (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedBank(item);
                    setShowBankPicker(false);
                  }}
                  style={[
                    styles.bankItem,
                    {
                      borderBottomColor: theme.colors.border,
                      backgroundColor:
                        selectedBank?.code === item.code ? theme.colors.surfaceVariant : 'transparent',
                    },
                  ]}
                >
                  <View style={styles.bankLogoBadge}>
                    {!hasError && logoUri ? (
                      <Image
                        source={{ uri: logoUri }}
                        style={styles.bankLogoImage}
                        resizeMode="contain"
                        onError={() => handleImageError(item.code)}
                      />
                    ) : (
                      <View style={[styles.fallbackBrandTag, { backgroundColor: item.color }]}>
                        <Text style={styles.fallbackBrandText}>{item.code}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bankNameText, { color: theme.colors.textPrimary }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.bankSubText, { color: theme.colors.textMuted }]}>
                      Mã: {item.code} • BIN: {item.bin}
                    </Text>
                  </View>
                  {selectedBank?.code === item.code && (
                    <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionDivider: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  bankCard: {
    padding: 16,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  bankSelector: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bankSelectorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  bankSelectorText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  bankLogoBadge: {
    width: 52,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  bankLogoImage: {
    width: '100%',
    height: '100%',
  },
  fallbackBrandTag: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackBrandText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 10,
  },
  saveBtn: {
    marginTop: 20,
    marginBottom: 40,
  },
  modalContainer: {
    flex: 1,
  },
  searchBox: {
    padding: 16,
  },
  searchInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  bankNameText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bankSubText: {
    fontSize: 11,
    marginTop: 2,
  },
});
