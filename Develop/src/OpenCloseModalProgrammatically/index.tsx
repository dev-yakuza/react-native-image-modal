import {useRef, useState} from 'react';
import {
  Button,
  LayoutChangeEvent,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageModal from '../../dist';
import type {ImageDetail, ReactNativeImageModal} from '../../dist';
import React from 'react';
import {style} from '../style';

interface FloatingButtonProps {
  label: string;
  onPress: () => void;
}

const FloatingButton = ({label, onPress}: FloatingButtonProps) => {
  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: 'red',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9000000,
      }}
      onPress={onPress}>
      <Text style={{color: 'white', fontWeight: 'bold'}}>{label}</Text>
    </TouchableOpacity>
  );
};

const OpenCloseModalProgrammatically = () => {
  const [imageWidth, setImageWidth] = useState<number>(0);
  const imageDetail = useRef<ImageDetail>(null);
  const imageModal = useRef<ReactNativeImageModal>(null);

  return (
    <SafeAreaView>
      <ScrollView>
        <View
          style={style.contentsContainer}
          onLayout={(event: LayoutChangeEvent) => {
            setImageWidth(event.nativeEvent.layout.width);
          }}>
          <Text style={style.heading}>
            Open and Close modal programmatically
          </Text>
          <Text style={style.text}>
            - (Deprecated) modalRef: The modal will be closed after 3 seconds by
            calling the close method programmatically.
          </Text>
          <ImageModal
            resizeMode="contain"
            imageBackgroundColor="#000000"
            modalRef={imageDetail}
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
            }}
            onOpen={() => {
              console.log('onOpen');
              setTimeout(() => {
                imageDetail.current?.close();
              }, 3000);
            }}
          />
          <Text style={style.text}>
            - ref: The floating button on the bottom right corner will open and
            close the modal.
          </Text>
          <ImageModal
            resizeMode="contain"
            imageBackgroundColor="#000000"
            ref={imageModal}
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
            }}
            renderFooter={() => (
              <FloatingButton
                label="Close"
                onPress={() => {
                  imageModal.current?.close();
                }}
              />
            )}
          />
          <FloatingButton
            label="Open"
            onPress={() => {
              imageModal.current?.open();
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export {OpenCloseModalProgrammatically};
