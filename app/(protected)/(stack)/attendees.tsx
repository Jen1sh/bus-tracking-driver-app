import { StyledText } from '@/components/styled/StyledText';
import useDriver from '@/hooks/use-driver';
import { AttendanceStatus } from '@/types/enums';
import { RollSheetEntry } from '@/types/api/responses.interface';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

type Markable = AttendanceStatus.ONBOARD | AttendanceStatus.DROPPED | AttendanceStatus.ABSENT;

/**
 * The order a driver cycles through, as a lookup rather than an array: `NOT_TODAY` is not part of the
 * cycle, it is the clear-back-to-unmarked state reached by tapping past ABSENT.
 */
const NEXT_IN_CYCLE: Record<Markable, Markable | AttendanceStatus.NOT_TODAY> = {
  [AttendanceStatus.ONBOARD]: AttendanceStatus.DROPPED,
  [AttendanceStatus.DROPPED]: AttendanceStatus.ABSENT,
  [AttendanceStatus.ABSENT]: AttendanceStatus.NOT_TODAY,
};

const SEGMENTS: { key: Markable; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: AttendanceStatus.ONBOARD, icon: 'checkmark-outline', color: 'success' },
  { key: AttendanceStatus.DROPPED, icon: 'home-outline', color: 'primary' },
  { key: AttendanceStatus.ABSENT, icon: 'close-outline', color: 'error' },
];

const FILTERS = [
  { key: AttendanceStatus.ONBOARD, label: 'Picked', color: 'success' },
  { key: AttendanceStatus.DROPPED, label: 'Dropped', color: 'primary' },
  { key: AttendanceStatus.ABSENT, label: 'Absent', color: 'error' },
] as const;

const AvatarPalette = ['#02384A', '#066B64', '#ED5932', '#206F79', '#C51E3A', '#228B22'];

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const AttendeesScreen = () => {
  const insets = useSafeAreaInsets();
  const { useRollSheet, useCommitRollSheet } = useDriver();
  const { data: rollSheet, isLoading, isError } = useRollSheet();
  const { mutate: commit, isPending } = useCommitRollSheet();
  // A staged value includes NOT_TODAY because that is a legitimate stage — tapping an already-set
  // status clears the student back to unmarked — and it has to survive to the commit request.
  const [staged, setStaged] = useState<Record<number, Markable | AttendanceStatus.NOT_TODAY>>({});
  const [filter, setFilter] = useState<AttendanceStatus | null>(null);

  /**
   * Staged edits are keyed on studentId and layered over the server's sheet, so the driver can review
   * before committing. Reset whenever a fresh sheet arrives — otherwise edits made against a previous
   * trip's roster would be re-sent against this one.
   */
  useEffect(() => {
    setStaged({});
  }, [rollSheet?.tripId]);

  const statusOf = useCallback(
    (student: RollSheetEntry): AttendanceStatus => staged[student.studentId] ?? student.status,
    [staged],
  );

  const mark = (student: RollSheetEntry) => {
    const stagedStatus = staged[student.studentId];

    let nextStatus: Markable | AttendanceStatus.NOT_TODAY;

    if (stagedStatus === undefined || stagedStatus === AttendanceStatus.NOT_TODAY) {
      // Nothing usable staged: the server's own value is left untouched and the tap claims ONBOARD
      // outright, rather than stepping in from wherever the server happened to leave it.
      nextStatus = AttendanceStatus.ONBOARD;
    } else {
      nextStatus = NEXT_IN_CYCLE[stagedStatus];
    }

    setStaged(prev => ({ ...prev, [student.studentId]: nextStatus }));
  };

  const students = useMemo(() => {
    if (!rollSheet) {
      return [];
    }

    const withStatus = rollSheet.students.map(student => ({ student, status: statusOf(student) }));

    return filter ? withStatus.filter(row => row.status === filter) : withStatus;
  }, [rollSheet, filter, statusOf]);

  // Counts reflect what is on screen, including staged edits — not the server's totals, which would
  // disagree with the sheet the moment a driver touches a toggle.
  const counts = useMemo(() => {
    const base = {
      [AttendanceStatus.ONBOARD]: 0,
      [AttendanceStatus.DROPPED]: 0,
      [AttendanceStatus.ABSENT]: 0,
    };

    rollSheet?.students.forEach(student => {
      const status = statusOf(student);
      if (status in base) {
        base[status as Markable] += 1;
      }
    });

    return base;
  }, [rollSheet, statusOf]);

  const onCommit = () => {
    const entries = Object.entries(staged).map(([studentId, status]) => ({
      studentId: Number(studentId),
      status,
    }));

    if (entries.length === 0) {
      return;
    }

    commit(entries, { onSuccess: () => setStaged({}) });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  if (isError || !rollSheet) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StyledText style={styles.title}>Could not load the roll sheet</StyledText>
        <StyledText style={styles.caption}>Open Home first, then try again.</StyledText>
      </View>
    );
  }

  const hasStaged = Object.keys(staged).length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style='dark' />
      <FlatList
        data={students}
        keyExtractor={row => String(row.student.studentId)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.filterRow}>
              {FILTERS.map(f => {
                const active = filter === f.key;

                return (
                  <TouchableOpacity
                    key={f.key}
                    onPress={() => setFilter(active ? null : f.key)}
                    activeOpacity={0.7}
                    style={[styles.filterSeg, active && FILTER_SEG_STYLES[f.label]]}>
                    <StyledText style={styles.filterCount}>{counts[f.key]}</StyledText>
                    <StyledText style={styles.filterLabel}>{f.label}</StyledText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.totalsRow}>
              <StyledText style={styles.caption}>
                {rollSheet.totals.accountedFor} of {rollSheet.totals.total} accounted for
              </StyledText>
              {!rollSheet.editable ? (
                <StyledText style={styles.readOnlyTag}>
                  {rollSheet.tripStatus === 'ACTIVE' ? 'Read only' : 'Review only'}
                </StyledText>
              ) : null}
            </View>
          </View>
        }
        ListFooterComponent={
          rollSheet.editable ? (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!hasStaged || isPending}
              onPress={onCommit}
              style={[styles.updateBtn, (!hasStaged || isPending) && styles.updateBtnDisabled]}>
              <StyledText style={styles.updateLabel}>
                {isPending ? 'Updating…' : hasStaged ? 'Update' : 'No changes'}
              </StyledText>
            </TouchableOpacity>
          ) : null
        }
        renderItem={({ item: { student, status } }) => (
          <View style={styles.row}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: AvatarPalette[student.studentId % AvatarPalette.length] },
              ]}>
              <StyledText style={styles.initials}>{getInitials(student.name)}</StyledText>
            </View>
            <View style={styles.nameBlock}>
              <StyledText style={styles.name}>{student.name}</StyledText>
              <StyledText style={styles.caption}>
                {[student.klass, student.stopLabel ?? 'No checkpoint'].join(' · ')}
              </StyledText>
            </View>
            <View style={styles.switch}>
              {SEGMENTS.map(seg => {
                const active = status === seg.key;

                return (
                  <TouchableOpacity
                    key={seg.key}
                    onPress={() => mark(student)}
                    activeOpacity={0.7}
                    style={[styles.seg, active && SEG_STYLES[seg.key]]}>
                    <Ionicons name={seg.icon} size={16} color={active ? '#fff' : seg.color} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacings.xs,
  },
  list: {
    padding: spacings.md,
    gap: 10,
  },
  header: {
    gap: spacings.sm,
    marginBottom: spacings.xs,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacings.sm,
  },
  filterSeg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacings.sm,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  segPicked: { backgroundColor: colors.success },
  segDropped: { backgroundColor: colors.primary },
  segAbsent: { backgroundColor: colors.error },
  filterCount: {
    fontSize: 16,
    fontFamily: 'RubikBold',
    color: colors.text,
  },
  filterLabel: {
    fontSize: 11,
    fontFamily: 'RubikMedium',
    textTransform: 'uppercase',
  },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readOnlyTag: {
    fontSize: 10,
    fontFamily: 'RubikBold',
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 13,
    fontFamily: 'RubikBold',
    color: '#fff',
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontFamily: 'RubikMedium',
    color: colors.text,
  },
  caption: {
    fontSize: 11,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
  },
  title: {
    fontSize: 16,
    fontFamily: 'RubikSemiBold',
    color: colors.text,
  },
  switch: {
    flexDirection: 'row',
    gap: 4,
  },
  seg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBtn: {
    marginTop: spacings.sm,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  updateBtnDisabled: {
    backgroundColor: colors.disabled,
  },
  updateLabel: {
    fontSize: 15,
    fontFamily: 'RubikSemiBold',
    color: colors.light,
  },
}));

// Indexed by value rather than by a computed style key: `styles[key as keyof typeof styles]` widens to
// the union of every style value in the sheet, which is not assignable to ViewStyle.
const FILTER_SEG_STYLES = {
  Picked: styles.segPicked,
  Dropped: styles.segDropped,
  Absent: styles.segAbsent,
} as const;

const SEG_STYLES: Record<Markable, ViewStyle> = {
  [AttendanceStatus.ONBOARD]: styles.segPicked,
  [AttendanceStatus.DROPPED]: styles.segDropped,
  [AttendanceStatus.ABSENT]: styles.segAbsent,
};

export default AttendeesScreen;
