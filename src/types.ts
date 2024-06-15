interface OnMove {
  readonly type: string
  readonly positionX: number
  readonly positionY: number
  readonly scale: number
  readonly zoomCurrentDistance: number
}

interface OnTap {
  readonly locationX: number
  readonly locationY: number
  readonly pageX: number
  readonly pageY: number
}

export type { OnMove, OnTap }
