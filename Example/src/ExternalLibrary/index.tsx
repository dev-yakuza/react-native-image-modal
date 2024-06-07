import {useState} from 'react';
import {
  ImageRequireSource,
  LayoutChangeEvent,
  SafeAreaView,
  ScrollView,
  StyleProp,
  Text,
  View,
} from 'react-native';
import ImageModal from 'react-native-image-modal';
import React from 'react';
import {style} from '../style';
import FastImage, {ImageStyle, ResizeMode} from 'react-native-fast-image';

const ExternalLibrary = () => {
  const [imageWidth, setImageWidth] = useState<number>(0);

  return (
    <SafeAreaView>
      <ScrollView>
        <View
          style={style.contentsContainer}
          onLayout={(event: LayoutChangeEvent) => {
            setImageWidth(event.nativeEvent.layout.width);
          }}>
          <Text style={style.heading}>Use FastImage</Text>
          <ImageModal
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
            }}
            renderImageComponent={({source, resizeMode, style}) => (
              <FastImage
                style={style as StyleProp<ImageStyle>}
                source={source as ImageRequireSource}
                resizeMode={resizeMode as ResizeMode}
              />
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export {ExternalLibrary};
