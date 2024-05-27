import React, { ReactNode } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';

const Styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'transparent',
  },
});

interface Props {
  renderToHardwareTextureAndroid: boolean;
  animatedOpacity: Animated.Value;
  children: ReactNode;
}

const Footer = ({ renderToHardwareTextureAndroid, animatedOpacity, children }: Props) => {
  const { height: windowHeight } = Dimensions.get('window');

  return (
    <Animated.View
      renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
      style={[
        Styles['footer'],
        {
          opacity: animatedOpacity.interpolate({
            inputRange: [0, windowHeight],
            outputRange: [1, 0],
          }),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export { Footer };
