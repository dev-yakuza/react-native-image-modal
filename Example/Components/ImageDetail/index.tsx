import React, {useState} from 'react';
import {View, Image, Dimensions, Animated, PanResponder} from 'react-native';

interface Props {
  children: JSX.Element | Array<JSX.Element>;
  onLongPress?: () => void;
  onDoubleClick?: () => void;
  onMove?: (position: IOnMove) => void;
  onClick?: (eventParams: IOnClick) => void;
  onSwipeDown?: () => void;
  horizontalOuterRangeOffset?: (offsetX?: number) => void;
  responderRelease?: (vx?: number, scale?: number) => void;
}
const ImageDetail = ({
  children,
  onLongPress,
  onDoubleClick,
  onMove,
  onClick,
  horizontalOuterRangeOffset,
  responderRelease,
}: Props) => {
  const windowSize = Dimensions.get('window');

  const [animatedScale] = useState<Animated.Value>(new Animated.Value(1));
  const [animatedPositionX] = useState<Animated.Value>(new Animated.Value(0));
  const [animatedPositionY] = useState<Animated.Value>(new Animated.Value(0));

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

    if (windowSize.width * scale <= windowSize.width) {
      positionX = 0;
      Animated.timing(animatedPositionX, {
        toValue: positionX,
        duration: 100,
      }).start();
    }

    if (windowSize.height * scale <= windowSize.height) {
      positionY = 0;
      Animated.timing(animatedPositionY, {
        toValue: positionY,
        duration: 100,
      }).start();
    }

    if (windowSize.height * scale > windowSize.height) {
      const verticalMax =
        (windowSize.height * scale - windowSize.height) / 2 / scale;
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

    if (windowSize.width * scale > windowSize.width) {
      const horizontalMax =
        (windowSize.width * scale - windowSize.width) / 2 / scale;
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
        centerDiffX = centerX - windowSize.width / 2;

        const centerY =
          (evt.nativeEvent.changedTouches[0].pageY +
            evt.nativeEvent.changedTouches[1].pageY) /
          2;
        centerDiffY = centerY - windowSize.height / 2;
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
            positionX =
              ((windowSize.width / 2 - doubleClickX) * diffScale) / scale;

            positionY =
              ((windowSize.height / 2 - doubleClickY) * diffScale) / scale;
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
          if (windowSize.width * scale > windowSize.width) {
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
              (windowSize.width * scale - windowSize.width) / 2 / scale;
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

        if (windowSize.height * scale > windowSize.height) {
          positionY += diffY / scale;
          animatedPositionY.setValue(positionY);
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
  };

  return (
    <View
      style={{
        overflow: 'hidden',
        width: windowSize.width,
        height: windowSize.height,
      }}
      {...imagePanResponder!.panHandlers}>
      <Animated.View style={animateConf} renderToHardwareTextureAndroid={true}>
        {children}
      </Animated.View>
    </View>
  );
};

export default ImageDetail;
