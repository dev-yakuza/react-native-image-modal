import React from 'react';
import { Animated, View, TouchableOpacity, Image, ImageProps } from 'react-native';

import { IOnTap, IOnMove } from './types';
import ImageDetail from './ImageDetail';

interface State {
  isOpen: boolean;
  origin: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
interface Props extends ImageProps {
  swipeToDismiss?: boolean;
  imageBackgroundColor?: string;
  overlayBackgroundColor?: string;
  onLongPressOriginImage?: () => void;
  renderHeader?: (close: () => void) => JSX.Element | Array<JSX.Element>;
  renderFooter?: (close: () => void) => JSX.Element | Array<JSX.Element>;
  onTap?: (eventParams: IOnTap) => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onOpen?: () => void;
  didOpen?: () => void;
  onMove?: (position: IOnMove) => void;
  responderRelease?: (vx?: number, scale?: number) => void;
  willClose?: () => void;
  onClose?: () => void;
}
export default class ImageModal extends React.Component<Props, State> {
  private _root: View | null = null;
  private _originImageOpacity = new Animated.Value(1);

  constructor(props: Props) {
    super(props);

    this.state = {
      isOpen: false,
      origin: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    };
  }

  private _open = () => {
    this._root?.measure((ox: number, oy: number, width: number, height: number, px: number, py: number) => {
      const { onOpen } = this.props;
      if (typeof onOpen === 'function') {
        onOpen();
      }

      this.setState({
        isOpen: true,
        origin: {
          width,
          height,
          x: px,
          y: py,
        },
      });

      this._root && this._originImageOpacity.setValue(0);
    });
  };

  private _onClose = () => {
    const { onClose } = this.props;
    this._originImageOpacity.setValue(1);

    setTimeout(() => {
      this.setState({
        isOpen: false,
      });

      if (typeof onClose === 'function') {
        onClose();
      }
    });
  };

  render() {
    const {
      source,
      resizeMode,
      swipeToDismiss = true,
      imageBackgroundColor,
      overlayBackgroundColor,
      onLongPressOriginImage,
      renderHeader,
      renderFooter,
      onTap,
      onDoubleTap,
      onLongPress,
      didOpen,
      onMove,
      responderRelease,
      willClose,
    } = this.props;
    const { isOpen, origin } = this.state;
    return (
      <View
        ref={(component) => (this._root = component)}
        style={[{ alignSelf: 'baseline', backgroundColor: imageBackgroundColor }]}
      >
        <Animated.View
          useNativeDriver={true}
          renderToHardwareTextureAndroid={true}
          style={{ opacity: this._originImageOpacity }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{ alignSelf: 'baseline' }}
            onPress={this._open}
            onLongPress={onLongPressOriginImage}
          >
            <Image {...this.props} />
          </TouchableOpacity>
        </Animated.View>
        <ImageDetail
          isOpen={isOpen}
          origin={origin}
          source={source}
          resizeMode={resizeMode}
          backgroundColor={overlayBackgroundColor}
          swipeToDismiss={swipeToDismiss}
          renderHeader={renderHeader}
          renderFooter={renderFooter}
          onTap={onTap}
          onDoubleTap={onDoubleTap}
          onLongPress={onLongPress}
          didOpen={didOpen}
          onMove={onMove}
          responderRelease={responderRelease}
          willClose={willClose}
          onClose={this._onClose}
        />
      </View>
    );
  }
}
