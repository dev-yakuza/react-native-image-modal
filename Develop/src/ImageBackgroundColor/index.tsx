import {useState} from 'react';
import {
  LayoutChangeEvent,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import ImageModal from '../../dist';
import React from 'react';
import {style} from '../style';

const ImageBackgroundColor = () => {
  const [imageWidth, setImageWidth] = useState<number>(0);

  return (
    <SafeAreaView>
      <ScrollView>
        <View
          style={style.contentsContainer}
          onLayout={(event: LayoutChangeEvent) => {
            setImageWidth(event.nativeEvent.layout.width);
          }}>
          <Text style={style.heading}>Image background color</Text>
          <Text style={style.text}>
            You can set imageBackgroundColor to change the background color.
          </Text>
          <Text style={style.text}>- imageBackgroundColor is not set</Text>
          <ImageModal
            resizeMode="contain"
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={require('../../images/vertical.jpg')}
          />
          <Text style={style.text}>
            - imageBackgroundColor is set to #000000
          </Text>
          <ImageModal
            resizeMode="contain"
            imageBackgroundColor="#000000"
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={require('../../images/vertical.jpg')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export {ImageBackgroundColor};
