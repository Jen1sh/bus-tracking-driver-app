import { StyledText } from '@/components/styled/StyledText';
import { formatWallClock, runKey } from '@/lib/date-time';
import { ScheduleDirection, TripStatus } from '@/types/enums';
import { ScheduledRun } from '@/types/api/responses.interface';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const DIRECTION_ICONS: Record<ScheduleDirection, keyof typeof Ionicons.glyphMap> = {
  [ScheduleDirection.PICKUP]: 'arrow-down-circle-outline',
  [ScheduleDirection.DROP]: 'arrow-up-circle-outline',
};

// Theme colour *keys* rather than resolved hex values, so the row follows a theme switch at runtime.
// `as const` keeps the key union narrow enough to index `colors` with.
const STATUS_COLOR_KEYS = {
  [TripStatus.PENDING]: 'placeholderText',
  [TripStatus.ACTIVE]: 'success',
  [TripStatus.COMPLETED]: 'primary',
  [TripStatus.CANCELLED]: 'disabled',
} as const satisfies Record<TripStatus, string>;

const STATUS_LABELS: Record<TripStatus, string> = {
  [TripStatus.PENDING]: 'Not started',
  [TripStatus.ACTIVE]: 'In progress',
  [TripStatus.COMPLETED]: 'Completed',
  [TripStatus.CANCELLED]: 'Cancelled',
};

type RunRowProps = {
  run: ScheduledRun;
  isNext: boolean;
};

const RunRow = ({ run, isNext }: RunRowProps) => {
  const {
    theme: { colors },
  } = useUnistyles();

  // A run whose day has not arrived has no `trips` row: tripId is null, status is null and
  // assignmentFirm is false. The run is real, but the driver on it is only the schedule's *default* —
  // an admin can reassign it on the morning it generates — so it is rendered as provisional and the
  // copy never claims the driver is definitely driving that day.
  const isProjected = !run.assignmentFirm || run.tripId == null;

  return (
    <View style={[styles.row, isNext && styles.rowNext]}>
      <View style={styles.timeBlock}>
        <StyledText style={styles.time}>{formatWallClock(run.departureTime)}</StyledText>
        <StyledText style={styles.busTag} numberOfLines={1}>
          {run.busDisplayId ?? '—'}
        </StyledText>
      </View>

      {run.direction ? (
        <Ionicons name={DIRECTION_ICONS[run.direction]} size={18} color={colors.primary} />
      ) : null}

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <StyledText style={styles.title} numberOfLines={1}>
            {run.label ?? (run.direction === ScheduleDirection.DROP ? 'Drop-off' : 'Pickup')}
          </StyledText>
          {isNext ? <StyledText style={styles.nextTag}>NEXT</StyledText> : null}
        </View>

        <StyledText style={styles.subtitle} numberOfLines={1}>
          {run.routeName ?? 'Route to be confirmed'}
        </StyledText>

        {isProjected ? (
          <View style={styles.provisionalRow}>
            <Ionicons name='help-circle-outline' size={12} color={colors.placeholderText} />
            <StyledText style={styles.provisional}>Provisional — not confirmed yet</StyledText>
          </View>
        ) : (
          <StyledText style={[styles.status, { color: colors[STATUS_COLOR_KEYS[run.status!]] }]}>
            {STATUS_LABELS[run.status!]}
          </StyledText>
        )}
      </View>
    </View>
  );
};

type RunListProps = {
  runs: ScheduledRun[];
  nextKey: string | null;
};

/** One day that has runs. Days the bus does not run are simply absent — no empty placeholder rows. */
const RunList = ({ runs, nextKey }: RunListProps) => (
  <View style={styles.group}>
    {runs.map(run => {
      const key = runKey(run);

      return <RunRow key={key} run={run} isNext={key === nextKey} />;
    })}
  </View>
);

const styles = StyleSheet.create(({ colors, spacings }) => ({
  group: {
    gap: spacings.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacings.sm,
    paddingHorizontal: spacings.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.background,
    gap: spacings.sm,
  },
  rowNext: {
    backgroundColor: colors.primaryTint + '15',
    borderColor: colors.primaryTint + '40',
  },
  timeBlock: {
    width: 52,
    gap: 2,
  },
  time: {
    fontSize: 15,
    fontFamily: 'RubikBold',
    color: colors.text,
  },
  busTag: {
    fontSize: 10,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacings.sm,
  },
  title: {
    flexShrink: 1,
    fontSize: 14,
    fontFamily: 'RubikSemiBold',
    color: colors.text,
  },
  nextTag: {
    fontSize: 9,
    fontFamily: 'RubikBold',
    color: colors.primaryTint,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
  },
  status: {
    fontSize: 11,
    fontFamily: 'RubikSemiBold',
  },
  provisionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  provisional: {
    fontSize: 11,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
  },
}));

export default RunList;
