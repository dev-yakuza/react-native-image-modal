import type { MutableRefObject } from 'react'
import { useRef, type ReactNode } from 'react'
import type {
  GestureResponderEvent,
  ImageResizeMode,
  ImageSourcePropType,
  ImageStyle,
  PanResponderGestureState,
  StyleProp,
} from 'react-native'
import { StyleSheet, Image, PanResponder, View } from 'react-native'
import { Animated } from 'react-native'
import type { OnMove, OnTap } from '../../../../types'

const INITIAL_SCALE = 1
const LONG_PRESS_TIME = 800
const DOUBLE_CLICK_INTERVAL = 250
const MIN_SCALE = 0.6
const MAX_SCALE = 10
const CLICK_DISTANCE = 10
const DRAG_DISMISS_THRESHOLD = 150
const INITIAL_ZOOM_DISTANCE = -1

const Styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
})

interface Props {
  readonly renderToHardwareTextureAndroid: boolean
  readonly isAnimated: MutableRefObject<boolean>
  readonly animatedOpacity: Animated.Value
  readonly animatedScale: Animated.Value
  readonly animatedPosition: Animated.ValueXY
  readonly animatedImagePosition: Animated.ValueXY
  readonly animatedImageWidth: Animated.Value
  readonly animatedImageHeight: Animated.Value
  readonly windowWidth: number
  readonly windowHeight: number
  readonly source: ImageSourcePropType
  readonly resizeMode?: ImageResizeMode
  readonly imageStyle?: StyleProp<ImageStyle>
  readonly swipeToDismiss?: boolean
  readonly animationDuration: number
  renderImageComponent?(params: {
    readonly source: ImageSourcePropType
    readonly style?: StyleProp<ImageStyle>
    readonly resizeMode?: ImageResizeMode
  }): ReactNode
  onClose(): void
  onDoubleTap?(): void
  onLongPress?(): void
  responderRelease?(vx?: number, scale?: number): void
  onTap?(eventParams: OnTap): void
  onMove?(position: OnMove): void
}

const ImageArea = ({
  renderToHardwareTextureAndroid,
  isAnimated,
  animatedOpacity,
  animatedScale,
  animatedPosition,
  animatedImagePosition,
  animatedImageWidth,
  animatedImageHeight,
  windowWidth,
  windowHeight,
  source,
  resizeMode,
  imageStyle,
  swipeToDismiss,
  animationDuration,
  renderImageComponent,
  onClose,
  onDoubleTap,
  onLongPress,
  onTap,
  onMove,
  responderRelease,
}: Props) => {
  const _scale = useRef(INITIAL_SCALE)

  const _position = useRef({ x: 0, y: 0 })
  const _lastPosition = useRef({ x: 0, y: 0 })
  const _centerDiff = useRef({ x: 0, y: 0 })
  const _zoomLastDistance = useRef(INITIAL_ZOOM_DISTANCE)
  const _zoomCurrentDistance = useRef(INITIAL_ZOOM_DISTANCE)
  const _singleClickTimeout = useRef<undefined | NodeJS.Timeout>(undefined)
  const _longPressTimeout = useRef<undefined | NodeJS.Timeout>(undefined)
  const _lastClickTime = useRef(0)
  const _isDoubleClick = useRef(false)
  const _isLongPress = useRef(false)

  const moveImageToGesture = (gestureState: PanResponderGestureState) => {
    const { x, y } = _lastPosition.current
    const { dx, dy } = gestureState
    const diffX = dx - x
    const diffY = dy - y

    _lastPosition.current = { x: dx, y: dy }

    if (_longPressTimeout.current) {
      clearTimeout(_longPressTimeout.current)
      _longPressTimeout.current = undefined
    }

    if (_scale.current > 1) {
      let x = _position.current.x
      x += diffX / _scale.current

      const horizontalMax = (windowWidth * _scale.current - windowWidth) / 2 / _scale.current
      if (x < -horizontalMax) {
        x = -horizontalMax
      } else if (x > horizontalMax) {
        x = horizontalMax
      }
      _position.current.x = x
      animatedPosition.setValue(_position.current)
    }

    let positionY = _position.current.y
    positionY += diffY / _scale.current
    _position.current.y = positionY
    animatedPosition.setValue(_position.current)
    if (swipeToDismiss && _scale.current === INITIAL_SCALE) {
      animatedOpacity.setValue((windowHeight - Math.abs(gestureState.dy)) / windowHeight)
    }
  }

  const pinchZoom = (event: GestureResponderEvent) => {
    // Pinch to zoom
    if (_longPressTimeout.current) {
      clearTimeout(_longPressTimeout.current)
      _longPressTimeout.current = undefined
    }
    let minX: number
    let maxX: number
    if (
      event.nativeEvent.changedTouches[0].locationX > event.nativeEvent.changedTouches[1].locationX
    ) {
      minX = event.nativeEvent.changedTouches[1].pageX
      maxX = event.nativeEvent.changedTouches[0].pageX
    } else {
      minX = event.nativeEvent.changedTouches[0].pageX
      maxX = event.nativeEvent.changedTouches[1].pageX
    }
    let minY: number
    let maxY: number
    if (
      event.nativeEvent.changedTouches[0].locationY > event.nativeEvent.changedTouches[1].locationY
    ) {
      minY = event.nativeEvent.changedTouches[1].pageY
      maxY = event.nativeEvent.changedTouches[0].pageY
    } else {
      minY = event.nativeEvent.changedTouches[0].pageY
      maxY = event.nativeEvent.changedTouches[1].pageY
    }
    const widthDistance = maxX - minX
    const heightDistance = maxY - minY
    const diagonalDistance = Math.sqrt(
      widthDistance * widthDistance + heightDistance * heightDistance,
    )
    _zoomCurrentDistance.current = Number(diagonalDistance.toFixed(1))
    if (_zoomLastDistance.current !== INITIAL_ZOOM_DISTANCE) {
      // Update zoom
      const distanceDiff = (_zoomCurrentDistance.current - _zoomLastDistance.current) / 200
      let zoom = _scale.current + distanceDiff
      if (zoom < MIN_SCALE) {
        zoom = MIN_SCALE
      }
      if (zoom > MAX_SCALE) {
        zoom = MAX_SCALE
      }
      _scale.current = zoom
      animatedScale.setValue(_scale.current)

      // Update image position
      _position.current.x -= (_centerDiff.current.x * distanceDiff) / zoom
      _position.current.y -= (_centerDiff.current.y * distanceDiff) / zoom
      animatedPosition.setValue(_position.current)
    }
    _zoomLastDistance.current = _zoomCurrentDistance.current
  }

  const handleImageMove = (type: string): void => {
    const { x: positionX, y: positionY } = _position.current
    onMove?.({
      type,
      positionX,
      positionY,
      scale: _scale.current,
      zoomCurrentDistance: _zoomCurrentDistance.current,
    })
  }

  const handlePanResponderReleaseResolve = (changedTouchesCount: number): void => {
    // When image is zoomed out and finger is released,
    // Move image position to the center of the screen.
    if (_scale.current < INITIAL_SCALE) {
      _position.current = {
        x: 0,
        y: 0,
      }
      Animated.timing(animatedPosition, {
        toValue: _position.current,
        duration: animationDuration,
        useNativeDriver: false,
      }).start()
      return
    }

    // When image is zoomed in and finger is released,
    // Move image position
    if (_scale.current > INITIAL_SCALE) {
      const verticalMax = (windowHeight * _scale.current - windowHeight) / 2 / _scale.current
      let { x: positionX, y: positionY } = _position.current
      if (positionY < -verticalMax) {
        positionY = -verticalMax
      } else if (positionY > verticalMax) {
        positionY = verticalMax
      }

      const horizontalMax = (windowWidth * _scale.current - windowWidth) / 2 / _scale.current
      if (positionX < -horizontalMax) {
        positionX = -horizontalMax
      } else if (positionX > horizontalMax) {
        positionX = horizontalMax
      }

      Animated.timing(animatedPosition, {
        toValue: { x: positionX, y: positionY },
        duration: animationDuration,
        useNativeDriver: false,
      }).start()
    }

    // When image is normal and finger is released with swipe up or down,
    // Close image detail.
    if (
      swipeToDismiss &&
      _scale.current === INITIAL_SCALE &&
      changedTouchesCount === 1 &&
      Math.abs(_position.current.y) > DRAG_DISMISS_THRESHOLD
    ) {
      onClose()
      return
    }

    // When finger is released in original size of image,
    // image should move to the center of the screen.
    if (_scale.current === INITIAL_SCALE) {
      _position.current = {
        x: 0,
        y: 0,
      }
      Animated.timing(animatedPosition, {
        toValue: _position.current,
        duration: animationDuration,
        useNativeDriver: false,
      }).start()
    }

    // When finger is released,
    // background should return to its normal opacity.
    Animated.timing(animatedOpacity, {
      toValue: 1,
      duration: animationDuration,
      useNativeDriver: false,
    }).start()

    handleImageMove('onPanResponderRelease')
  }

  const handlePanResponderGrant = (event: GestureResponderEvent) => {
    if (isAnimated.current) {
      return
    }
    _lastPosition.current = { x: 0, y: 0 }
    _zoomLastDistance.current = INITIAL_ZOOM_DISTANCE
    _isDoubleClick.current = false
    _isLongPress.current = false

    // Clear single click timeout
    if (_singleClickTimeout.current) {
      clearTimeout(_singleClickTimeout.current)
      _singleClickTimeout.current = undefined
    }

    // Calculate center diff for pinch to zoom
    if (event.nativeEvent.changedTouches.length > 1) {
      const centerX =
        (event.nativeEvent.changedTouches[0].pageX + event.nativeEvent.changedTouches[1].pageX) / 2
      const centerY =
        (event.nativeEvent.changedTouches[0].pageY + event.nativeEvent.changedTouches[1].pageY) / 2
      _centerDiff.current = {
        x: centerX - windowWidth / 2,
        y: centerY - windowHeight / 2,
      }
    }

    // Clear long press timeout
    if (_longPressTimeout.current) {
      clearTimeout(_longPressTimeout.current)
      _longPressTimeout.current = undefined
    }
    _longPressTimeout.current = setTimeout(() => {
      _isLongPress.current = true
      onLongPress?.()
    }, LONG_PRESS_TIME)

    // Double tap to zoom
    if (event.nativeEvent.changedTouches.length <= 1) {
      if (new Date().getTime() - _lastClickTime.current < (DOUBLE_CLICK_INTERVAL || 0)) {
        _lastClickTime.current = 0
        onDoubleTap?.()

        clearTimeout(_longPressTimeout.current)
        _longPressTimeout.current = undefined

        const doubleClickPosition = {
          x: event.nativeEvent.changedTouches[0].pageX,
          y: event.nativeEvent.changedTouches[0].pageY,
        }

        _isDoubleClick.current = true

        if (_scale.current !== INITIAL_SCALE) {
          _scale.current = INITIAL_SCALE
          _position.current = { x: 0, y: 0 }
        } else {
          const { x: doubleClickX, y: doubleClickY } = doubleClickPosition
          const beforeScale = _scale.current
          _scale.current = 2

          const diffScale = _scale.current - beforeScale
          const x = ((windowWidth / 2 - doubleClickX) * diffScale) / _scale.current
          const y = ((windowHeight / 2 - doubleClickY) * diffScale) / _scale.current
          _position.current = {
            x,
            y,
          }
        }

        handleImageMove('centerOn')

        Animated.parallel([
          Animated.timing(animatedScale, {
            toValue: _scale.current,
            duration: animationDuration,
            useNativeDriver: false,
          }),
          Animated.timing(animatedPosition, {
            toValue: _position.current,
            duration: animationDuration,
            useNativeDriver: false,
          }),
        ]).start()
      } else {
        _lastClickTime.current = new Date().getTime()
      }
    }
  }

  const handlePanResponderMove = (
    event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => {
    if (_isDoubleClick.current || isAnimated.current) {
      return
    }

    // Single tap to move image
    if (event.nativeEvent.changedTouches.length <= 1) {
      moveImageToGesture(gestureState)
    } else {
      pinchZoom(event)
    }

    handleImageMove('onPanResponderMove')
  }

  const handlePanResponderRelease = (
    event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => {
    if (_longPressTimeout.current) {
      clearTimeout(_longPressTimeout.current)
      _longPressTimeout.current = undefined
    }

    if (_isDoubleClick.current || _isLongPress.current || isAnimated.current) {
      return
    }

    const moveDistance = Math.sqrt(
      gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy,
    )
    const { locationX, locationY, pageX, pageY } = event.nativeEvent

    if (event.nativeEvent.changedTouches.length === 1 && moveDistance < CLICK_DISTANCE) {
      _singleClickTimeout.current = setTimeout(() => {
        onTap?.({ locationX, locationY, pageX, pageY })
      }, DOUBLE_CLICK_INTERVAL)
    } else {
      responderRelease?.(gestureState.vx, _scale.current)
      handlePanResponderReleaseResolve(event.nativeEvent.changedTouches.length)
    }
  }

  const _imagePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: handlePanResponderGrant,
    onPanResponderMove: handlePanResponderMove,
    onPanResponderRelease: handlePanResponderRelease,
  })

  return (
    <View
      style={{
        overflow: 'hidden',
        flex: 1,
      }}
      {..._imagePanResponder?.panHandlers}
    >
      <Animated.View
        style={{
          transform: [
            {
              scale: animatedScale,
            },
            {
              translateX: animatedPosition.x,
            },
            {
              translateY: animatedPosition.y,
            },
          ],
          left: animatedImagePosition.x,
          top: animatedImagePosition.y,
          width: animatedImageWidth,
          height: animatedImageHeight,
        }}
        renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
      >
        {typeof renderImageComponent === 'function' ? (
          renderImageComponent({
            source,
            resizeMode,
            style: [imageStyle, Styles['image']],
          })
        ) : (
          <Image resizeMode={resizeMode} style={[imageStyle, Styles['image']]} source={source} />
        )}
      </Animated.View>
    </View>
  )
}

export { ImageArea }
