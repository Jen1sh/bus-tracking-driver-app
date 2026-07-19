import { StyledText } from '@/components/styled/StyledText';
import useTrip from '@/hooks/use-trip';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type StudentStatus = 'picked' | 'dropped' | 'absent';

const AVATAR_COLORS = [
  '#02384A',
  '#066B64',
  '#ED5932',
  '#206F79',
  '#C51E3A',
  '#228B22',
  '#5B2C8E',
  '#E67E22',
];

const SEGMENTS: { key: StudentStatus; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'picked', icon: 'checkmark-outline' },
  { key: 'dropped', icon: 'home-outline' },
  { key: 'absent', icon: 'close-outline' },
];

const FILTERS: { key: StudentStatus; label: string; color: string }[] = [
  { key: 'picked', label: 'Picked', color: '#228B22' },
  { key: 'dropped', label: 'Dropped', color: '#02384A' },
  { key: 'absent', label: 'Absent', color: '#C51E3A' },
];

const AttendeesScreen = () => {
  const insets = useSafeAreaInsets();
  const { useNextScheduleAttendees } = useTrip();
  const { data: attendees } = useNextScheduleAttendees();
  const [statusMap, setStatusMap] = useState<Record<number, StudentStatus>>({});
  const [filter, setFilter] = useState<StudentStatus | null>(null);

  const {
    theme: { colors },
  } = useUnistyles();

  useEffect(() => {
    if (attendees) {
      const map: Record<number, StudentStatus> = {};
      const statuses: StudentStatus[] = ['picked', 'dropped', 'absent'];
      attendees.students.forEach(s => {
        map[s.id] = statuses[Math.floor(Math.random() * statuses.length)];
      });
      setStatusMap(map);
    }
  }, [attendees]);

  if (!attendees) return null;

  const setStatus = (id: number, status: StudentStatus) => {
    setStatusMap(prev => ({ ...prev, [id]: status }));
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const students = attendees.students;
  const filtered = filter ? students.filter(s => statusMap[s.id] === filter) : students;
  const counts = {
    picked: students.filter(s => statusMap[s.id] === 'picked').length,
    dropped: students.filter(s => statusMap[s.id] === 'dropped').length,
    absent: students.filter(s => statusMap[s.id] === 'absent').length,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style='dark' />
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.filterRow}>
            {FILTERS.map(f => {
              const active = filter === f.key;
              const key = (f.key.charAt(0).toUpperCase() + f.key.slice(1)) as
                | 'Picked'
                | 'Dropped'
                | 'Absent';
              return (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setFilter(active ? null : f.key)}
                  activeOpacity={0.7}
                  style={[
                    styles.filterSeg,
                    active && (styles[`seg${key}` as keyof typeof styles] as object),
                  ]}>
                  <StyledText style={[styles.filterCount, { color: active ? '#fff' : f.color }]}>
                    {counts[f.key]}
                  </StyledText>
                  <StyledText
                    style={[
                      styles.filterLabel,
                      { color: active ? '#fff' : colors.placeholderText },
                    ]}>
                    {f.label}
                  </StyledText>
                </TouchableOpacity>
              );
            })}
          </View>
        }
        renderItem={({ item }) => {
          const status = statusMap[item.id] ?? 'picked';
          const avatarColor = AVATAR_COLORS[item.id % AVATAR_COLORS.length];
          return (
            <View style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                <StyledText style={styles.initials}>{getInitials(item.name)}</StyledText>
              </View>
              <View style={styles.nameBlock}>
                <StyledText style={styles.name}>{item.name}</StyledText>
                <StyledText style={styles.caption}>
                  {item.class}.{item.stop}
                </StyledText>
              </View>
              <View style={styles.switch}>
                {SEGMENTS.map(seg => {
                  const active = status === seg.key;
                  const segKey = (seg.key.charAt(0).toUpperCase() + seg.key.slice(1)) as
                    | 'Picked'
                    | 'Dropped'
                    | 'Absent';
                  return (
                    <TouchableOpacity
                      key={seg.key}
                      onPress={() => setStatus(item.id, seg.key)}
                      activeOpacity={0.7}
                      style={[
                        styles.seg,
                        active && (styles[`seg${segKey}` as keyof typeof styles] as object),
                      ]}>
                      <Ionicons
                        name={seg.icon}
                        size={16}
                        color={active ? '#fff' : styles.inactiveSeg.color}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create(({ colors }) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterSeg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  filterCount: {
    fontSize: 16,
    fontFamily: 'RubikBold',
  },
  filterLabel: {
    fontSize: 11,
    fontFamily: 'RubikMedium',
    textTransform: 'uppercase',
  },
  segPicked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  segDropped: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segAbsent: {
    backgroundColor: colors.error,
    borderColor: colors.error,
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
  inactiveSeg: {
    color: colors.placeholderText,
  },
}));

export default AttendeesScreen;
