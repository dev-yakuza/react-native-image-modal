import {SafeAreaView, ScrollView, Text, View} from 'react-native';
import ImageModal from '../../dist';
import React from 'react';
import {style} from '../style';

const ModalImageResizeMode = () => {
  return (
    <SafeAreaView>
      <ScrollView>
        <View style={style.contentsContainer}>
          <Text style={style.heading}>modalImageResizeMode</Text>
          <Text style={style.text}>
            - resizeMode: "center"{'\n'}- modalImageResizeMode: "contain"
          </Text>
          <ImageModal
            resizeMode="center"
            imageBackgroundColor="#000000"
            style={{
              width: 40,
              height: 40,
            }}
            source={require('../../images/small.png')}
          />
          <Text style={style.text}>
            - resizeMode: "center"{'\n'}- modalImageResizeMode: "cover"
          </Text>
          <ImageModal
            resizeMode="center"
            modalImageResizeMode="cover"
            imageBackgroundColor="#000000"
            style={{
              width: 40,
              height: 40,
            }}
            source={require('../../images/small.png')}
          />
          <Text style={style.text}>
            - resizeMode: "center"{'\n'}- modalImageResizeMode: "stretch"
          </Text>
          <ImageModal
            resizeMode="center"
            modalImageResizeMode="stretch"
            imageBackgroundColor="#000000"
            style={{
              width: 40,
              height: 40,
            }}
            source={require('../../images/small.png')}
          />
          <Text style={style.text}>
            - resizeMode: "center"{'\n'}- modalImageResizeMode: "center"
          </Text>
          <ImageModal
            resizeMode="center"
            modalImageResizeMode="center"
            imageBackgroundColor="#000000"
            style={{
              width: 40,
              height: 40,
            }}
            source={require('../../images/small.png')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export {ModalImageResizeMode};
