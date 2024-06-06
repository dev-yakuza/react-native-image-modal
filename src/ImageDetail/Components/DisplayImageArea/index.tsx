import React, { ReactNode } from 'react';
import { Animated, Dimensions, Platform, StatusBar } from 'react-native';

interface Props {
  animatedFrame: Animated.Value;
  parentLayout?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isTranslucent: boolean;
  renderToHardwareTextureAndroid: boolean;
  children: ReactNode;
}
const DisplayImageArea = ({
  animatedFrame,
  parentLayout,
  isTranslucent,
  renderToHardwareTextureAndroid,
  children,
}: Props) => {
  // parentLayout is not passed in the props,
  // clipping is not needed, so clipping area should be full screen.
  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

  // On Android, the status bar height should be added to the top position of the image.
  const statusBarHeight =
    isTranslucent && Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;
  const containerAnimateConf = {
    left: animatedFrame.interpolate({
      inputRange: [0, 1],
      outputRange: [parentLayout?.x ?? 0, 0],
    }),
    top: animatedFrame.interpolate({
      inputRange: [0, 1],
      outputRange: [(parentLayout?.y ?? 0) + statusBarHeight, 0],
    }),
    width: animatedFrame.interpolate({
      inputRange: [0, 1],
      outputRange: [parentLayout?.width ?? windowWidth, windowWidth],
    }),
    height: animatedFrame.interpolate({
      inputRange: [0, 1],
      outputRange: [parentLayout?.height ?? windowHeight, windowHeight],
    }),
  };

  return (
    <Animated.View
      style={{ position: 'absolute', ...containerAnimateConf }}
      renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
    >
      {children}
    </Animated.View>
  );
};

export { DisplayImageArea };
