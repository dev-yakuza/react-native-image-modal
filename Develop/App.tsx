import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Home} from './src/Home';
import {RootStackParamList} from './src/type';
import {SimpleDemo} from './src/SimpleDemo';
import {Event} from './src/Event';
import {ResizeMode} from './src/ResizeMode';
import {TranslucentStatusBar} from './src/TranslucentStatusBar';
import {ImageBackgroundColor} from './src/ImageBackgroundColor';
import {CustomizeFooter} from './src/CustomizeFooter';
import {CustomizeHeader} from './src/CustomizeHeader';
import {DisableSwipeToDismiss} from './src/DisableSwipeToDismiss';
import {OpenCloseModalProgrammatically} from './src/OpenCloseModalProgrammatically';
import {ModalImageResizeMode} from './src/ModalImageResizeMode';
import {RTL} from './src/RTL';
import {RenderToHardwareTextureAndroid} from './src/RenderToHardwareTextureAndroid';
import {OverlayBackgroundColor} from './src/OverlayBackgroundColor';
import {Disabled} from './src/Disabled';
import {ModalImageStyle} from './src/ModalImageStyle';
import {ExternalLibrary} from './src/ExternalLibrary';
import {ParentLayout} from './src/ParentLayout';
import {AnimationDuration} from './src/AnimationDuration';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="SimpleDemo" component={SimpleDemo} />
        <Stack.Screen name="Event" component={Event} />
        <Stack.Screen name="ResizeMode" component={ResizeMode} />
        <Stack.Screen
          name="TranslucentStatusBar"
          component={TranslucentStatusBar}
        />
        <Stack.Screen
          name="ImageBackgroundColor"
          component={ImageBackgroundColor}
        />
        <Stack.Screen name="CustomizeFooter" component={CustomizeFooter} />
        <Stack.Screen name="CustomizeHeader" component={CustomizeHeader} />
        <Stack.Screen
          name="DisableSwipeToDismiss"
          component={DisableSwipeToDismiss}
        />
        <Stack.Screen
          name="OpenCloseModalProgrammatically"
          component={OpenCloseModalProgrammatically}
        />
        <Stack.Screen name="RTL" component={RTL} />
        <Stack.Screen
          name="ModalImageResizeMode"
          component={ModalImageResizeMode}
        />
        <Stack.Screen
          name="RenderToHardwareTextureAndroid"
          component={RenderToHardwareTextureAndroid}
        />
        <Stack.Screen
          name="OverlayBackgroundColor"
          component={OverlayBackgroundColor}
        />
        <Stack.Screen name="Disabled" component={Disabled} />
        <Stack.Screen name="ModalImageStyle" component={ModalImageStyle} />
        <Stack.Screen name="ExternalLibrary" component={ExternalLibrary} />
        <Stack.Screen name="ParentLayout" component={ParentLayout} />
        <Stack.Screen name="AnimationDuration" component={AnimationDuration} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
