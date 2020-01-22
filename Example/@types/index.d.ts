interface IOnMove {
  type: string;
  positionX: number;
  positionY: number;
  scale: number;
  zoomCurrentDistance: number;
}

interface IOnClick {
  locationX: number;
  locationY: number;
  pageX: number;
  pageY: number;
}
