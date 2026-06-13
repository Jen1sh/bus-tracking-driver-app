import Ionicons from '@expo/vector-icons/Ionicons';
import { StyledText } from '@/components/styled/StyledText';
import { FlatList, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const DUMMY_ATTENDEES = [
  { id: '1', name: 'John Doe', status: 'present' as const },
  { id: '2', name: 'Jane Smith', status: 'present' as const },
  { id: '3', name: 'Bob Johnson', status: 'absent' as const },
  { id: '4', name: 'Alice Williams', status: 'present' as const },
  { id: '5', name: 'Charlie Brown', status: 'absent' as const },
  { id: '6', name: 'Diana Prince', status: 'present' as const },
  { id: '7', name: 'Edward Norton', status: 'present' as const },
  { id: '8', name: 'Fiona Apple', status: 'absent' as const },
];

const AttendeesTab = () => {
  return (
    <View style={styles.container}>
      <StyledText style={styles.heading}>Attendees ({DUMMY_ATTENDEES.length})</StyledText>
      <FlatList
        data={DUMMY_ATTENDEES}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Ionicons name='person-outline' size={18} color={styles.avatarIcon.color} />
            </View>
            <StyledText style={styles.name}>{item.name}</StyledText>
            <View
              style={[
                styles.badge,
                item.status === 'present' ? styles.badgePresent : styles.badgeAbsent,
              ]}>
              <StyledText
                style={[
                  styles.badgeText,
                  item.status === 'present' ? styles.badgeTextPresent : styles.badgeTextAbsent,
                ]}>
                {item.status === 'present' ? 'Present' : 'Absent'}
              </StyledText>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  container: {
    padding: spacings.md,
    gap: spacings.md,
  },
  heading: {
    fontSize: 16,
    fontFamily: 'RubikSemiBold',
    color: colors.text,
  },
  list: {
    gap: spacings.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacings.sm,
    paddingVertical: spacings.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    color: colors.primary,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'RubikMedium',
    color: colors.text,
  },
  badge: {
    paddingHorizontal: spacings.sm,
    paddingVertical: spacings.xs,
    borderRadius: 12,
  },
  badgePresent: {
    backgroundColor: colors.success,
  },
  badgeAbsent: {
    backgroundColor: colors.disabled,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'RubikMedium',
  },
  badgeTextPresent: {
    color: colors.light,
  },
  badgeTextAbsent: {
    color: colors.placeholderText,
  },
}));

export default AttendeesTab;
