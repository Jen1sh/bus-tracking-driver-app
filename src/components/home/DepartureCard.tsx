import { formatLocalDateTimeTime, formatRunDate, formatWallClock } from '@/lib/date-time';
import { ScheduledRun } from '@/types/api/responses.interface';
import { ScheduleDirection } from '@/types/enums';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyledText } from '@/components/styled/StyledText';

type DepartureCardProps = {
  /**
   * Today's run, from the assignment payload. The *planned* departure as a LocalDateTime.
   *
   * This is the fallback, not the primary: `nextRun` is preferred whenever it exists, because the
   * schedule endpoint is the one that knows about runs beyond today.
   */
  todayDeparture: string | null;
  /**
   * The *actual* departure of the live trip. Null until the trip is running.
   *
   * Only ever shown alongside a `nextRun` that IS that trip — matched by id, so a future run can never
   * inherit today's "left 07:41" chip.
   */
  liveTripId: number | null;
  liveStartedAt: string | null;
  /**
   * The run the driver is next in front of, across the whole projection horizon — so this can be days
   * away, and can be on a bus other than today's.
   */
  nextRun: ScheduledRun | null;
  /**
   * Whether this bus has any run today at all.
   *
   * The single source of truth for "is today empty", and deliberately separate from whether a
   * departure *time* exists — those are different questions with different answers.
   */
  hasTodayRun: boolean;
  /**
   * The `tripId`s the server reported as belonging to today.
   *
   * Used to tell a `nextRun` that is today's run from one that is still days out, without consulting
   * any clock: the device's calendar day is not the server's, and the backend decides "today" from its
   * own configured timezone.
   */
  todaysRunIds: ReadonlySet<number>;
};

/** `direction` is authoritative. `Bus.shift` ("AM"/"PM") describes the bus, not the run. */
const DIRECTION_LABELS: Record<ScheduleDirection, string> = {
  [ScheduleDirection.PICKUP]: 'Morning pickup',
  [ScheduleDirection.DROP]: 'Afternoon drop',
};

export const directionLabel = (direction: ScheduleDirection | null) =>
  direction ? DIRECTION_LABELS[direction] : null;

const runTitle = (run: ScheduledRun) =>
  run.label ?? (run.direction === ScheduleDirection.DROP ? 'Drop-off' : 'Pickup');

const DepartureCard = ({
  todayDeparture,
  liveTripId,
  liveStartedAt,
  nextRun,
  hasTodayRun,
  todaysRunIds,
}: DepartureCardProps) => {
  if (nextRun) {
    // The card's meaning is decided by whether the server has already materialised this run among
    // today's, not by which endpoint supplied it and not by comparing dates on the device. A run today
    // is this shift's departure; anything else is the next one the driver is needed for.
    const isTodayRun = nextRun.tripId != null && todaysRunIds.has(nextRun.tripId);

    // Matched by id rather than by "is a trip live", so the actual-departure chip cannot appear on a
    // run that has not happened yet.
    const showLeftChip =
      liveTripId != null && nextRun.tripId === liveTripId && liveStartedAt != null;

    // A run whose day has not arrived has no `trips` row. The driver on it is only the schedule's
    // *default* and an admin can reassign it on the morning it generates, so it is never presented as
    // a confirmed booking.
    const isProvisional = !nextRun.assignmentFirm || nextRun.tripId == null;

    return (
      <View style={styles.card}>
        <StyledText style={styles.label}>
          {isTodayRun ? 'SCHEDULED DEPARTURE' : 'NEXT RUN'}
        </StyledText>

        <View style={styles.timeRow}>
          <Ionicons name='time-outline' size={20} color={styles.icon.color} />
          <StyledText style={styles.time}>{formatWallClock(nextRun.departureTime)}</StyledText>
          {showLeftChip ? (
            <View style={styles.actualChip}>
              <Ionicons name='flag-outline' size={12} color={styles.actualChipText.color} />
              <StyledText style={styles.actualChipText}>
                left {formatLocalDateTimeTime(liveStartedAt)}
              </StyledText>
            </View>
          ) : null}
        </View>

        {/* An absolute date, not "Tomorrow". The relative form is computed from the device's calendar
            day, which is not the server's — it would call a run "Tomorrow" while the server still
            considers it two days out. For a run the driver is planning around, the exact date is both
            correct and more useful. The Schedule tab keeps the relative form, where the list is
            browsable and a day either way is unambiguous. */}
        <StyledText style={styles.date}>
          {isTodayRun ? runTitle(nextRun) : formatRunDate(nextRun.date)}
        </StyledText>

        {isProvisional ? (
          <View style={styles.provisionalRow}>
            <Ionicons name='help-circle-outline' size={12} color={styles.provisionalIcon.color} />
            <StyledText style={styles.provisional}>Provisional — not confirmed yet</StyledText>
          </View>
        ) : (
          <StyledText style={styles.date} numberOfLines={1}>
            {[nextRun.busDisplayId, nextRun.routeName].filter(Boolean).join(' · ') ||
              runTitle(nextRun)}
          </StyledText>
        )}
      </View>
    );
  }

  // `nextRun` is null whenever every run in the horizon is finished, or the horizon is empty. That can
  // still coincide with a live, startable run today — a single 07:30 PENDING run at 09:00 is skipped as
  // already-departed, leaving the horizon empty — so today's own departure has to be the fallback
  // rather than an empty card.
  //
  // The condition is `hasTodayRun`, NOT `todayDeparture != null`. A run whose planned departure was
  // never set — an admin-created or seeded row — has a null time, and treating that as "no run" is how
  // this card ends up claiming a quiet day directly above a button saying the run is already finished.
  if (hasTodayRun) {
    return (
      <View style={styles.card}>
        <StyledText style={styles.label}>SCHEDULED DEPARTURE</StyledText>
        <View style={styles.timeRow}>
          <Ionicons name='time-outline' size={20} color={styles.icon.color} />
          {/* A run with no planned time renders as `--:--`, which is honest: the run is real, the
              schedule simply never set a departure for it. */}
          <StyledText style={styles.time}>{formatLocalDateTimeTime(todayDeparture)}</StyledText>
          {liveStartedAt != null && liveTripId != null ? (
            <View style={styles.actualChip}>
              <Ionicons name='flag-outline' size={12} color={styles.actualChipText.color} />
              <StyledText style={styles.actualChipText}>
                left {formatLocalDateTimeTime(liveStartedAt)}
              </StyledText>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <StyledText style={styles.label}>SCHEDULED DEPARTURE</StyledText>
      <StyledText style={styles.none}>No runs scheduled today</StyledText>
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacings.md,
    gap: 4,
    marginHorizontal: spacings.md,
  },
  label: {
    fontSize: 10,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
    letterSpacing: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacings.sm,
  },
  icon: {
    color: colors.primary,
  },
  time: {
    fontSize: 22,
    fontFamily: 'RubikBold',
    color: colors.primary,
  },
  actualChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacings.sm,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: colors.success + '20',
  },
  actualChipText: {
    fontSize: 11,
    fontFamily: 'RubikSemiBold',
    color: colors.success,
  },
  date: {
    fontSize: 12,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
  },
  provisionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  provisionalIcon: {
    color: colors.placeholderText,
  },
  provisional: {
    fontSize: 11,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
  },
  none: {
    fontSize: 15,
    fontFamily: 'RubikSemiBold',
    color: colors.placeholderText,
  },
}));

export default DepartureCard;
