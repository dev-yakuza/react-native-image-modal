import React from 'react';
import {SafeAreaView, ScrollView, Button, View} from 'react-native';
import {RootStackParamList} from '../type';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type NavigationItem = {
  title: string;
  screen: keyof RootStackParamList;
};

type RootStackProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const Home = ({navigation}: RootStackProps) => {
  const list: NavigationItem[] = [
    {
      title: 'Simple Demo',
      screen: 'SimpleDemo',
    },
    {
      title: 'Event',
      screen: 'Event',
    },
    {
      title: 'Resize Mode',
      screen: 'ResizeMode',
    },
    {
      title: 'Translucent Status Bar',
      screen: 'TranslucentStatusBar',
    },
    {
      title: 'Image Background Color',
      screen: 'ImageBackgroundColor',
    },
    {
      title: 'Customize Footer',
      screen: 'CustomizeFooter',
    },
    {
      title: 'Customize Header',
      screen: 'CustomizeHeader',
    },
    {
      title: 'Disable SwipeToDismiss',
      screen: 'DisableSwipeToDismiss',
    },
    {
      title: 'Open and Close Modal Programmatically',
      screen: 'OpenCloseModalProgrammatically',
    },
    {
      title: 'Modal Image ResizeMode',
      screen: 'ModalImageResizeMode',
    },
    {
      title: 'RTL',
      screen: 'RTL',
    },
    {
      title: 'RenderToHardwareTextureAndroid',
      screen: 'RenderToHardwareTextureAndroid',
    },
    {
      title: 'Overlay Background Color',
      screen: 'OverlayBackgroundColor',
    },
    {
      title: 'Disabled',
      screen: 'Disabled',
    },
    {
      title: 'Modal Image Style',
      screen: 'ModalImageStyle',
    },
    {
      title: 'External Library',
      screen: 'ExternalLibrary',
    },
    {
      title: 'Parent Layout',
      screen: 'ParentLayout',
    },
    {
      title: 'Animation Duration',
      screen: 'AnimationDuration',
    },
  ];
  return (
    <SafeAreaView>
      <ScrollView>
        {list.map(({title, screen}, index) => (
          <View key={index} style={{margin: 10}}>
            <Button title={title} onPress={() => navigation.navigate(screen)} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export {Home};
