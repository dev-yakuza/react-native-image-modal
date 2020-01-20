import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';

const Style = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
});

interface Props {
  onLongPress?: () => void;
}
const App = ({onLongPress}: Props) => {
  // const imageSource = {
  //   uri:
  //     'https://cdn.pixabay.com/photo/2019/07/25/18/58/church-4363258_960_720.jpg',
  // };
  // const imageSource = {
  //   uri:
  //     'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
  // };
  // const imageSource = require('./images/horizontal.jpg');
  const imageSource = require('./images/vertical.jpg');
  const windowSize = Dimensions.get('window');

  const [animatedScale] = useState<Animated.Value>(new Animated.Value(1));
  const [animatedPositionX] = useState<Animated.Value>(new Animated.Value(0));
  const [animatedPositionY] = useState<Animated.Value>(new Animated.Value(0));

  let lastPositionX: null | number = null;
  let lastPositionY: null | number = null;
  let zoomLastDistance: null | number = null;
  let horizontalWholeCounter: number = 0;
  let verticalWholeCounter: number = 0;
  let isDoubleClick: boolean = false;
  let isLongPress: boolean = false;
  let isHorizontalWrap: boolean = false;
  let centerDiffX: number = 0;
  let centerDiffY: number = 0;
  let singleClickTimeout: undefined | number = undefined;
  let longPressTimeout: undefined | number = undefined;

  const imagePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,

    onPanResponderGrant: evt => {
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

      // 计算长按
      if (longPressTimeout) {
        clearTimeout(longPressTimeout);
      }
      longPressTimeout = setTimeout(() => {
        isLongPress = true;
        if (onLongPress) {
          onLongPress();
        }
      }, props.longPressTime);

      if (evt.nativeEvent.changedTouches.length <= 1) {
        // 一个手指的情况
        if (
          new Date().getTime() - lastClickTime <
          (props.doubleClickInterval || 0)
        ) {
          // 认为触发了双击
          lastClickTime = 0;
          if (props.onDoubleClick) {
            props.onDoubleClick();
          }

          // 取消长按
          clearTimeout(longPressTimeout);

          // 因为可能触发放大，因此记录双击时的坐标位置
          doubleClickX = evt.nativeEvent.changedTouches[0].pageX;
          doubleClickY = evt.nativeEvent.changedTouches[0].pageY;

          // 缩放
          isDoubleClick = true;

          if (props.enableDoubleClickZoom) {
            if (scale > 1 || scale < 1) {
              // 回归原位
              scale = 1;

              positionX = 0;
              positionY = 0;
            } else {
              // 开始在位移地点缩放
              // 记录之前缩放比例
              // 此时 scale 一定为 1
              const beforeScale = scale;

              // 开始缩放
              scale = 2;

              // 缩放 diff
              const diffScale = scale - beforeScale;
              // 找到两手中心点距离页面中心的位移
              // 移动位置
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
          }
        } else {
          lastClickTime = new Date().getTime();
        }
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      if (isDoubleClick) {
        // 有时双击会被当做位移，这里屏蔽掉
        return;
      }

      if (evt.nativeEvent.changedTouches.length <= 1) {
        // x 位移
        let diffX = gestureState.dx - (lastPositionX || 0);
        if (lastPositionX === null) {
          diffX = 0;
        }
        // y 位移
        let diffY = gestureState.dy - (lastPositionY || 0);
        if (lastPositionY === null) {
          diffY = 0;
        }

        // 保留这一次位移作为下次的上一次位移
        lastPositionX = gestureState.dx;
        lastPositionY = gestureState.dy;

        horizontalWholeCounter += diffX;
        verticalWholeCounter += diffY;

        if (
          Math.abs(horizontalWholeCounter) > 5 ||
          Math.abs(verticalWholeCounter) > 5
        ) {
          // 如果位移超出手指范围，取消长按监听
          clearTimeout(longPressTimeout);
        }

        if (props.panToMove) {
          // 处理左右滑，如果正在 swipeDown，左右滑失效
          if (swipeDownOffset === 0) {
            if (Math.abs(diffX) > Math.abs(diffY)) {
              isHorizontalWrap = true;
            }

            // diffX > 0 表示手往右滑，图往左移动，反之同理
            // horizontalWholeOuterCounter > 0 表示溢出在左侧，反之在右侧，绝对值越大溢出越多
            if (props.imageWidth * scale > windowSize.width) {
              // 如果图片宽度大图盒子宽度， 可以横向拖拽
              // 没有溢出偏移量或者这次位移完全收回了偏移量才能拖拽
              if (horizontalWholeOuterCounter > 0) {
                // 溢出在右侧
                if (diffX < 0) {
                  // 从右侧收紧
                  if (horizontalWholeOuterCounter > Math.abs(diffX)) {
                    // 偏移量还没有用完
                    horizontalWholeOuterCounter += diffX;
                    diffX = 0;
                  } else {
                    // 溢出量置为0，偏移量减去剩余溢出量，并且可以被拖动
                    diffX += horizontalWholeOuterCounter;
                    horizontalWholeOuterCounter = 0;
                    if (props.horizontalOuterRangeOffset) {
                      props.horizontalOuterRangeOffset(0);
                    }
                  }
                } else {
                  // 向右侧扩增
                  horizontalWholeOuterCounter += diffX;
                }
              } else if (horizontalWholeOuterCounter < 0) {
                // 溢出在左侧
                if (diffX > 0) {
                  // 从左侧收紧
                  if (Math.abs(horizontalWholeOuterCounter) > diffX) {
                    // 偏移量还没有用完
                    horizontalWholeOuterCounter += diffX;
                    diffX = 0;
                  } else {
                    // 溢出量置为0，偏移量减去剩余溢出量，并且可以被拖动
                    diffX += horizontalWholeOuterCounter;
                    horizontalWholeOuterCounter = 0;
                    if (props.horizontalOuterRangeOffset) {
                      props.horizontalOuterRangeOffset(0);
                    }
                  }
                } else {
                  // 向左侧扩增
                  horizontalWholeOuterCounter += diffX;
                }
              } else {
                // 溢出偏移量为0，正常移动
              }

              // 产生位移
              positionX += diffX / scale;

              // 但是横向不能出现黑边
              // 横向能容忍的绝对值
              const horizontalMax =
                (props.imageWidth * scale - windowSize.width) / 2 / scale;
              if (positionX < -horizontalMax) {
                // 超越了左边临界点，还在继续向左移动
                positionX = -horizontalMax;

                // 让其产生细微位移，偏离轨道
                horizontalWholeOuterCounter += -1 / 1e10;
              } else if (positionX > horizontalMax) {
                // 超越了右侧临界点，还在继续向右移动
                positionX = horizontalMax;

                // 让其产生细微位移，偏离轨道
                horizontalWholeOuterCounter += 1 / 1e10;
              }
              animatedPositionX.setValue(positionX);
            } else {
              // 不能横向拖拽，全部算做溢出偏移量
              horizontalWholeOuterCounter += diffX;
            }

            // 溢出量不会超过设定界限
            if (horizontalWholeOuterCounter > (props.maxOverflow || 0)) {
              horizontalWholeOuterCounter = props.maxOverflow || 0;
            } else if (
              horizontalWholeOuterCounter < -(props.maxOverflow || 0)
            ) {
              horizontalWholeOuterCounter = -(props.maxOverflow || 0);
            }

            if (horizontalWholeOuterCounter !== 0) {
              // 如果溢出偏移量不是0，执行溢出回调
              if (props.horizontalOuterRangeOffset) {
                props.horizontalOuterRangeOffset(horizontalWholeOuterCounter);
              }
            }
          }

          // 如果图片高度大于盒子高度， 可以纵向弹性拖拽
          if (props.imageHeight * scale > windowSize.height) {
            positionY += diffY / scale;
            animatedPositionY.setValue(positionY);

            // 如果图片上边缘脱离屏幕上边缘，则进入 swipeDown 动作
            // if (
            //   (props.imageHeight / 2 - positionY) * scale <
            //   windowSize.height / 2
            // ) {
            //   if (props.enableSwipeDown) {
            //     swipeDownOffset += diffY

            //     // 只要滑动溢出量不小于 0，就可以拖动
            //     if (swipeDownOffset > 0) {
            //       positionY += diffY / scale
            //       animatedPositionY.setValue(positionY)

            //       // 越到下方，缩放越小
            //       scale = scale - diffY / 1000
            //       animatedScale.setValue(scale)
            //     }
            //   }
            // }
          } else {
            // swipeDown 不允许在已经有横向偏移量时触发
            if (props.enableSwipeDown && !isHorizontalWrap) {
              // 图片高度小于盒子高度，只能向下拖拽，而且一定是 swipeDown 动作
              swipeDownOffset += diffY;

              // 只要滑动溢出量不小于 0，就可以拖动
              if (swipeDownOffset > 0) {
                positionY += diffY / scale;
                animatedPositionY.setValue(positionY);

                // 越到下方，缩放越小
                scale = scale - diffY / 1000;
                animatedScale.setValue(scale);
              }
            }
          }
        }
      } else {
        // 多个手指的情况
        // 取消长按状态
        if (longPressTimeout) {
          clearTimeout(longPressTimeout);
        }

        if (props.pinchToZoom) {
          // 找最小的 x 和最大的 x
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

            if (zoom < (this!.props!.minScale || 0)) {
              zoom = this!.props!.minScale || 0;
            }
            if (zoom > (this!.props!.maxScale || 0)) {
              zoom = this!.props!.maxScale || 0;
            }

            // 记录之前缩放比例
            const beforeScale = scale;

            // 开始缩放
            scale = zoom;
            animatedScale.setValue(scale);

            // 图片要慢慢往两个手指的中心点移动
            // 缩放 diff
            const diffScale = scale - beforeScale;
            // 找到两手中心点距离页面中心的位移
            // 移动位置
            positionX -= (centerDiffX * diffScale) / scale;
            positionY -= (centerDiffY * diffScale) / scale;
            animatedPositionX.setValue(positionX);
            animatedPositionY.setValue(positionY);
          }
          zoomLastDistance = zoomCurrentDistance;
        }
      }

      imageDidMove('onPanResponderMove');
    },
    onPanResponderRelease: (evt, gestureState) => {
      // 取消长按
      if (longPressTimeout) {
        clearTimeout(longPressTimeout);
      }

      // 双击结束，结束尾判断
      if (isDoubleClick) {
        return;
      }

      // 长按结束，结束尾判断
      if (isLongPress) {
        return;
      }

      const moveDistance = Math.sqrt(
        gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy,
      );
      const {locationX, locationY, pageX, pageY} = evt.nativeEvent;

      if (
        evt.nativeEvent.changedTouches.length === 1 &&
        moveDistance < (props.clickDistance || 0)
      ) {
        singleClickTimeout = setTimeout(() => {
          if (props.onClick) {
            props.onClick({locationX, locationY, pageX, pageY});
          }
        }, props.doubleClickInterval);
      } else {
        // 多手势结束，或者滑动结束
        if (props.responderRelease) {
          props.responderRelease(gestureState.vx, scale);
        }

        panResponderReleaseResolve();
      }
    },
    onPanResponderTerminate: () => {
      //
    },
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
    <View style={Style.Container}>
      <Animated.View style={animateConf} renderToHardwareTextureAndroid={true}>
        <Image
          resizeMode="contain"
          style={{
            width: windowSize.width,
            height: windowSize.height,
          }}
          source={imageSource}
        />
      </Animated.View>
    </View>
  );
};

export default App;
