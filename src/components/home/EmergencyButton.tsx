import { StyledButton } from '@/components/styled/StyledButton';
import { Alert } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const EmergencyButton = () => {
  const handleEmergency = () => {
    Alert.alert(
      'Emergency Alert',
      'Are you sure you want to trigger an emergency alert? This will notify your dispatch center.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: () => {
            console.log('Emergency alert triggered');
          },
        },
      ],
    );
  };

  return (
    <StyledButton
      title='Emergency'
      icon='alert-circle-outline'
      onPress={handleEmergency}
      containerStyle={styles.button}
    />
  );
};

const styles = StyleSheet.create(({ colors }) => ({
  button: {
    backgroundColor: colors.error,
    borderWidth: 0,
  },
}));

export default EmergencyButton;
