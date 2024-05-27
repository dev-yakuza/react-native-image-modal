import React, { ReactNode } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

const Styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'transparent',
  },
  closeButton: {
    fontSize: 35,
    color: 'white',
    lineHeight: 40,
    width: 40,
    textAlign: 'center',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 1.5,
    shadowColor: 'black',
    shadowOpacity: 0.8,
  },
});

interface Props {
  isTranslucent: boolean;
  hideCloseButton: boolean;
  renderToHardwareTextureAndroid: boolean;
  animatedOpacity: Animated.Value;
  children?: ReactNode;
  onClose: () => void;
}

const Header = ({
  isTranslucent,
  hideCloseButton,
  renderToHardwareTextureAndroid,
  animatedOpacity,
  children,
  onClose,
}: Props) => {
  const { height: windowHeight } = Dimensions.get('window');

  if (hideCloseButton) return;

  return (
    <Animated.View
      renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
      style={[
        Styles['header'],
        {
          opacity: animatedOpacity.interpolate({
            inputRange: [0, windowHeight],
            outputRange: [1, 0],
          }),
        },
      ]}
    >
      {children ? (
        children
      ) : (
        <SafeAreaView style={{ marginTop: isTranslucent ? StatusBar.currentHeight : 0 }}>
          <TouchableOpacity onPress={onClose}>
            <Text style={Styles['closeButton']}>×</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </Animated.View>
  );
};

export { Header };
