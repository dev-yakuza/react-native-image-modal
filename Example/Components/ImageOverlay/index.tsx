import React, {useState, useEffect} from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const WINDOW_WIDTH = Dimensions.get('window').width;
const DRAG_DISMISS_THRESHOLD = 150;
const STATUS_BAR_OFFSET = Platform.OS === 'android' ? -25 : 0;
const isIOS = Platform.OS === 'ios';

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  open: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: WINDOW_WIDTH,
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

let target = {
  x: 0,
  y: 0,
  opacity: 1,
};

interface State {
  isAnimating: boolean;
  isPanning: boolean;
  pan: Animated.Value;
}
interface Props {
  isOpen: boolean;
  origin: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  swipeToDismiss?: boolean;
  backgroundColor?: string;
  children: JSX.Element | Array<JSX.Element>;
  renderHeader?: (close: () => void) => JSX.Element | Array<JSX.Element>;
  didOpen?: () => void;
  willClose?: () => void;
  onClose: () => void;
}

const ImageOverlay = ({
  isOpen,
  origin,
  renderHeader,
  swipeToDismiss,
  backgroundColor,
  children,
  didOpen,
  willClose,
  onClose,
}: Props) => {
  const [state, setState] = useState<State>({
    isAnimating: false,
    isPanning: false,
    pan: new Animated.Value(0),
  });
  const [animatedValue] = useState<Animated.Value>(new Animated.Value(0));

  const close = () => {
    if (willClose) {
      willClose();
    }
    if (isIOS) {
      StatusBar.setHidden(false, 'fade');
    }
    setState({
      ...state,
      isAnimating: true,
    });

    Animated.spring(state.pan, {toValue: WINDOW_HEIGHT}).start();
    Animated.spring(animatedValue, {toValue: 0}).start(() => {
      setState({
        ...state,
        isAnimating: false,
        isPanning: false,
      });
      onClose();
    });
  };

  const _panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => !state.isAnimating,
    onStartShouldSetPanResponderCapture: (evt, gestureState) =>
      !state.isAnimating,
    onMoveShouldSetPanResponder: (evt, gestureState) => !state.isAnimating,
    onMoveShouldSetPanResponderCapture: (evt, gestureState) =>
      !state.isAnimating,

    onPanResponderGrant: (evt, gestureState) => {
      state.pan.setValue(0);
      setState({...state, isPanning: true});
    },
    onPanResponderMove: Animated.event([null, {dy: state.pan}]),
    onPanResponderTerminationRequest: (evt, gestureState) => true,
    onPanResponderRelease: (evt, gestureState) => {
      if (Math.abs(gestureState.dy) > DRAG_DISMISS_THRESHOLD) {
        setState({
          ...state,
          isPanning: false,
        });
        target = {
          y: gestureState.dy,
          x: gestureState.dx,
          opacity: 1 - Math.abs(gestureState.dy / WINDOW_HEIGHT),
        };
        close();
      } else {
        Animated.spring(state.pan, {toValue: 0}).start(() => {
          setState({...state, isPanning: false});
        });
      }
    },
  });

  const {isPanning} = state;

  const imageBoxOpacityStyle = {
    opacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  };

  let handlers;
  if (swipeToDismiss) {
    handlers = _panResponder.panHandlers;
  }

  let dragStyle;
  if (isPanning) {
    dragStyle = {
      top: state.pan.interpolate({
        inputRange: [0, WINDOW_HEIGHT],
        outputRange: [target.y, origin.y],
      }),
    };
    imageBoxOpacityStyle.opacity = state.pan.interpolate({
      inputRange: [-WINDOW_HEIGHT, 0, WINDOW_HEIGHT],
      outputRange: [0, 1, 0],
    });
  }

  const openStyle = {
    left: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [origin.x, target.x],
    }),
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [origin.y + STATUS_BAR_OFFSET, target.y + STATUS_BAR_OFFSET],
    }),
    width: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [origin.width, WINDOW_WIDTH],
    }),
    height: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [origin.height, WINDOW_HEIGHT],
    }),
  };

  useEffect(() => {
    if (isOpen) {
      if (isIOS) {
        StatusBar.setHidden(true, 'fade');
      }
      state.pan.setValue(0);
      setState({
        ...state,
        isAnimating: true,
      });
      target = {
        x: 0,
        y: 0,
        opacity: 1,
      };

      Animated.spring(animatedValue, {toValue: 1}).start(() => {
        setState({...state, isAnimating: false});
        if (didOpen) {
          didOpen();
        }
      });
    }
  }, [isOpen]);
  const background = (
    <Animated.View
      style={[
        styles.background,
        {backgroundColor: backgroundColor},
        imageBoxOpacityStyle,
      ]}></Animated.View>
  );
  const header = (
    <Animated.View style={[styles.header, imageBoxOpacityStyle]}>
      {renderHeader ? (
        renderHeader(close)
      ) : (
        <TouchableOpacity onPress={close}>
          <Text style={styles.closeButton}>×</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
  const content = (
    <Animated.View style={[styles.open, openStyle, dragStyle]} {...handlers}>
      {children}
    </Animated.View>
  );

  return (
    <Modal visible={isOpen} transparent={true} onRequestClose={() => close()}>
      {background}
      {content}
      {header}
    </Modal>
  );
};

export default ImageOverlay;
