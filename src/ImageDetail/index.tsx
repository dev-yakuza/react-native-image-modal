import React, { ReactNode, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  Animated,
  PanResponder,
  Modal,
  SafeAreaView,
  StatusBar,
  Image,
  ImageResizeMode,
  StyleProp,
  ImageStyle,
  ImageSourcePropType,
} from 'react-native';

import { OnTap, OnMove } from '../types';

const LONG_PRESS_TIME = 800;
const DOUBLE_CLICK_INTERVAL = 250;
const MAX_OVERFLOW = 100;
const MIN_SCALE = 0.6;
const MAX_SCALE = 10;
const CLICK_DISTANCE = 10;
const DRAG_DISMISS_THRESHOLD = 150;

const Styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'transparent',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
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
  renderToHardwareTextureAndroid: boolean;
  isTranslucent?: boolean;
  isOpen: boolean;
  origin: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  source: ImageSourcePropType;
  resizeMode?: ImageResizeMode;
  backgroundColor?: string;
  swipeToDismiss?: boolean;
  hideCloseButton?: boolean;
  imageStyle?: StyleProp<ImageStyle>;
  renderHeader?: (close: () => void) => ReactNode;
  renderFooter?: (close: () => void) => ReactNode;
  renderImageComponent?: (params: {
    source: ImageSourcePropType;
    style?: StyleProp<ImageStyle>;
    resizeMode?: ImageResizeMode;
  }) => ReactNode;
  onTap?: (eventParams: OnTap) => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  didOpen?: () => void;
  onMove?: (position: OnMove) => void;
  responderRelease?: (vx?: number, scale?: number) => void;
  willClose?: () => void;
  onClose: () => void;
}

type ImageDetail = {
  close: () => void;
};
// eslint-disable-next-line react/display-name
const ImageDetail = forwardRef<ImageDetail, Props>(
  (
    {
      renderToHardwareTextureAndroid,
      isTranslucent,
      isOpen,
      origin,
      source,
      resizeMode = 'contain',
      backgroundColor = '#000000',
      swipeToDismiss,
      hideCloseButton,
      imageStyle,
      renderHeader,
      renderFooter,
      renderImageComponent,
      onTap,
      onDoubleTap,
      onLongPress,
      didOpen,
      onMove,
      responderRelease,
      willClose,
      onClose,
    }: Props,
    ref,
  ) => {
    const _animatedScale = new Animated.Value(1);
    const _animatedPositionX = new Animated.Value(0);
    const _animatedPositionY = new Animated.Value(0);
    const _animatedFrame = new Animated.Value(0);
    const _animatedOpacity = new Animated.Value(Dimensions.get('window').height);

    const _lastPositionX = useRef<number | null>(null);
    const _lastPositionY = useRef<number | null>(null);
    const _zoomLastDistance = useRef<number | null>(null);
    const _horizontalWholeCounter = useRef(0);
    const _verticalWholeCounter = useRef(0);
    const _isDoubleClick = useRef(false);
    const _isLongPress = useRef(false);
    const _centerDiffX = useRef(0);
    const _centerDiffY = useRef(0);
    const _singleClickTimeout = useRef<undefined | NodeJS.Timeout>(undefined);
    const _longPressTimeout = useRef<undefined | NodeJS.Timeout>(undefined);
    const _lastClickTime = useRef(0);
    const _doubleClickX = useRef(0);
    const _doubleClickY = useRef(0);
    const _scale = useRef(1);
    const _positionX = useRef(0);
    const _positionY = useRef(0);
    const _zoomCurrentDistance = useRef(0);
    const _swipeDownOffset = useRef(0);
    const _horizontalWholeOuterCounter = useRef(0);
    const _isAnimated = useRef(false);

    const _imagePanResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: (evt) => {
        if (_isAnimated.current) {
          return;
        }
        const windowWidth: number = Dimensions.get('window').width;
        const windowHeight: number = Dimensions.get('window').height;
        _lastPositionX.current = null;
        _lastPositionY.current = null;
        _zoomLastDistance.current = null;
        _horizontalWholeCounter.current = 0;
        _verticalWholeCounter.current = 0;
        _isDoubleClick.current = false;
        _isLongPress.current = false;

        if (_singleClickTimeout.current) {
          clearTimeout(_singleClickTimeout.current);
          _singleClickTimeout.current = undefined;
        }

        if (evt.nativeEvent.changedTouches.length > 1) {
          const centerX =
            (evt.nativeEvent.changedTouches[0].pageX + evt.nativeEvent.changedTouches[1].pageX) / 2;
          _centerDiffX.current = centerX - windowWidth / 2;

          const centerY =
            (evt.nativeEvent.changedTouches[0].pageY + evt.nativeEvent.changedTouches[1].pageY) / 2;
          _centerDiffY.current = centerY - windowHeight / 2;
        }
        if (_longPressTimeout.current) {
          clearTimeout(_longPressTimeout.current);
          _longPressTimeout.current = undefined;
        }
        _longPressTimeout.current = setTimeout(() => {
          _isLongPress.current = true;
          onLongPress?.();
        }, LONG_PRESS_TIME);

        if (evt.nativeEvent.changedTouches.length <= 1) {
          if (new Date().getTime() - _lastClickTime.current < (DOUBLE_CLICK_INTERVAL || 0)) {
            _lastClickTime.current = 0;
            onDoubleTap?.();

            clearTimeout(_longPressTimeout.current);
            _longPressTimeout.current = undefined;

            _doubleClickX.current = evt.nativeEvent.changedTouches[0].pageX;
            _doubleClickY.current = evt.nativeEvent.changedTouches[0].pageY;

            _isDoubleClick.current = true;

            if (_scale.current > 1 || _scale.current < 1) {
              _scale.current = 1;

              _positionX.current = 0;
              _positionY.current = 0;
            } else {
              const beforeScale = _scale.current;
              _scale.current = 2;

              const diffScale = _scale.current - beforeScale;
              _positionX.current =
                ((windowWidth / 2 - _doubleClickX.current) * diffScale) / _scale.current;

              _positionY.current =
                ((windowHeight / 2 - _doubleClickY.current) * diffScale) / _scale.current;
            }

            _imageDidMove('centerOn');

            Animated.parallel([
              Animated.timing(_animatedScale, {
                toValue: _scale.current,
                duration: 100,
                useNativeDriver: false,
              }),
              Animated.timing(_animatedPositionX, {
                toValue: _positionX.current,
                duration: 100,
                useNativeDriver: false,
              }),
              Animated.timing(_animatedPositionY, {
                toValue: _positionY.current,
                duration: 100,
                useNativeDriver: false,
              }),
            ]).start();
          } else {
            _lastClickTime.current = new Date().getTime();
          }
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (_isDoubleClick.current || _isAnimated.current) {
          return;
        }

        if (evt.nativeEvent.changedTouches.length <= 1) {
          let diffX = gestureState.dx - (_lastPositionX.current || 0);
          if (_lastPositionX === null) {
            diffX = 0;
          }
          let diffY = gestureState.dy - (_lastPositionY.current || 0);
          if (_lastPositionY === null) {
            diffY = 0;
          }

          const windowWidth: number = Dimensions.get('window').width;
          _lastPositionX.current = gestureState.dx;
          _lastPositionY.current = gestureState.dy;

          _horizontalWholeCounter.current += diffX;
          _verticalWholeCounter.current += diffY;

          if (
            (Math.abs(_horizontalWholeCounter.current) > 5 ||
              Math.abs(_verticalWholeCounter.current) > 5) &&
            _longPressTimeout.current
          ) {
            clearTimeout(_longPressTimeout.current);
            _longPressTimeout.current = undefined;
          }

          if (_swipeDownOffset.current === 0) {
            if (windowWidth * _scale.current > windowWidth) {
              if (_horizontalWholeOuterCounter.current > 0) {
                if (diffX < 0) {
                  if (_horizontalWholeOuterCounter.current > Math.abs(diffX)) {
                    _horizontalWholeOuterCounter.current += diffX;
                    diffX = 0;
                  } else {
                    diffX += _horizontalWholeOuterCounter.current;
                    _horizontalWholeOuterCounter.current = 0;
                  }
                } else {
                  _horizontalWholeOuterCounter.current += diffX;
                }
              } else if (_horizontalWholeOuterCounter.current < 0) {
                if (diffX > 0) {
                  if (Math.abs(_horizontalWholeOuterCounter.current) > diffX) {
                    _horizontalWholeOuterCounter.current += diffX;
                    diffX = 0;
                  } else {
                    diffX += _horizontalWholeOuterCounter.current;
                    _horizontalWholeOuterCounter.current = 0;
                  }
                } else {
                  _horizontalWholeOuterCounter.current += diffX;
                }
              }

              _positionX.current += diffX / _scale.current;

              const horizontalMax =
                (windowWidth * _scale.current - windowWidth) / 2 / _scale.current;
              if (_positionX.current < -horizontalMax) {
                _positionX.current = -horizontalMax;
                _horizontalWholeOuterCounter.current += -1 / 1e10;
              } else if (_positionX.current > horizontalMax) {
                _positionX.current = horizontalMax;
                _horizontalWholeOuterCounter.current += 1 / 1e10;
              }
              _animatedPositionX.setValue(_positionX.current);
            } else {
              _horizontalWholeOuterCounter.current += diffX;
            }

            if (_horizontalWholeOuterCounter.current > (MAX_OVERFLOW || 0)) {
              _horizontalWholeOuterCounter.current = MAX_OVERFLOW || 0;
            } else if (_horizontalWholeOuterCounter.current < -(MAX_OVERFLOW || 0)) {
              _horizontalWholeOuterCounter.current = -(MAX_OVERFLOW || 0);
            }
          }

          _positionY.current += diffY / _scale.current;
          _animatedPositionY.setValue(_positionY.current);
          if (swipeToDismiss && _scale.current === 1) {
            _animatedOpacity.setValue(Math.abs(gestureState.dy));
          }
        } else {
          if (_longPressTimeout.current) {
            clearTimeout(_longPressTimeout.current);
            _longPressTimeout.current = undefined;
          }

          let minX: number;
          let maxX: number;
          if (
            evt.nativeEvent.changedTouches[0].locationX >
            evt.nativeEvent.changedTouches[1].locationX
          ) {
            minX = evt.nativeEvent.changedTouches[1].pageX;
            maxX = evt.nativeEvent.changedTouches[0].pageX;
          } else {
            minX = evt.nativeEvent.changedTouches[0].pageX;
            maxX = evt.nativeEvent.changedTouches[1].pageX;
          }

          let minY: number;
          let maxY: number;
          if (
            evt.nativeEvent.changedTouches[0].locationY >
            evt.nativeEvent.changedTouches[1].locationY
          ) {
            minY = evt.nativeEvent.changedTouches[1].pageY;
            maxY = evt.nativeEvent.changedTouches[0].pageY;
          } else {
            minY = evt.nativeEvent.changedTouches[0].pageY;
            maxY = evt.nativeEvent.changedTouches[1].pageY;
          }

          const widthDistance = maxX - minX;
          const heightDistance = maxY - minY;
          const diagonalDistance = Math.sqrt(
            widthDistance * widthDistance + heightDistance * heightDistance,
          );
          _zoomCurrentDistance.current = Number(diagonalDistance.toFixed(1));

          if (_zoomLastDistance.current !== null) {
            const distanceDiff = (_zoomCurrentDistance.current - _zoomLastDistance.current) / 200;
            let zoom = _scale.current + distanceDiff;

            if (zoom < MIN_SCALE) {
              zoom = MIN_SCALE;
            }
            if (zoom > MAX_SCALE) {
              zoom = MAX_SCALE;
            }

            const beforeScale = _scale;

            _scale.current = zoom;
            _animatedScale.setValue(_scale.current);

            const diffScale = _scale.current - beforeScale.current;
            _positionX.current -= (_centerDiffX.current * diffScale) / _scale.current;
            _positionY.current -= (_centerDiffY.current * diffScale) / _scale.current;
            _animatedPositionX.setValue(_positionX.current);
            _animatedPositionY.setValue(_positionY.current);
          }
          _zoomLastDistance.current = _zoomCurrentDistance.current;
        }

        _imageDidMove('onPanResponderMove');
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (_longPressTimeout.current) {
          clearTimeout(_longPressTimeout.current);
          _longPressTimeout.current = undefined;
        }

        if (_isDoubleClick.current || _isLongPress.current || _isAnimated.current) {
          return;
        }

        const moveDistance = Math.sqrt(
          gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy,
        );
        const { locationX, locationY, pageX, pageY } = evt.nativeEvent;

        if (evt.nativeEvent.changedTouches.length === 1 && moveDistance < CLICK_DISTANCE) {
          _singleClickTimeout.current = setTimeout(() => {
            onTap?.({ locationX, locationY, pageX, pageY });
          }, DOUBLE_CLICK_INTERVAL);
        } else {
          responderRelease?.(gestureState.vx, _scale.current);
          _panResponderReleaseResolve(evt.nativeEvent.changedTouches.length);
        }
      },
    });

    const _imageDidMove = (type: string): void => {
      onMove?.({
        type,
        positionX: _positionX.current,
        positionY: _positionY.current,
        scale: _scale.current,
        zoomCurrentDistance: _zoomCurrentDistance.current,
      });
    };

    const _panResponderReleaseResolve = (changedTouchesCount: number): void => {
      const windowWidth: number = Dimensions.get('window').width;
      const windowHeight: number = Dimensions.get('window').height;
      if (_scale.current < 1) {
        _scale.current = 1;
        Animated.timing(_animatedScale, {
          toValue: _scale.current,
          duration: 100,
          useNativeDriver: false,
        }).start();
      }

      if (windowWidth * _scale.current <= windowWidth) {
        _positionX.current = 0;
        Animated.timing(_animatedPositionX, {
          toValue: _positionX.current,
          duration: 100,
          useNativeDriver: false,
        }).start();
      }

      if (windowHeight * _scale.current < windowHeight) {
        _positionY.current = 0;
        Animated.timing(_animatedPositionY, {
          toValue: _positionY.current,
          duration: 100,
          useNativeDriver: false,
        }).start();
      } else if (
        swipeToDismiss &&
        _scale.current === 1 &&
        changedTouchesCount === 1 &&
        Math.abs(_positionY.current) > DRAG_DISMISS_THRESHOLD
      ) {
        handleClose();
        return;
      }

      if (windowHeight * _scale.current > windowHeight) {
        const verticalMax = (windowHeight * _scale.current - windowHeight) / 2 / _scale.current;
        if (_positionY.current < -verticalMax) {
          _positionY.current = -verticalMax;
        } else if (_positionY.current > verticalMax) {
          _positionY.current = verticalMax;
        }
        Animated.timing(_animatedPositionY, {
          toValue: _positionY.current,
          duration: 100,
          useNativeDriver: false,
        }).start();
      }

      if (windowWidth * _scale.current > windowWidth) {
        const horizontalMax = (windowWidth * _scale.current - windowWidth) / 2 / _scale.current;
        if (_positionX.current < -horizontalMax) {
          _positionX.current = -horizontalMax;
        } else if (_positionX.current > horizontalMax) {
          _positionX.current = horizontalMax;
        }
        Animated.timing(_animatedPositionX, {
          toValue: _positionX.current,
          duration: 100,
          useNativeDriver: false,
        }).start();
      }

      if (_scale.current === 1) {
        _positionX.current = 0;
        _positionY.current = 0;
        Animated.timing(_animatedPositionX, {
          toValue: _positionX.current,
          duration: 100,
          useNativeDriver: false,
        }).start();
        Animated.timing(_animatedPositionY, {
          toValue: _positionY.current,
          duration: 100,
          useNativeDriver: false,
        }).start();
      }

      Animated.timing(_animatedOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }).start();

      _horizontalWholeOuterCounter.current = 0;
      _swipeDownOffset.current = 0;

      _imageDidMove('onPanResponderRelease');
    };

    const handleClose = (): void => {
      const windowHeight: number = Dimensions.get('window').height;
      if (isTranslucent) {
        StatusBar.setHidden(false);
      }
      setTimeout(() => {
        _isAnimated.current = true;
        willClose?.();

        Animated.parallel([
          Animated.timing(_animatedScale, { toValue: 1, useNativeDriver: false }),
          Animated.timing(_animatedPositionX, { toValue: 0, useNativeDriver: false }),
          Animated.timing(_animatedPositionY, { toValue: 0, useNativeDriver: false }),
          Animated.timing(_animatedOpacity, { toValue: windowHeight, useNativeDriver: false }),
          Animated.spring(_animatedFrame, { toValue: 0, useNativeDriver: false }),
        ]).start(() => {
          onClose();
          _isAnimated.current = false;
        });
      });
    };

    const windowWidth: number = Dimensions.get('window').width;
    const windowHeight: number = Dimensions.get('window').height;
    const animateConf = {
      transform: [
        {
          scale: _animatedScale,
        },
        {
          translateX: _animatedPositionX,
        },
        {
          translateY: _animatedPositionY,
        },
      ],
      left: _animatedFrame.interpolate({
        inputRange: [0, 1],
        outputRange: [origin.x, 0],
      }),
      top: _animatedFrame.interpolate({
        inputRange: [0, 1],
        outputRange: [origin.y, 0],
      }),
      width: _animatedFrame.interpolate({
        inputRange: [0, 1],
        outputRange: [origin.width, windowWidth],
      }),
      height: _animatedFrame.interpolate({
        inputRange: [0, 1],
        outputRange: [origin.height, windowHeight],
      }),
    };

    const background = (
      <Animated.View
        renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
        style={[
          Styles.background,
          { backgroundColor: backgroundColor },
          {
            opacity: _animatedOpacity.interpolate({
              inputRange: [0, windowHeight],
              outputRange: [1, 0],
            }),
          },
        ]}
      ></Animated.View>
    );

    const header = (
      <Animated.View
        renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
        style={[
          Styles.header,
          {
            opacity: _animatedOpacity.interpolate({
              inputRange: [0, windowHeight],
              outputRange: [1, 0],
            }),
          },
        ]}
      >
        {typeof renderHeader === 'function' ? (
          renderHeader(handleClose)
        ) : !hideCloseButton ? (
          <SafeAreaView style={{ marginTop: isTranslucent ? StatusBar.currentHeight : 0 }}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={Styles.closeButton}>×</Text>
            </TouchableOpacity>
          </SafeAreaView>
        ) : undefined}
      </Animated.View>
    );

    const footer = renderFooter && (
      <Animated.View
        renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
        style={[
          Styles.footer,
          {
            opacity: _animatedOpacity.interpolate({
              inputRange: [0, windowHeight],
              outputRange: [1, 0],
            }),
          },
        ]}
      >
        {renderFooter(handleClose)}
      </Animated.View>
    );

    const content = (
      <View
        style={{
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          flex: 1,
        }}
        {..._imagePanResponder?.panHandlers}
      >
        {background}
        <Animated.View
          style={animateConf}
          renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
        >
          {typeof renderImageComponent === 'function' ? (
            renderImageComponent({
              source,
              resizeMode,
              style: [
                imageStyle,
                {
                  width: '100%',
                  height: '100%',
                },
              ],
            })
          ) : (
            <Image
              resizeMode={resizeMode}
              style={[
                imageStyle,
                {
                  width: '100%',
                  height: '100%',
                },
              ]}
              source={source}
            />
          )}
        </Animated.View>
        {header}
        {typeof renderFooter === 'function' && footer}
      </View>
    );

    Animated.parallel([
      Animated.timing(_animatedOpacity, { toValue: 0, useNativeDriver: false }),
      Animated.spring(_animatedFrame, { toValue: 1, useNativeDriver: false }),
    ]).start(() => {
      _isAnimated.current = false;
      if (isOpen) {
        didOpen?.();
      }
    });

    useImperativeHandle(ref, () => ({
      close() {
        handleClose();
      },
    }));

    return (
      <Modal
        hardwareAccelerated
        visible={isOpen}
        transparent
        statusBarTranslucent={isTranslucent}
        onRequestClose={handleClose}
        supportedOrientations={[
          'portrait',
          'portrait-upside-down',
          'landscape',
          'landscape-left',
          'landscape-right',
        ]}
      >
        {isTranslucent && <StatusBar backgroundColor={'transparent'} translucent={true} />}
        {content}
      </Modal>
    );
  },
);

export default ImageDetail;
