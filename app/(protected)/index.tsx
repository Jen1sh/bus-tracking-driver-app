import BusDetailCard from '@/components/home/BusDetailCard';
import DepartureCard, { directionLabel } from '@/components/home/DepartureCard';
import GreetingHeader from '@/components/home/GreetingHeader';
import RouteShiftCard from '@/components/home/RouteShiftCard';
import TripControl from '@/components/home/TripControl';
import { StyledText } from '@/components/styled/StyledText';
import useDriver from '@/hooks/use-driver';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, AppState, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

const Home = () => {
  const insets = useSafeAreaInsets();
  const { useAssignment, useCurrentTrip, useSchedule } = useDriver();
  const { data: assignment, isLoading, isError, refetch, isRefetching } = useAssignment();
  const { data: currentTrip } = useCurrentTrip();
  // A pure read with no side effects, so it is safe to read alongside the dashboard. It is already
  // cached from the Schedule tab, and it is what knows about runs beyond today.
  const { data: schedule } = useSchedule();
  const [refreshing, setRefreshing] = useState(false);

  // The dashboard is the only endpoint that materialises today's trip rows, and canStartTrip goes
  // stale the moment an admin reassigns a run — so it is re-read on every foreground, not just on
  // mount. Leaving a cached answer in place would offer a Start button that reliably 400s.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void refetch();
      }
    });

    return () => subscription.remove();
  }, [refetch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  if (isError || !assignment) {
    return (
      <View style={styles.centered}>
        <StyledText style={styles.errorTitle}>Could not load your assignment</StyledText>
        <StyledText style={styles.errorBody}>
          Check your connection and try again. If this keeps happening, contact your school.
        </StyledText>
        <View style={styles.retryBtn} onTouchEnd={() => refetch()}>
          <StyledText style={styles.retryLabel}>Retry</StyledText>
        </View>
      </View>
    );
  }

  // `current` marks the run the rest of the payload describes, so the "N of M" position comes from the
  // server's own index rather than a count of PENDING rows. Exactly one entry is current, or none.
  const currentRunIndex = assignment.todaysRuns.findIndex(run => run.current);
  const currentRunNumber = currentRunIndex >= 0 ? currentRunIndex + 1 : null;

  // Does this bus run today? `todaysRuns` is the only dependable signal — NOT
  // `scheduledDeparture != null`. That column is nullable on admin-created and seeded rows, so it can
  // be null while a run very much exists, which is how the card and the Start button end up
  // contradicting each other. The backend guarantees the list is non-empty whenever a run is present.
  const hasTodayRun = assignment.todaysRuns.length > 0;

  // The run the driver is next in front of, across the whole 14-day horizon — so this is usually, but
  // not always, today's. Preferred over the assignment's own departure time because only this endpoint
  // knows about runs beyond today. It is null when everything in the horizon is finished, which can
  // still coincide with a startable run today, so it is not sufficient on its own either.
  const nextRun = schedule?.next ?? null;

  // Whether `nextRun` is part of *today*, decided by the server's own rows rather than by any clock.
  //
  // The device's calendar day cannot be used here: the backend runs on `app.timezone` (Asia/Kathmandu)
  // and decides what "already departed" means from *its* clock, so a phone in another timezone would
  // label a run the server considers today's as tomorrow's. A run's `tripId` is null until the day
  // arrives and its row is generated, and today's rows are exactly `todaysRuns` — so membership here is
  // the server telling us directly which runs are today's, with no timezone arithmetic involved.
  const todaysRunIds = new Set(assignment.todaysRuns.map(run => run.tripId));

  console.log('nextRun', schedule?.next);

  return (
    <View style={styles.container}>
      <StatusBar style='dark' />
      <ScrollView
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing || isRefetching} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.contentContainer}>
        <GreetingHeader
          name={assignment.driverName ?? 'Driver'}
          status={assignment.onDuty ? 'on-duty' : 'off-duty'}
          topInset={insets.top}
        />

        <RouteShiftCard
          routeName={assignment.routeName}
          directionLabel={directionLabel(assignment.direction)}
          studentCount={assignment.studentCount}
          stopCount={assignment.stopCount}
          runCount={assignment.todaysRuns.length}
          currentRunNumber={currentRunNumber}
        />

        {/* Two sources, one decision, made inside the card. `next` answers "when am I next needed" and
            can be days out; the assignment's `scheduledDeparture` answers "when does today's run leave"
            and is the fallback for the case where the horizon is empty but today still has a run.
            `startedAt` is the actual departure and exists only once a trip is live. These are three
            separate columns server-side and must never be derived from one another. */}
        <DepartureCard
          todayDeparture={assignment.scheduledDeparture}
          liveTripId={currentTrip?.tripId ?? null}
          liveStartedAt={currentTrip?.startedAt ?? null}
          nextRun={nextRun}
          hasTodayRun={hasTodayRun}
          todaysRunIds={todaysRunIds}
        />

        <BusDetailCard
          displayId={assignment.bus.displayId}
          plate={assignment.bus.plate}
          studentCount={assignment.studentCount}
        />

        <TripControl assignment={assignment} hasUpcomingRun={nextRun != null} />

        {assignment.todaysRuns.length > 1 ? (
          <StyledText style={styles.dayHint}>
            {assignment.todaysRuns.length} runs on this bus today
          </StyledText>
        ) : null}

        <View style={{ height: insets.bottom + 16 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacings.sm,
    padding: spacings.lg,
    backgroundColor: colors.background,
  },
  contentContainer: {
    gap: spacings.sm,
    paddingBottom: 0,
  },
  errorTitle: {
    fontSize: 16,
    fontFamily: 'RubikSemiBold',
    color: colors.text,
  },
  errorBody: {
    fontSize: 13,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: spacings.sm,
    paddingHorizontal: spacings.lg,
    paddingVertical: spacings.sm,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  retryLabel: {
    fontSize: 14,
    fontFamily: 'RubikSemiBold',
    color: colors.light,
  },
  dayHint: {
    fontSize: 11,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
    textAlign: 'center',
  },
}));

export default Home;
