import RunList from '@/components/schedule/RunList';
import { StyledText } from '@/components/styled/StyledText';
import useDriver from '@/hooks/use-driver';
import { formatRunDateRelative, formatWallClock, runKey, todayIsoDate } from '@/lib/date-time';
import { ScheduledRun } from '@/types/api/responses.interface';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

type DayGroup = {
  date: string;
  runs: ScheduledRun[];
};

const Schedule = () => {
  const insets = useSafeAreaInsets();
  const { useSchedule } = useDriver();
  const { data: schedule, isLoading, isError, refetch, isRefetching } = useSchedule();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  /**
   * Grouped client-side on `date`, preserving the order the server sent: date ascending, then planned
   * time ascending with nulls last. Re-sorting here would fight the guaranteed ordering and could
   * reorder the legacy no-departure-time rows the server deliberately parks at the end of their day.
   */
  const groups = useMemo<DayGroup[]>(() => {
    if (!schedule) {
      return [];
    }

    return schedule.upcoming.reduce<DayGroup[]>((acc, run) => {
      const last = acc[acc.length - 1];

      if (last && last.date === run.date) {
        last.runs.push(run);
      } else {
        acc.push({ date: run.date, runs: [run] });
      }

      return acc;
    }, []);
  }, [schedule]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  if (isError || !schedule) {
    return (
      <View style={styles.centered}>
        <StyledText style={styles.errorTitle}>Could not load your schedule</StyledText>
        <StyledText style={styles.errorBody}>Pull to try again.</StyledText>
      </View>
    );
  }

  const { next, horizonDays } = schedule;
  const nextKey = next ? runKey(next) : null;
  const today = todayIsoDate();

  return (
    <View style={styles.container}>
      <StatusBar style='dark' />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing || isRefetching} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.content}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <StyledText style={styles.title}>My Schedule</StyledText>
          <StyledText style={styles.subtitle}>
            {groups.length > 0
              ? `Next ${horizonDays} days`
              : `No runs in the next ${horizonDays} days`}
          </StyledText>
        </View>

        {next ? (
          <View style={styles.nextCard}>
            <StyledText style={styles.nextLabel}>NEXT RUN</StyledText>
            <StyledText style={styles.nextTitle}>
              {next.label ?? (next.direction === 'DROP' ? 'Drop-off' : 'Pickup')}
            </StyledText>
            <StyledText style={styles.nextMeta}>
              {formatRunDateRelative(next.date)} · {formatWallClock(next.departureTime)}
              {next.busDisplayId ? ` · ${next.busDisplayId}` : ''}
            </StyledText>
          </View>
        ) : (
          <View style={styles.nextCard}>
            <StyledText style={styles.nextLabel}>NEXT RUN</StyledText>
            <StyledText style={styles.nextMeta}>
              Nothing ahead of you — the schedule reaches {horizonDays} days out.
            </StyledText>
          </View>
        )}

        {groups.length === 0 ? (
          <View style={styles.empty}>
            <StyledText style={styles.emptyTitle}>No runs scheduled</StyledText>
            <StyledText style={styles.emptyBody}>
              Your bus does not run on these days, or your schedule has not been set up yet. This is
              not an error.
            </StyledText>
          </View>
        ) : (
          groups.map(group => (
            <View key={group.date} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <StyledText style={styles.dayTitle}>{formatRunDateRelative(group.date)}</StyledText>
                {group.date === today ? <StyledText style={styles.dayTag}>TODAY</StyledText> : null}
              </View>
              <RunList runs={group.runs} nextKey={nextKey} />
            </View>
          ))
        )}

        <View style={{ height: insets.bottom + 24 }} />
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
  content: {
    gap: spacings.md,
    paddingBottom: 0,
  },
  header: {
    paddingHorizontal: spacings.md,
    gap: 2,
  },
  title: {
    fontSize: 22,
    fontFamily: 'RubikBold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
  },
  nextCard: {
    marginHorizontal: spacings.md,
    padding: spacings.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 2,
  },
  nextLabel: {
    fontSize: 10,
    fontFamily: 'RubikMedium',
    color: colors.light,
    letterSpacing: 1,
    opacity: 0.7,
  },
  nextTitle: {
    fontSize: 17,
    fontFamily: 'RubikBold',
    color: colors.light,
  },
  nextMeta: {
    fontSize: 12,
    fontFamily: 'RubikMedium',
    color: colors.light,
    opacity: 0.85,
  },
  daySection: {
    gap: spacings.xs,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacings.sm,
    paddingHorizontal: spacings.md,
  },
  dayTitle: {
    fontSize: 13,
    fontFamily: 'RubikSemiBold',
    color: colors.text,
  },
  dayTag: {
    fontSize: 9,
    fontFamily: 'RubikBold',
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  empty: {
    marginHorizontal: spacings.md,
    padding: spacings.lg,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: spacings.xs,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: 'RubikSemiBold',
    color: colors.text,
  },
  emptyBody: {
    fontSize: 12,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
    textAlign: 'center',
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
}));

export default Schedule;
