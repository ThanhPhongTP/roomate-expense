import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Category } from '../../models/category';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';

interface CategoryPickerProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Danh mục chi tiêu</Text>
      <View style={styles.grid}>
        {categories.map((cat) => {
          const isSelected = cat.id === selectedCategoryId;
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.75}
              onPress={() => onSelectCategory(cat.id)}
              style={[
                styles.catItem,
                {
                  backgroundColor: isSelected
                    ? isDark
                      ? `${cat.color}35`
                      : `${cat.color}15`
                    : theme.colors.surface,
                  borderColor: isSelected ? cat.color : theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
            >
              <Text style={styles.icon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.catName,
                  {
                    color: isSelected ? theme.colors.textPrimary : theme.colors.textSecondary,
                    fontWeight: isSelected ? '700' : '400',
                  },
                ]}
                numberOfLines={1}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  catItem: {
    width: '31%',
    margin: '1.1%',
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  icon: {
    fontSize: 22,
    marginBottom: 4,
  },
  catName: {
    fontSize: 11,
    textAlign: 'center',
  },
});
