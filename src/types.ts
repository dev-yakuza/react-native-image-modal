export interface OnMove {
  type: string;
  positionX: number;
  positionY: number;
  scale: number;
  zoomCurrentDistance: number;
}

export interface OnTap {
  locationX: number;
  locationY: number;
  pageX: number;
  pageY: number;
}
