import React from 'react';
import ImageBox from './Components/ImageBox';
import ImageDetail from './Components/ImageDetail';
import {Image} from 'react-native';

interface Props {}
const App = ({}: Props) => {
  // // const imageSource = {
  // //   uri:
  // //     'https://cdn.pixabay.com/photo/2019/07/25/18/58/church-4363258_960_720.jpg',
  // // };
  // // const imageSource = {
  // //   uri:
  // //     'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
  // // };
  // // const imageSource = require('./images/horizontal.jpg');
  const imageSource = require('./images/vertical.jpg');

  return (
    <ImageBox
      swipeToDismiss={true}
      renderContent={() => <ImageDetail source={imageSource} />}>
      <Image
        style={{
          width: 250,
          height: 250,
        }}
        source={imageSource}
      />
    </ImageBox>
  );
};

export default App;
