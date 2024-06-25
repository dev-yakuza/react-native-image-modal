const VISIBLE_OPACITY = 1
const MIN_SCALE = 0.6
const MAX_SCALE = 10
const INITIAL_SCALE = 1

const getDistanceFromLastPosition = (
  lastPosition: {
    readonly x: number
    readonly y: number
  },
  distancePosition: { readonly dx: number; readonly dy: number },
) => {
  const { x, y } = lastPosition
  const { dx, dy } = distancePosition

  return { dx: dx - x, dy: dy - y }
}

const getImagePositionFromDistanceInScale = (
  scale: number,
  position: {
    readonly x: number
    readonly y: number
  },
  distancePosition: { readonly dx: number; readonly dy: number },
) => {
  const { dx, dy } = distancePosition
  const { x, y } = position

  return { x: x + dx / scale, y: y + dy / scale }
}

const getDistanceBetweenTouches = (
  firstFinger: { readonly pageX: number; readonly pageY: number },
  secondFinger: { readonly pageX: number; readonly pageY: number },
) => {
  const { pageX: x0, pageY: y0 } = firstFinger
  const { pageX: x1, pageY: y1 } = secondFinger
  const xDistance = Math.abs(x0 - x1)
  const yDistance = Math.abs(y0 - y1)
  const diagonalDistance = Math.sqrt(xDistance * xDistance + yDistance * yDistance)
  return Number(diagonalDistance.toFixed(1))
}

const getZoomFromDistance = (scale: number, distanceDiff: number) => {
  const zoom = scale + distanceDiff
  if (zoom < MIN_SCALE) {
    return MIN_SCALE
  }
  if (zoom > MAX_SCALE) {
    return MAX_SCALE
  }
  return zoom
}

const getPositionFromDistanceInScale = ({
  currentPosition,
  centerDiff,
  distanceDiff,
  zoom,
}: {
  readonly currentPosition: { readonly x: number; readonly y: number }
  readonly centerDiff: { readonly x: number; readonly y: number }
  readonly distanceDiff: number
  readonly zoom: number
}) => {
  return {
    x: currentPosition.x - (centerDiff.x * distanceDiff) / zoom,
    y: currentPosition.y - (centerDiff.y * distanceDiff) / zoom,
  }
}

const getMaxPosition = (
  scale: number,
  position: { readonly x: number; readonly y: number },
  windowLayout: { readonly width: number; readonly height: number },
): { x: number; y: number } => {
  const { width, height } = windowLayout

  let { x, y } = position
  const horizontalMax = (width * scale - width) / 2 / scale
  x = Math.max(-horizontalMax, Math.min(horizontalMax, x))

  const verticalMax = (height * scale - height) / 2 / scale
  y = Math.max(-verticalMax, Math.min(verticalMax, y))
  return { x, y }
}

const getCenterPositionBetweenTouches = (
  firstTouch: { readonly pageX: number; readonly pageY: number },
  secondTouch: { readonly pageX: number; readonly pageY: number },
  windowLayout: { readonly width: number; readonly height: number },
) => {
  const { width, height } = windowLayout
  const centerX = (firstTouch.pageX + secondTouch.pageX) / 2
  const centerY = (firstTouch.pageY + secondTouch.pageY) / 2
  return {
    x: centerX - width / 2,
    y: centerY - height / 2,
  }
}

const getZoomAndPositionFromDoubleTap = (
  scale: number,
  position: { readonly pageX: number; readonly pageY: number },
  windowLayout: { readonly width: number; readonly height: number },
) => {
  // If image is zoomed in, double tap to zoom out
  if (scale !== INITIAL_SCALE) {
    return {
      scale: INITIAL_SCALE,
      position: { x: 0, y: 0 },
    }
  }

  const { width, height } = windowLayout
  // If image is zoomed out, double tap to zoom in
  const { pageX: doubleClickX, pageY: doubleClickY } = position
  const beforeScale = scale
  const newScale = 2

  const diffScale = newScale - beforeScale
  const x = ((width / 2 - doubleClickX) * diffScale) / scale
  const y = ((height / 2 - doubleClickY) * diffScale) / scale

  return {
    scale: newScale,
    position: getMaxPosition(newScale, { x, y }, { width, height }),
  }
}

const getOpacityFromSwipe = ({
  swipeToDismiss,
  scale,
  dy,
  windowHeight,
}: {
  readonly swipeToDismiss: boolean
  readonly scale: number
  readonly dy: number
  readonly windowHeight: number
}) => {
  if (swipeToDismiss && scale === INITIAL_SCALE) {
    return (windowHeight - Math.abs(dy)) / windowHeight
  }
  return VISIBLE_OPACITY
}

export {
  VISIBLE_OPACITY,
  getDistanceFromLastPosition,
  getImagePositionFromDistanceInScale,
  getDistanceBetweenTouches,
  getZoomFromDistance,
  getPositionFromDistanceInScale,
  getMaxPosition,
  getCenterPositionBetweenTouches,
  getZoomAndPositionFromDoubleTap,
  getOpacityFromSwipe,
}
