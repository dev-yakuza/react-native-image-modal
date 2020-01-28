import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  Animated,
  PanResponder,
  Platform,
  Image,
  Modal,
  SafeAreaView,
  ImageSourcePropType,
  ImageResizeMode,
} from 'react-native';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const STATUS_BAR_OFFSET = Platform.OS === 'ios' ? 0 : -25;
let target = {
  x: 0,
  y: 0,
  opacity: 1,
};

const DRAG_DISMISS_THRESHOLD = 150;

const Styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: WINDOW_WIDTH,
    backgroundColor: 'transparent',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
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

interface Props {
  source: ImageSourcePropType;
  resizeMode?: ImageResizeMode;
  origin: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  backgroundColor?: string;
  isOpen: boolean;
  swipeToDismiss?: boolean;
  renderHeader?: (close: () => void) => JSX.Element | Array<JSX.Element>;
  renderFooter?: (close: () => void) => JSX.Element | Array<JSX.Element>;
  onLongPress?: () => void;
  onDoubleClick?: () => void;
  onMove?: (position: IOnMove) => void;
  onClick?: (eventParams: IOnClick) => void;
  onSwipeDown?: () => void;
  horizontalOuterRangeOffset?: (offsetX?: number) => void;
  responderRelease?: (vx?: number, scale?: number) => void;
  willClose?: () => void;
  onClose: () => void;
  didOpen?: () => void;
}
const ImageDetail = ({
  source,
  resizeMode,
  origin,
  backgroundColor = '#000',
  isOpen,
  swipeToDismiss,
  renderHeader,
  renderFooter,
  onLongPress,
  onDoubleClick,
  onMove,
  onClick,
  horizontalOuterRangeOffset,
  responderRelease,
  willClose,
  onClose,
  didOpen,
}: Props) => {
  const [animatedScale] = useState<Animated.Value>(new Animated.Value(1));
  const [animatedPositionX] = useState<Animated.Value>(new Animated.Value(0));
  const [animatedPositionY] = useState<Animated.Value>(new Animated.Value(0));
  const [animatedFrame] = useState<Animated.Value>(new Animated.Value(0));
  const [animatedOpacity] = useState<Animated.Value>(
    new Animated.Value(WINDOW_HEIGHT),
  );

  const longPressTime: number = 800;
  const doubleClickInterval: number = 175;
  const maxOverflow: number = 100;
  const minScale: number = 0.6;
  const maxScale: number = 10;
  const clickDistance: number = 10;

  let lastPositionX: null | number = null;
  let lastPositionY: null | number = null;
  let zoomLastDistance: null | number = null;
  let horizontalWholeCounter: number = 0;
  let verticalWholeCounter: number = 0;
  let isDoubleClick: boolean = false;
  let isLongPress: boolean = false;
  let centerDiffX: number = 0;
  let centerDiffY: number = 0;
  let singleClickTimeout: undefined | number = undefined;
  let longPressTimeout: undefined | number = undefined;
  let lastClickTime: number = 0;
  let doubleClickX: number = 0;
  let doubleClickY: number = 0;
  let scale: number = 1;
  let positionX: number = 0;
  let positionY: number = 0;
  let zoomCurrentDistance: number = 0;
  let swipeDownOffset: number = 0;
  let horizontalWholeOuterCounter: number = 0;

  const imageDidMove = (type: string): void => {
    if (onMove) {
      onMove({
        type,
        positionX: positionX,
        positionY: positionY,
        scale: scale,
        zoomCurrentDistance: zoomCurrentDistance,
      });
    }
  };

  const panResponderReleaseResolve = () => {
    if (scale < 1) {
      scale = 1;
      Animated.timing(animatedScale, {
        toValue: scale,
        duration: 100,
      }).start();
    }

    if (WINDOW_WIDTH * scale <= WINDOW_WIDTH) {
      positionX = 0;
      Animated.timing(animatedPositionX, {
        toValue: positionX,
        duration: 100,
      }).start();
    }

    if (WINDOW_HEIGHT * scale < WINDOW_HEIGHT) {
      positionY = 0;
      Animated.timing(animatedPositionY, {
        toValue: positionY,
        duration: 100,
      }).start();
    } else if (
      swipeToDismiss &&
      scale === 1 &&
      Math.abs(positionY) > DRAG_DISMISS_THRESHOLD
    ) {
      close();
      return;
    }

    if (WINDOW_HEIGHT * scale > WINDOW_HEIGHT) {
      const verticalMax = (WINDOW_HEIGHT * scale - WINDOW_HEIGHT) / 2 / scale;
      if (positionY < -verticalMax) {
        positionY = -verticalMax;
      } else if (positionY > verticalMax) {
        positionY = verticalMax;
      }
      Animated.timing(animatedPositionY, {
        toValue: positionY,
        duration: 100,
      }).start();
    }

    if (WINDOW_WIDTH * scale > WINDOW_WIDTH) {
      const horizontalMax = (WINDOW_WIDTH * scale - WINDOW_WIDTH) / 2 / scale;
      if (positionX < -horizontalMax) {
        positionX = -horizontalMax;
      } else if (positionX > horizontalMax) {
        positionX = horizontalMax;
      }
      Animated.timing(animatedPositionX, {
        toValue: positionX,
        duration: 100,
      }).start();
    }

    if (scale === 1) {
      positionX = 0;
      positionY = 0;
      Animated.timing(animatedPositionX, {
        toValue: positionX,
        duration: 100,
      }).start();
      Animated.timing(animatedPositionY, {
        toValue: positionY,
        duration: 100,
      }).start();
    }

    Animated.timing(animatedOpacity, {
      toValue: 0,
      duration: 100,
    }).start();

    horizontalWholeOuterCounter = 0;
    swipeDownOffset = 0;

    imageDidMove('onPanResponderRelease');
  };

  const imagePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,

    onPanResponderGrant: evt => {
      lastPositionX = null;
      lastPositionY = null;
      zoomLastDistance = null;
      horizontalWholeCounter = 0;
      verticalWholeCounter = 0;
      isDoubleClick = false;
      isLongPress = false;

      if (singleClickTimeout) {
        clearTimeout(singleClickTimeout);
      }

      if (evt.nativeEvent.changedTouches.length > 1) {
        const centerX =
          (evt.nativeEvent.changedTouches[0].pageX +
            evt.nativeEvent.changedTouches[1].pageX) /
          2;
        centerDiffX = centerX - WINDOW_WIDTH / 2;

        const centerY =
          (evt.nativeEvent.changedTouches[0].pageY +
            evt.nativeEvent.changedTouches[1].pageY) /
          2;
        centerDiffY = centerY - WINDOW_HEIGHT / 2;
      }
      if (longPressTimeout) {
        clearTimeout(longPressTimeout);
      }
      longPressTimeout = setTimeout(() => {
        isLongPress = true;
        if (onLongPress) {
          onLongPress();
        }
      }, longPressTime);

      if (evt.nativeEvent.changedTouches.length <= 1) {
        if (new Date().getTime() - lastClickTime < (doubleClickInterval || 0)) {
          lastClickTime = 0;
          if (onDoubleClick) {
            onDoubleClick();
          }

          clearTimeout(longPressTimeout);

          doubleClickX = evt.nativeEvent.changedTouches[0].pageX;
          doubleClickY = evt.nativeEvent.changedTouches[0].pageY;

          isDoubleClick = true;

          if (scale > 1 || scale < 1) {
            scale = 1;

            positionX = 0;
            positionY = 0;
          } else {
            const beforeScale = scale;
            scale = 2;

            const diffScale = scale - beforeScale;
            positionX = ((WINDOW_WIDTH / 2 - doubleClickX) * diffScale) / scale;

            positionY =
              ((WINDOW_HEIGHT / 2 - doubleClickY) * diffScale) / scale;
          }

          imageDidMove('centerOn');

          Animated.parallel([
            Animated.timing(animatedScale, {
              toValue: scale,
              duration: 100,
            }),
            Animated.timing(animatedPositionX, {
              toValue: positionX,
              duration: 100,
            }),
            Animated.timing(animatedPositionY, {
              toValue: positionY,
              duration: 100,
            }),
          ]).start();
        } else {
          lastClickTime = new Date().getTime();
        }
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      if (isDoubleClick) {
        return;
      }

      if (evt.nativeEvent.changedTouches.length <= 1) {
        let diffX = gestureState.dx - (lastPositionX || 0);
        if (lastPositionX === null) {
          diffX = 0;
        }
        let diffY = gestureState.dy - (lastPositionY || 0);
        if (lastPositionY === null) {
          diffY = 0;
        }

        lastPositionX = gestureState.dx;
        lastPositionY = gestureState.dy;

        horizontalWholeCounter += diffX;
        verticalWholeCounter += diffY;

        if (
          (Math.abs(horizontalWholeCounter) > 5 ||
            Math.abs(verticalWholeCounter) > 5) &&
          longPressTimeout
        ) {
          clearTimeout(longPressTimeout);
        }

        if (swipeDownOffset === 0) {
          if (WINDOW_WIDTH * scale > WINDOW_WIDTH) {
            if (horizontalWholeOuterCounter > 0) {
              if (diffX < 0) {
                if (horizontalWholeOuterCounter > Math.abs(diffX)) {
                  horizontalWholeOuterCounter += diffX;
                  diffX = 0;
                } else {
                  diffX += horizontalWholeOuterCounter;
                  horizontalWholeOuterCounter = 0;
                  if (horizontalOuterRangeOffset) {
                    horizontalOuterRangeOffset(0);
                  }
                }
              } else {
                horizontalWholeOuterCounter += diffX;
              }
            } else if (horizontalWholeOuterCounter < 0) {
              if (diffX > 0) {
                if (Math.abs(horizontalWholeOuterCounter) > diffX) {
                  horizontalWholeOuterCounter += diffX;
                  diffX = 0;
                } else {
                  diffX += horizontalWholeOuterCounter;
                  horizontalWholeOuterCounter = 0;
                  if (horizontalOuterRangeOffset) {
                    horizontalOuterRangeOffset(0);
                  }
                }
              } else {
                horizontalWholeOuterCounter += diffX;
              }
            }

            positionX += diffX / scale;

            const horizontalMax =
              (WINDOW_WIDTH * scale - WINDOW_WIDTH) / 2 / scale;
            if (positionX < -horizontalMax) {
              positionX = -horizontalMax;
              horizontalWholeOuterCounter += -1 / 1e10;
            } else if (positionX > horizontalMax) {
              positionX = horizontalMax;
              horizontalWholeOuterCounter += 1 / 1e10;
            }
            animatedPositionX.setValue(positionX);
          } else {
            horizontalWholeOuterCounter += diffX;
          }

          if (horizontalWholeOuterCounter > (maxOverflow || 0)) {
            horizontalWholeOuterCounter = maxOverflow || 0;
          } else if (horizontalWholeOuterCounter < -(maxOverflow || 0)) {
            horizontalWholeOuterCounter = -(maxOverflow || 0);
          }

          if (horizontalWholeOuterCounter !== 0) {
            if (horizontalOuterRangeOffset) {
              horizontalOuterRangeOffset(horizontalWholeOuterCounter);
            }
          }
        }

        positionY += diffY / scale;
        animatedPositionY.setValue(positionY);
        if (swipeToDismiss && scale === 1) {
          animatedOpacity.setValue(Math.abs(gestureState.dy));
        }
      } else {
        if (longPressTimeout) {
          clearTimeout(longPressTimeout);
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
        zoomCurrentDistance = Number(diagonalDistance.toFixed(1));

        if (zoomLastDistance !== null) {
          const distanceDiff = (zoomCurrentDistance - zoomLastDistance) / 200;
          let zoom = scale + distanceDiff;

          if (zoom < minScale) {
            zoom = minScale;
          }
          if (zoom > maxScale) {
            zoom = maxScale;
          }

          const beforeScale = scale;

          scale = zoom;
          animatedScale.setValue(scale);

          const diffScale = scale - beforeScale;
          positionX -= (centerDiffX * diffScale) / scale;
          positionY -= (centerDiffY * diffScale) / scale;
          animatedPositionX.setValue(positionX);
          animatedPositionY.setValue(positionY);
        }
        zoomLastDistance = zoomCurrentDistance;
      }

      imageDidMove('onPanResponderMove');
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (longPressTimeout) {
        clearTimeout(longPressTimeout);
      }

      if (isDoubleClick) {
        return;
      }

      if (isLongPress) {
        return;
      }

      const moveDistance = Math.sqrt(
        gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy,
      );
      const {locationX, locationY, pageX, pageY} = evt.nativeEvent;

      if (
        evt.nativeEvent.changedTouches.length === 1 &&
        moveDistance < clickDistance
      ) {
        singleClickTimeout = setTimeout(() => {
          if (onClick) {
            onClick({locationX, locationY, pageX, pageY});
          }
        }, doubleClickInterval);
      } else {
        if (responderRelease) {
          responderRelease(gestureState.vx, scale);
        }

        panResponderReleaseResolve();
      }
    },
    onPanResponderTerminate: () => {},
  });

  const animateConf = {
    transform: [
      {
        scale: animatedScale,
      },
      {
        translateX: animatedPositionX,
      },
      {
        translateY: animatedPositionY,
      },
    ],
    left: animatedFrame.interpolate({
      inputRange: [0, 1],
      outputRange: [origin.x, target.x],
    }),
    top: animatedFrame.interpolate({
      inputRange: [0, 1],
      outputRange: [origin.y + STATUS_BAR_OFFSET, target.y + STATUS_BAR_OFFSET],
    }),
    width: animatedFrame.interpolate({
      inputRange: [0, 1],
      outputRange: [origin.width, WINDOW_WIDTH],
    }),
    height: animatedFrame.interpolate({
      inputRange: [0, 1],
      outputRange: [origin.height, WINDOW_HEIGHT],
    }),
  };

  const close = () => {
    if (willClose) {
      willClose();
    }

    Animated.parallel([
      Animated.timing(animatedScale, {toValue: 1}),
      Animated.timing(animatedPositionX, {toValue: 0}),
      Animated.timing(animatedPositionY, {toValue: 0}),
      Animated.timing(animatedOpacity, {toValue: WINDOW_HEIGHT}),
      Animated.spring(animatedFrame, {toValue: 0}),
    ]).start(() => {
      onClose();
    });
  };
  useEffect(() => {
    if (isOpen) {
      target = {
        x: 0,
        y: 0,
        opacity: 1,
      };

      Animated.parallel([
        Animated.timing(animatedOpacity, {toValue: 0}),
        Animated.spring(animatedFrame, {toValue: 1}),
      ]).start(() => {
        if (didOpen) {
          didOpen();
        }
      });
    }
  }, [isOpen]);

  const background = (
    <Animated.View
      style={[
        Styles.background,
        {backgroundColor: backgroundColor},
        {
          opacity: animatedOpacity.interpolate({
            inputRange: [0, WINDOW_HEIGHT],
            outputRange: [1, 0],
          }),
        },
      ]}></Animated.View>
  );

  const header = (
    <Animated.View
      style={[
        Styles.header,
        {
          opacity: animatedOpacity.interpolate({
            inputRange: [0, WINDOW_HEIGHT],
            outputRange: [1, 0],
          }),
        },
      ]}>
      {renderHeader ? (
        renderHeader(close)
      ) : (
        <SafeAreaView>
          <TouchableOpacity onPress={close}>
            <Text style={Styles.closeButton}>×</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </Animated.View>
  );

  const footer = renderFooter && (
    <Animated.View
      style={[
        Styles.footer,
        {
          opacity: animatedOpacity.interpolate({
            inputRange: [0, WINDOW_HEIGHT],
            outputRange: [1, 0],
          }),
        },
      ]}>
      {renderFooter(close)}
    </Animated.View>
  );

  const content = (
    <View
      style={{
        overflow: 'hidden',
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
      }}
      {...imagePanResponder!.panHandlers}>
      {background}
      <Animated.View style={animateConf} renderToHardwareTextureAndroid={true}>
        <Image
          resizeMode={resizeMode}
          style={{
            width: '100%',
            height: '100%',
          }}
          source={source}
        />
      </Animated.View>
      {header}
      {footer}
    </View>
  );

  return (
    <Modal visible={isOpen} transparent={true} onRequestClose={() => close()}>
      {content}
    </Modal>
  );
};

export default ImageDetail;
