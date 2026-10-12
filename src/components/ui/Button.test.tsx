import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

test('calls onPress when pressed', () => {
  const onPress = jest.fn();
  render(<Button label="Confirm" onPress={onPress} />);

  fireEvent.press(screen.getByText('Confirm'));

  expect(onPress).toHaveBeenCalledTimes(1);
});
