import React from 'react';
import { Animated, ColorValue, StyleSheet } from 'react-native';

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
  return (
    <Animated.View
      renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
      style={[
        Styles['background'],
        { backgroundColor: backgroundColor },
        { opacity: animatedOpacity },
      ]}
    />
  );
};

export { Background };
