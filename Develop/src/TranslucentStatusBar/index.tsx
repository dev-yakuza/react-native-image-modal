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

const TranslucentStatusBar = () => {
  const [imageWidth, setImageWidth] = useState<number>(0);

  return (
    <SafeAreaView>
      <ScrollView>
        <View
          style={style.contentsContainer}
          onLayout={(event: LayoutChangeEvent) => {
            setImageWidth(event.nativeEvent.layout.width);
          }}>
          <Text style={style.heading}>Translucent status bar</Text>
          <Text style={style.text}>
            You can set true to isTranslucent to make status bar translucent.
          </Text>
          <ImageModal
            isTranslucent
            imageBackgroundColor="#000000"
            style={{
              width: imageWidth,
              height: 175,
            }}
            source={require('../../images/horizontal.jpg')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export {TranslucentStatusBar};
