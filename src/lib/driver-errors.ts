import { getErrorCode } from '@/lib/error';

export const DriverErrorCode = {
  DRIVER_NOT_ASSIGNED: 'DRIVER_NOT_ASSIGNED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  TRIP_NOT_FOUND: 'TRIP_NOT_FOUND',
  TRIP_ALREADY_ACTIVE: 'TRIP_ALREADY_ACTIVE',
  AMBIGUOUS_ACTIVE_TRIP: 'AMBIGUOUS_ACTIVE_TRIP',
  NO_ACTIVE_TRIP: 'NO_ACTIVE_TRIP',
  STUDENT_NOT_ON_BUS: 'STUDENT_NOT_ON_BUS',
  BUS_NOT_FOUND: 'BUS_NOT_FOUND',
} as const;

type DriverErrorCopy = {
  title: string;
  message: string;
  /**
   * True when the session itself is over. A driver whose account is ON_LEAVE or INACTIVE is 403'd out
   * of every `/api/driver/**` endpoint, so retrying cannot help — the app must sign out and say why.
   */
  terminal: boolean;
};

/**
 * Turns a driver-endpoint failure into copy the driver can act on.
 *
 * Every one of these codes is a state the driver cannot get out of by tapping again, so a raw
 * "Ambiguous active trip" would be useless on a phone screen at 07:30.
 */
export const describeDriverError = (error: unknown): DriverErrorCopy => {
  switch (getErrorCode(error)) {
    case DriverErrorCode.DRIVER_NOT_ASSIGNED:
      return {
        title: 'Account unavailable',
        message: 'Your driver account is not active. Please contact your school.',
        terminal: true,
      };

    case DriverErrorCode.ACCESS_DENIED:
      return {
        title: 'Not allowed',
        message: 'This action is not available for your account.',
        terminal: true,
      };

    case DriverErrorCode.TRIP_ALREADY_ACTIVE:
      return {
        title: 'Trip already running',
        message: 'Another run is still active on this bus. End it before starting a new one.',
        terminal: false,
      };

    case DriverErrorCode.AMBIGUOUS_ACTIVE_TRIP:
      return {
        title: 'More than one trip running',
        message: 'You have more than one trip running — end the one you have finished.',
        terminal: false,
      };

    case DriverErrorCode.NO_ACTIVE_TRIP:
      return {
        title: 'No active trip',
        message: 'There is no active trip to send a location for.',
        terminal: false,
      };

    case DriverErrorCode.STUDENT_NOT_ON_BUS:
      return {
        title: 'Could not update roll sheet',
        message: 'One of those students is not on your bus. Nothing was saved — please try again.',
        terminal: false,
      };

    case DriverErrorCode.BUS_NOT_FOUND:
      return {
        title: 'Bus unavailable',
        message: 'The bus assigned to you could not be found. Please contact your school.',
        terminal: false,
      };

    default:
      return { title: 'Something went wrong', message: '', terminal: false };
  }
};
