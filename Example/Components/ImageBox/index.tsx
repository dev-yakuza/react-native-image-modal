import React, {useState, useRef, Children, cloneElement} from 'react';
import {Animated, TouchableHighlight, View, ViewStyle} from 'react-native';

import ImageOverlay from '../ImageOverlay';

interface Props {
  activeProps?: object;
  children: JSX.Element | Array<JSX.Element>;
  swipeToDismiss?: boolean;
  backgroundColor?: string;
  style?: ViewStyle;
  underlayColor?: string;
  onLongPress?: () => void;
  onOpen?: () => void;
  willClose?: () => void;
  renderHeader?: (close: () => void) => JSX.Element | Array<JSX.Element>;
  didOpen?: () => void;
  renderContent?: () => JSX.Element | Array<JSX.Element>;
  onClose?: () => void;
}
const ImageBox = ({
  renderContent,
  activeProps,
  children,
  renderHeader,
  swipeToDismiss,
  backgroundColor,
  didOpen,
  willClose,
  onOpen,
  style,
  underlayColor,
  onLongPress,
  onClose,
}: Props) => {
  const _root = useRef(null);
  const [state, setState] = useState({
    isOpen: false,
    origin: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
    layoutOpacity: new Animated.Value(1),
  });

  const getContent = () => {
    if (renderContent) {
      return renderContent();
    } else if (activeProps) {
      return cloneElement(Children.only(children), activeProps);
    }
    return children;
  };

  const getOverlayProps = () => ({
    isOpen: state.isOpen,
    origin: state.origin,
    renderHeader: renderHeader,
    swipeToDismiss: swipeToDismiss,
    backgroundColor: backgroundColor,
    children: getContent(),
    didOpen: didOpen,
    willClose: willClose,
    onClose: _onClose,
  });

  const open = () => {
    (_root!.current as any).measure(
      (
        ox: number,
        oy: number,
        width: number,
        height: number,
        px: number,
        py: number,
      ) => {
        if (onOpen) {
          onOpen();
        }

        setState({
          ...state,
          isOpen: true,
          origin: {
            width,
            height,
            x: px,
            y: py,
          },
        });
        if (didOpen) {
          didOpen();
        }
        setTimeout(() => {
          _root && state.layoutOpacity.setValue(0);
        });
      },
    );
  };

  const _onClose = () => {
    state.layoutOpacity.setValue(1);
    setState({
      ...state,
      isOpen: false,
    });

    if (onClose) {
      onClose();
    }
  };

  return (
    <View ref={_root} style={style} onLayout={() => {}}>
      <Animated.View style={{opacity: state.layoutOpacity}}>
        <TouchableHighlight
          underlayColor={underlayColor}
          onPress={open}
          onLongPress={onLongPress}>
          {children}
        </TouchableHighlight>
      </Animated.View>
      <ImageOverlay {...getOverlayProps()} />
    </View>
  );
};

export default ImageBox;
