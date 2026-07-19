import Ionicons from '@expo/vector-icons/Ionicons';
import { StyledText } from '@/components/styled/StyledText';
import { useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type StudentStatus = 'picked' | 'dropped' | 'absent';

type Student = {
  id: number;
  name: string;
};

type RollSheetCardProps = {
  students: Student[];
  maxHeight?: number;
};

const STATUS_ORDER: StudentStatus[] = ['picked', 'dropped', 'absent'];
const STATUS_LABELS: Record<StudentStatus, string> = {
  picked: 'Picked',
  dropped: 'Dropped',
  absent: 'Absent',
};

const RollSheetCard = ({ students, maxHeight = 260 }: RollSheetCardProps) => {
  const [overrideMap, setOverrideMap] = useState<Record<number, StudentStatus>>({});

  const statusMap = useMemo(() => {
    const map: Record<number, StudentStatus> = { ...overrideMap };
    const statuses: StudentStatus[] = ['picked', 'dropped', 'absent'];
    students.forEach(s => {
      if (!(s.id in map)) {
        map[s.id] = statuses[Math.floor(Math.random() * statuses.length)];
      }
    });
    return map;
  }, [students, overrideMap]);

  const cycleStatus = (id: number) => {
    setOverrideMap(prev => {
      const current = prev[id] ?? statusMap[id];
      const idx = STATUS_ORDER.indexOf(current);
      const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
      return { ...prev, [id]: next };
    });
  };

  const counts = {
    picked: students.filter(s => statusMap[s.id] === 'picked').length,
    dropped: students.filter(s => statusMap[s.id] === 'dropped').length,
    absent: students.filter(s => statusMap[s.id] === 'absent').length,
  };

  return (
    <View style={styles.card}>
      <StyledText style={styles.heading}>Roll Sheet</StyledText>

      <View style={styles.tilesRow}>
        {(['picked', 'dropped', 'absent'] as StudentStatus[]).map(status => (
          <View
            key={status}
            style={[
              styles.tile,
              styles[
                `tile${status.charAt(0).toUpperCase() + status.slice(1)}` as keyof typeof styles
              ],
            ]}>
            <StyledText style={styles.tileValue}>{counts[status]}</StyledText>
            <StyledText style={styles.tileLabel}>{STATUS_LABELS[status]}</StyledText>
          </View>
        ))}
      </View>

      <ScrollView style={[styles.list, { maxHeight }]} nestedScrollEnabled>
        {students.map(student => {
          const status = statusMap[student.id];
          const colorKey = (status.charAt(0).toUpperCase() + status.slice(1)) as
            | 'Picked'
            | 'Dropped'
            | 'Absent';
          return (
            <TouchableOpacity
              key={student.id}
              style={styles.row}
              onPress={() => cycleStatus(student.id)}
              activeOpacity={0.7}>
              <View style={styles.avatarSmall}>
                <Ionicons name='person-outline' size={16} color={styles.avatarIcon.color} />
              </View>
              <StyledText style={styles.rowName}>{student.name}</StyledText>
              <View style={[styles.statusBadge, styles[`badge${colorKey}` as keyof typeof styles]]}>
                <StyledText
                  style={[styles.statusText, styles[`text${colorKey}` as keyof typeof styles]]}>
                  {STATUS_LABELS[status]}
                </StyledText>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacings.lg,
    gap: spacings.md,
  },
  heading: {
    fontSize: 16,
    fontFamily: 'RubikSemiBold',
    color: colors.text,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: spacings.sm,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacings.sm,
    borderRadius: 12,
    gap: spacings.xs,
  },
  tilePicked: {
    backgroundColor: colors.success + '20',
  },
  tileDropped: {
    backgroundColor: colors.primary + '20',
  },
  tileAbsent: {
    backgroundColor: colors.disabled + '30',
  },
  tileValue: {
    fontSize: 20,
    fontFamily: 'RubikBold',
    color: colors.text,
  },
  tileLabel: {
    fontSize: 11,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
    textTransform: 'uppercase',
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacings.sm,
    gap: spacings.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '60',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    color: colors.primary,
  },
  rowName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'RubikMedium',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacings.sm,
    paddingVertical: spacings.xs,
    borderRadius: 10,
  },
  badgePicked: {
    backgroundColor: colors.success + '20',
  },
  badgeDropped: {
    backgroundColor: colors.primary + '20',
  },
  badgeAbsent: {
    backgroundColor: colors.disabled + '30',
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'RubikSemiBold',
  },
  textPicked: {
    color: colors.success,
  },
  textDropped: {
    color: colors.primary,
  },
  textAbsent: {
    color: colors.placeholderText,
  },
}));

export default RollSheetCard;
