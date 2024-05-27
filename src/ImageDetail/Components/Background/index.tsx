import React from 'react';
import { Animated, ColorValue, Dimensions, StyleSheet } from 'react-native';

const Styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});

interface Props {
  animatedOpacity: Animated.Value;
  backgroundColor: ColorValue;
  renderToHardwareTextureAndroid: boolean;
}

const Background = ({
  animatedOpacity,
  backgroundColor,
  renderToHardwareTextureAndroid,
}: Props) => {
  const { height: windowHeight } = Dimensions.get('window');

  return (
    <Animated.View
      renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
      style={[
        Styles['background'],
        { backgroundColor: backgroundColor },
        {
          opacity: animatedOpacity.interpolate({
            inputRange: [0, windowHeight],
            outputRange: [1, 0],
          }),
        },
      ]}
    />
  );
};

export { Background };
