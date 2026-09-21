import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { getTheme } from '../theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';

interface AboutScreenProps {
  navigation: any;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ navigation }) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header onBack={() => navigation.goBack()} title="Giới thiệu ứng dụng" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBox}>
          <Text style={{ fontSize: 54, marginBottom: 12 }}>🏠💸</Text>
          <Text style={[styles.appName, { color: theme.colors.textPrimary }]}>
            RoomSplit
          </Text>
          <Text style={[styles.appVer, { color: theme.colors.textMuted }]}>
            Version 1.0.0 (Production Ready)
          </Text>
        </View>

        <Card style={styles.card}>
          <Text style={[styles.sectionHeading, { color: theme.colors.textPrimary }]}>
            🎯 Mục tiêu dự án
          </Text>
          <Text style={[styles.bodyText, { color: theme.colors.textSecondary }]}>
            Ứng dụng giúp các nhóm bạn ở chung phòng trọ/căn hộ dễ dàng ghi chép và tự động tính toán sòng phẳng mọi khoản chi tiêu hàng tháng, loại bỏ hoàn toàn tính toán thủ công hay sổ sách phức tạp.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.sectionHeading, { color: theme.colors.textPrimary }]}>
            🚀 Công nghệ & Kiến trúc (Tech Stack)
          </Text>
          <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>• React Native & TypeScript</Text>
          <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>• State Management: Zustand</Text>
          <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>• Navigation: React Navigation</Text>
          <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>• Storage: Offline-First Repository Pattern</Text>
          <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>• Validation: Zod & React Hook Form</Text>
          <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>• Debt Algorithm: Greedy Min Transaction Optimizer</Text>
          <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>• Design System: Material 3 + Apple HIG Inspired</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.sectionHeading, { color: theme.colors.textPrimary }]}>
            🔒 Bảo mật & Dữ liệu
          </Text>
          <Text style={[styles.bodyText, { color: theme.colors.textSecondary }]}>
            Dữ liệu được lưu trữ offline hoàn toàn trên thiết bị của bạn. Kiến trúc Repository Layer sẵn sàng kết nối với Google Apps Script, Firebase hoặc Node.js server khi cần mở rộng.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  appVer: {
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 22,
  },
});
