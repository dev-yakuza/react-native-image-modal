import React, { ReactNode, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  PanResponder,
  Modal,
  Image,
  ImageResizeMode,
  StyleProp,
  ImageStyle,
  ImageSourcePropType,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';

import { OnTap, OnMove } from '../types';
import { Background, Footer, Header } from './Components';
import { DisplayImageArea } from './Components/DisplayImageArea';

const LONG_PRESS_TIME = 800;
const DOUBLE_CLICK_INTERVAL = 250;
const MAX_OVERFLOW = 100;
const INITIAL_SCALE = 1;
const MIN_SCALE = 0.6;
const MAX_SCALE = 10;
const CLICK_DISTANCE = 10;
const DRAG_DISMISS_THRESHOLD = 150;
const INITIAL_ZOOM_DISTANCE = -1;

const Styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});

type ImageDetail = {
  close: () => void;
};

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
  parentLayout?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
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

const ImageDetail = forwardRef<ImageDetail, Props>(
  (
    {
      renderToHardwareTextureAndroid,
      isTranslucent = false,
      isOpen,
      origin,
      source,
      resizeMode = 'contain',
      backgroundColor = '#000000',
      swipeToDismiss,
      hideCloseButton = false,
      imageStyle,
      parentLayout,
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
    const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
    const _scale = useRef(INITIAL_SCALE);
    const _animatedScale = new Animated.Value(INITIAL_SCALE);
    const _animatedPosition = new Animated.ValueXY({ x: 0, y: 0 });
    const _animatedFrame = new Animated.Value(0);
    const _animatedOpacity = new Animated.Value(windowHeight);

    const _position = useRef({ x: 0, y: 0 });
    const _lastPosition = useRef({ x: 0, y: 0 });
    const _doubleClickPosition = useRef({ x: 0, y: 0 });
    const _centerDiff = useRef({ x: 0, y: 0 });
    const _zoomLastDistance = useRef(INITIAL_ZOOM_DISTANCE);
    const _zoomCurrentDistance = useRef(INITIAL_ZOOM_DISTANCE);
    const _horizontalWholeCounter = useRef(0);
    const _verticalWholeCounter = useRef(0);
    const _singleClickTimeout = useRef<undefined | NodeJS.Timeout>(undefined);
    const _longPressTimeout = useRef<undefined | NodeJS.Timeout>(undefined);
    const _lastClickTime = useRef(0);
    const _isDoubleClick = useRef(false);
    const _isLongPress = useRef(false);
    const _horizontalWholeOuterCounter = useRef(0);
    const _isAnimated = useRef(true);

    const handleImageMove = (type: string): void => {
      const { x: positionX, y: positionY } = _position.current;
      onMove?.({
        type,
        positionX,
        positionY,
        scale: _scale.current,
        zoomCurrentDistance: _zoomCurrentDistance.current,
      });
    };

    const handlePanResponderReleaseResolve = (changedTouchesCount: number): void => {
      // When image is zoomed out and finger is released,
      // Move image position to the center of the screen.
      if (_scale.current < INITIAL_SCALE) {
        _position.current = {
          x: 0,
          y: 0,
        };
        Animated.timing(_animatedPosition, {
          toValue: _position.current,
          duration: 100,
          useNativeDriver: false,
        }).start();
        return;
      }

      // When image is zoomed in and finger is released,
      // Move image position
      if (_scale.current > INITIAL_SCALE) {
        const verticalMax = (windowHeight * _scale.current - windowHeight) / 2 / _scale.current;
        let { x: positionX, y: positionY } = _position.current;
        if (positionY < -verticalMax) {
          positionY = -verticalMax;
        } else if (positionY > verticalMax) {
          positionY = verticalMax;
        }

        const horizontalMax = (windowWidth * _scale.current - windowWidth) / 2 / _scale.current;
        if (positionX < -horizontalMax) {
          positionX = -horizontalMax;
        } else if (positionX > horizontalMax) {
          positionX = horizontalMax;
        }

        Animated.timing(_animatedPosition, {
          toValue: { x: positionX, y: positionY },
          duration: 100,
          useNativeDriver: false,
        }).start();
      }

      // When image is normal and finger is released with swipe up or down,
      // Close image detail.
      if (
        swipeToDismiss &&
        _scale.current === INITIAL_SCALE &&
        changedTouchesCount === 1 &&
        Math.abs(_position.current.y) > DRAG_DISMISS_THRESHOLD
      ) {
        handleClose();
        return;
      }

      // When finger is released in original size of image,
      // image should move to the center of the screen.
      if (_scale.current === INITIAL_SCALE) {
        _position.current = {
          x: 0,
          y: 0,
        };
        Animated.timing(_animatedPosition, {
          toValue: _position.current,
          duration: 100,
          useNativeDriver: false,
        }).start();
      }

      // When finger is released,
      // background should return to its normal opacity.
      Animated.timing(_animatedOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }).start();

      _horizontalWholeOuterCounter.current = 0;

      handleImageMove('onPanResponderRelease');
    };

    const handlePanResponderGrant = (event: GestureResponderEvent) => {
      if (_isAnimated.current) {
        return;
      }
      _lastPosition.current = { x: 0, y: 0 };
      _zoomLastDistance.current = INITIAL_ZOOM_DISTANCE;
      _horizontalWholeCounter.current = 0;
      _verticalWholeCounter.current = 0;
      _isDoubleClick.current = false;
      _isLongPress.current = false;

      // Clear single click timeout
      if (_singleClickTimeout.current) {
        clearTimeout(_singleClickTimeout.current);
        _singleClickTimeout.current = undefined;
      }

      // Calculate center diff for pinch to zoom
      if (event.nativeEvent.changedTouches.length > 1) {
        const centerX =
          (event.nativeEvent.changedTouches[0].pageX + event.nativeEvent.changedTouches[1].pageX) /
          2;
        const centerY =
          (event.nativeEvent.changedTouches[0].pageY + event.nativeEvent.changedTouches[1].pageY) /
          2;
        _centerDiff.current = {
          x: centerX - windowWidth / 2,
          y: centerY - windowHeight / 2,
        };
      }

      // Clear long press timeout
      if (_longPressTimeout.current) {
        clearTimeout(_longPressTimeout.current);
        _longPressTimeout.current = undefined;
      }
      _longPressTimeout.current = setTimeout(() => {
        _isLongPress.current = true;
        onLongPress?.();
      }, LONG_PRESS_TIME);

      // Double tap to zoom
      if (event.nativeEvent.changedTouches.length <= 1) {
        if (new Date().getTime() - _lastClickTime.current < (DOUBLE_CLICK_INTERVAL || 0)) {
          _lastClickTime.current = 0;
          onDoubleTap?.();

          clearTimeout(_longPressTimeout.current);
          _longPressTimeout.current = undefined;

          _doubleClickPosition.current = {
            x: event.nativeEvent.changedTouches[0].pageX,
            y: event.nativeEvent.changedTouches[0].pageY,
          };

          _isDoubleClick.current = true;

          if (_scale.current !== INITIAL_SCALE) {
            _scale.current = INITIAL_SCALE;
            _position.current = { x: 0, y: 0 };
          } else {
            const { x: doubleClickX, y: doubleClickY } = _doubleClickPosition.current;
            const beforeScale = _scale.current;
            _scale.current = 2;

            const diffScale = _scale.current - beforeScale;
            const x = ((windowWidth / 2 - doubleClickX) * diffScale) / _scale.current;
            const y = ((windowHeight / 2 - doubleClickY) * diffScale) / _scale.current;
            _position.current = {
              x,
              y,
            };
          }

          handleImageMove('centerOn');

          Animated.parallel([
            Animated.timing(_animatedScale, {
              toValue: _scale.current,
              duration: 100,
              useNativeDriver: false,
            }),
            Animated.timing(_animatedPosition, {
              toValue: _position.current,
              duration: 100,
              useNativeDriver: false,
            }),
          ]).start();
        } else {
          _lastClickTime.current = new Date().getTime();
        }
      }
    };

    const handlePanResponderMove = (
      event: GestureResponderEvent,
      gestureState: PanResponderGestureState,
    ) => {
      if (_isDoubleClick.current || _isAnimated.current) {
        return;
      }

      // Single tap to move image
      if (event.nativeEvent.changedTouches.length <= 1) {
        const { x, y } = _lastPosition.current;
        const { dx, dy } = gestureState;
        let diffX = dx - x;
        const diffY = dy - y;

        _lastPosition.current = { x: dx, y: dy };

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

          let x = _position.current.x;
          x += diffX / _scale.current;

          const horizontalMax = (windowWidth * _scale.current - windowWidth) / 2 / _scale.current;
          if (x < -horizontalMax) {
            x = -horizontalMax;
            _horizontalWholeOuterCounter.current += -1 / 1e10;
          } else if (x > horizontalMax) {
            x = horizontalMax;
            _horizontalWholeOuterCounter.current += 1 / 1e10;
          }
          _position.current.x = x;
          _animatedPosition.setValue(_position.current);
        } else {
          _horizontalWholeOuterCounter.current += diffX;
        }

        if (_horizontalWholeOuterCounter.current > (MAX_OVERFLOW || 0)) {
          _horizontalWholeOuterCounter.current = MAX_OVERFLOW || 0;
        } else if (_horizontalWholeOuterCounter.current < -(MAX_OVERFLOW || 0)) {
          _horizontalWholeOuterCounter.current = -(MAX_OVERFLOW || 0);
        }

        let positionY = _position.current.y;
        positionY += diffY / _scale.current;
        _position.current.y = positionY;
        _animatedPosition.setValue(_position.current);
        if (swipeToDismiss && _scale.current === INITIAL_SCALE) {
          _animatedOpacity.setValue(Math.abs(gestureState.dy));
        }
      } else {
        // Pinch to zoom
        if (_longPressTimeout.current) {
          clearTimeout(_longPressTimeout.current);
          _longPressTimeout.current = undefined;
        }
        let minX: number;
        let maxX: number;
        if (
          event.nativeEvent.changedTouches[0].locationX >
          event.nativeEvent.changedTouches[1].locationX
        ) {
          minX = event.nativeEvent.changedTouches[1].pageX;
          maxX = event.nativeEvent.changedTouches[0].pageX;
        } else {
          minX = event.nativeEvent.changedTouches[0].pageX;
          maxX = event.nativeEvent.changedTouches[1].pageX;
        }
        let minY: number;
        let maxY: number;
        if (
          event.nativeEvent.changedTouches[0].locationY >
          event.nativeEvent.changedTouches[1].locationY
        ) {
          minY = event.nativeEvent.changedTouches[1].pageY;
          maxY = event.nativeEvent.changedTouches[0].pageY;
        } else {
          minY = event.nativeEvent.changedTouches[0].pageY;
          maxY = event.nativeEvent.changedTouches[1].pageY;
        }
        const widthDistance = maxX - minX;
        const heightDistance = maxY - minY;
        const diagonalDistance = Math.sqrt(
          widthDistance * widthDistance + heightDistance * heightDistance,
        );
        _zoomCurrentDistance.current = Number(diagonalDistance.toFixed(1));
        if (_zoomLastDistance.current !== INITIAL_ZOOM_DISTANCE) {
          // Update zoom
          const distanceDiff = (_zoomCurrentDistance.current - _zoomLastDistance.current) / 200;
          let zoom = _scale.current + distanceDiff;
          if (zoom < MIN_SCALE) {
            zoom = MIN_SCALE;
          }
          if (zoom > MAX_SCALE) {
            zoom = MAX_SCALE;
          }
          _scale.current = zoom;
          _animatedScale.setValue(_scale.current);

          // Update image position
          _position.current.x -= (_centerDiff.current.x * distanceDiff) / zoom;
          _position.current.y -= (_centerDiff.current.y * distanceDiff) / zoom;
          _animatedPosition.setValue(_position.current);
        }
        _zoomLastDistance.current = _zoomCurrentDistance.current;
      }

      handleImageMove('onPanResponderMove');
    };

    const handlePanResponderRelease = (
      event: GestureResponderEvent,
      gestureState: PanResponderGestureState,
    ) => {
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
      const { locationX, locationY, pageX, pageY } = event.nativeEvent;

      if (event.nativeEvent.changedTouches.length === 1 && moveDistance < CLICK_DISTANCE) {
        _singleClickTimeout.current = setTimeout(() => {
          onTap?.({ locationX, locationY, pageX, pageY });
        }, DOUBLE_CLICK_INTERVAL);
      } else {
        responderRelease?.(gestureState.vx, _scale.current);
        handlePanResponderReleaseResolve(event.nativeEvent.changedTouches.length);
      }
    };

    const _imagePanResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: handlePanResponderGrant,
      onPanResponderMove: handlePanResponderMove,
      onPanResponderRelease: handlePanResponderRelease,
    });

    const handleClose = (): void => {
      setTimeout(() => {
        _isAnimated.current = true;
        willClose?.();

        Animated.parallel([
          Animated.timing(_animatedScale, { toValue: INITIAL_SCALE, useNativeDriver: false }),
          Animated.timing(_animatedPosition, { toValue: 0, useNativeDriver: false }),
          Animated.timing(_animatedOpacity, { toValue: windowHeight, useNativeDriver: false }),
          Animated.spring(_animatedFrame, { toValue: 0, useNativeDriver: false }),
        ]).start(() => {
          onClose();
          _isAnimated.current = false;
        });
      });
    };

    const animateConf = {
      transform: [
        {
          scale: _animatedScale,
        },
        {
          translateX: _animatedPosition.x,
        },
        {
          translateY: _animatedPosition.y,
        },
      ],
      left: _animatedFrame.interpolate({
        inputRange: [0, 1],
        outputRange: [origin.x - (parentLayout?.x ?? 0) / 2, 0],
      }),
      top: _animatedFrame.interpolate({
        inputRange: [0, 1],
        outputRange: [origin.y - (parentLayout?.y ?? 0), 0],
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
        <Background
          animatedOpacity={_animatedOpacity}
          backgroundColor={backgroundColor}
          renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
        />
        <DisplayImageArea
          animatedFrame={_animatedFrame}
          parentLayout={parentLayout}
          isTranslucent={isTranslucent}
          renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
        >
          <View
            style={{
              overflow: 'hidden',
              flex: 1,
            }}
            {..._imagePanResponder?.panHandlers}
          >
            <Animated.View
              style={animateConf}
              renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
            >
              {typeof renderImageComponent === 'function' ? (
                renderImageComponent({
                  source,
                  resizeMode,
                  style: [imageStyle, Styles['image']],
                })
              ) : (
                <Image
                  resizeMode={resizeMode}
                  style={[imageStyle, Styles['image']]}
                  source={source}
                />
              )}
            </Animated.View>
          </View>
        </DisplayImageArea>
        <Header
          isTranslucent={isTranslucent}
          hideCloseButton={hideCloseButton}
          renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
          animatedOpacity={_animatedOpacity}
          onClose={handleClose}
        >
          {typeof renderHeader === 'function' ? renderHeader(handleClose) : undefined}
        </Header>
        {typeof renderFooter === 'function' && (
          <Footer
            renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
            animatedOpacity={_animatedOpacity}
          >
            {renderFooter(handleClose)}
          </Footer>
        )}
      </Modal>
    );
  },
);

export { ImageDetail };
