import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Member } from '../../models/member';
import { Chip } from '../common/Chip';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';

interface ParticipantSelectorProps {
  members: Member[];
  selectedParticipantIds: string[];
  onToggleParticipant: (memberId: string) => void;
  onSelectAll: () => void;
  error?: string;
}

export const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  members,
  selectedParticipantIds,
  onToggleParticipant,
  onSelectAll,
  error,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const allSelected = members.length > 0 && selectedParticipantIds.length === members.length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Người tham gia chia tiền ({selectedParticipantIds.length}/{members.length})
        </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onSelectAll}>
          <Text style={[styles.selectAllText, { color: theme.colors.primary }]}>
            {allSelected ? 'Bỏ chọn hết' : 'Chọn tất cả'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chipRow}>
        {members.map((m) => {
          const isSelected = selectedParticipantIds.includes(m.id);
          return (
            <Chip
              key={m.id}
              color={m.color}
              label={m.name}
              selected={isSelected}
              onPress={() => onToggleParticipant(m.id)}
            />
          );
        })}
      </View>

      {error ? <Text style={[styles.errorText, { color: theme.colors.debtor }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  selectAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
