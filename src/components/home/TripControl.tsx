import useDriver from '@/hooks/use-driver';
import useTrip from '@/hooks/use-trip';
import { DriverAssignmentResponse } from '@/types/api/responses.interface';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { StyledText } from '@/components/styled/StyledText';

type Action =
  | { kind: 'start' }
  | { kind: 'end' }
  | { kind: 'end-blocker' }
  | { kind: 'none'; reason: string }
  | { kind: 'loading' };

/**
 * The Start/End control is a projection of the server's state, never a local toggle.
 *
 * Deriving it from local state is what makes a killed app come back wrong: after a restart the button
 * would offer "Start Trip" on a bus whose run is already ACTIVE, and the tap would 400. So every
 * branch below reads a field the server computed, and `canStartTrip` is used verbatim — it is the only
 * accurate answer to "would POST /api/trips/start succeed", since it accounts for all three of that
 * call's failure conditions (row is not PENDING, row belongs to a co-driver, a stale ACTIVE trip from
 * another day is blocking the bus).
 */
const resolveAction = (assignment: DriverAssignmentResponse, hasUpcomingRun: boolean): Action => {
  if (assignment.onDuty) {
    return { kind: 'end' };
  }

  if (assignment.canStartTrip) {
    return { kind: 'start' };
  }

  if (assignment.blockedByTripId != null) {
    return { kind: 'end-blocker' };
  }

  if (assignment.tripId == null) {
    // A non-running day is a 200 with an empty day, not a failure. Nothing to start, nothing to
    // retry, and no error styling — just an honest answer.
    //
    // Two claims, deliberately. With a run coming up, "No run today" is about *this* button and pairs
    // with the departure card naming when the driver is next needed. With nothing in the horizon at
    // all, "No runs scheduled" is a fact about the whole window and is worth saying in full.
    return {
      kind: 'none',
      reason: hasUpcomingRun ? 'No run today' : 'No runs scheduled today',
    };
  }

  if (assignment.tripStatus === 'COMPLETED' || assignment.tripStatus === 'CANCELLED') {
    return { kind: 'none', reason: "Today's run is already finished" };
  }

  if (assignment.tripStatus === 'PENDING') {
    return { kind: 'none', reason: 'Another driver holds this run' };
  }

  return { kind: 'none', reason: 'Pull down to refresh your assignment' };
};

type TripControlProps = {
  assignment: DriverAssignmentResponse;
  /**
   * Whether a run exists anywhere in the projection horizon.
   *
   * Only used to word the empty state. The button's decision itself never consults it — Start and End
   * act strictly on today's materialised run, which is what the assignment payload describes.
   */
  hasUpcomingRun: boolean;
};

const TripControl = ({ assignment, hasUpcomingRun }: TripControlProps) => {
  const { useStartTrip, useEndTrip } = useTrip();
  const { useCurrentTrip } = useDriver();
  const { mutate: start, isPending: isStarting } = useStartTrip();
  const { mutate: end, isPending: isEnding } = useEndTrip();
  // Not local state — the server's answer about what is actually running right now. This is what
  // disambiguates an End when the driver happens to hold two ACTIVE trips.
  const { data: currentTrip } = useCurrentTrip();

  const isPending = isStarting || isEnding;

  if (isPending) {
    return (
      <View style={styles.btn}>
        <ActivityIndicator color='#f7f7f7' />
      </View>
    );
  }

  const action = resolveAction(assignment, hasUpcomingRun);

  if (action.kind === 'none') {
    return (
      <View style={styles.blocked}>
        <StyledText style={styles.blockedText}>{action.reason}</StyledText>
      </View>
    );
  }

  const isEnd = action.kind !== 'start';

  const onPress = () => {
    if (action.kind === 'start') {
      start();
    } else if (action.kind === 'end') {
      // The current-trip id rather than the assignment's, because the two can disagree after a
      // mid-day reassignment — and it is the id the server requires when two trips are ACTIVE.
      end(currentTrip?.tripId);
    } else {
      // A stale ACTIVE trip on this bus, typically left over from a previous day. Not date-scoped, so
      // ending it by id is the only way to unblock the bus from inside the app.
      end(assignment.blockedByTripId!);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.btn, isEnd && styles.btnEnd]}>
      <StyledText style={styles.btnLabel}>
        {action.kind === 'start'
          ? 'Start Trip'
          : action.kind === 'end'
            ? 'End Trip'
            : 'End Previous Trip'}
      </StyledText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  btn: {
    marginHorizontal: spacings.md,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  btnEnd: {
    backgroundColor: colors.secondary,
  },
  btnLabel: {
    fontSize: 15,
    fontFamily: 'RubikSemiBold',
    color: colors.light,
  },
  blocked: {
    marginHorizontal: spacings.md,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.disabled + '30',
  },
  blockedText: {
    fontSize: 14,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
  },
}));

export default TripControl;
