import Ionicons from '@expo/vector-icons/Ionicons';
import { StyledText } from '@/components/styled/StyledText';
import type { StudentInfo } from '@/types/api/responses.interface';
import { FlatList, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type AttendeesTabProps = {
  students: StudentInfo[];
};

const AttendeesTab = ({ students }: AttendeesTabProps) => {
  return (
    <View style={styles.container}>
      <StyledText style={styles.heading}>Attendees ({students.length})</StyledText>
      <FlatList
        data={students}
        keyExtractor={item => String(item.id)}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Ionicons name='person-outline' size={18} color={styles.avatarIcon.color} />
            </View>
            <StyledText style={styles.name}>{item.name}</StyledText>
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
}));

export default AttendeesTab;
