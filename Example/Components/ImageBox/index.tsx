import React, {useState, useRef, Children, cloneElement} from 'react';
import {Animated, TouchableHighlight, View, ViewStyle} from 'react-native';

import ImageOverlay from '../ImageOverlay';

interface Props {
  activeProps?: object;
  children: JSX.Element | Array<JSX.Element>;
  swipeToDismiss?: boolean;
  backgroundColor?: string;
  navigator?: any;
  style?: ViewStyle;
  underlayColor?: string;
  onLongPress?: () => void;
  onOpen?: () => void;
  willClose?: () => void;
  renderHeader?: (close: () => void) => JSX.Element | Array<JSX.Element>;
  didOpen?: () => void;
  renderContent?: () => JSX.Element | Array<JSX.Element>;
  springConfig?: (
    value: Animated.AnimatedValue | Animated.AnimatedValueXY,
    config: Animated.SpringAnimationConfig,
  ) => Animated.CompositeAnimation;
  onClose?: () => void;
}
const ImageBox = ({
  renderContent,
  activeProps,
  children,
  renderHeader,
  swipeToDismiss,
  springConfig,
  backgroundColor,
  didOpen,
  willClose,
  navigator,
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
    springConfig: springConfig,
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
          isOpen: navigator ? true : false,
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
        if (navigator) {
          const route = {
            component: ImageOverlay,
            passProps: getOverlayProps(),
          };
          const routes = navigator.getCurrentRoutes();
          routes.push(route);
          navigator.immediatelyResetRouteStack(routes);
        } else {
          setState({
            ...state,
            isOpen: true,
          });
        }
        setTimeout(() => {
          _root && state.layoutOpacity.setValue(0);
        });
      },
    );
  };

  const close = () => {
    throw new Error(
      'Lightbox.close method is deprecated. Use renderHeader(close) prop instead.',
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
    if (navigator) {
      const routes = navigator.getCurrentRoutes();
      routes.pop();
      navigator.immediatelyResetRouteStack(routes);
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
      {navigator ? false : <ImageOverlay {...getOverlayProps()} />}
    </View>
  );
};

export default ImageBox;
