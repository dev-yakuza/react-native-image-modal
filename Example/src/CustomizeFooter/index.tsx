import {useState} from 'react';
import {
  LayoutChangeEvent,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageModal from 'react-native-image-modal';
import React from 'react';
import {style} from '../style';

const CustomizeFooter = () => {
  const [imageWidth, setImageWidth] = useState<number>(0);

  return (
    <SafeAreaView>
      <ScrollView>
        <View
          style={style.contentsContainer}
          onLayout={(event: LayoutChangeEvent) => {
            setImageWidth(event.nativeEvent.layout.width);
          }}>
          <Text style={style.heading}>Custom close button on Footer</Text>
          <Text style={style.text}>
            You can set imageBackgroundColor to change the background color.
          </Text>
          <ImageModal
            resizeMode="contain"
            imageBackgroundColor="#000000"
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={require('../../images/vertical.jpg')}
            hideCloseButton
            renderFooter={onClose => (
              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: '#FFFFFF',
                  height: 100,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text>CloseButton</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export {CustomizeFooter};
