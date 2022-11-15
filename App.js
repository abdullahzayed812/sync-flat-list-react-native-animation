import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { API_KEY, API_URL } from "./config/config";

const SPACEING = 10;
const IMAGE_SIZE = 80;

const fetchImagesFromPexels = async () => {
  const data = await fetch(API_URL, {
    headers: {
      Authorization: API_KEY,
    },
  });
  const result = await data.json();
  return result;
};

const { width, height } = Dimensions.get("screen");

export default function App() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [images, setImages] = React.useState([]);
  const absoluteListRef = React.useRef();
  const thumbListRef = React.useRef();

  React.useEffect(() => {
    const fetchImages = async () => {
      const { photos } = await fetchImagesFromPexels();
      setImages(photos);
    };
    fetchImages();
  }, []);

  if (!images) {
    return <Text>Loading...!</Text>;
  }

  const scrollToActiveIndex = (index) => {
    setActiveIndex(index);
    absoluteListRef?.current?.scrollToOffset({
      offset: index * width,
      animated: true,
    });
    if (index * (IMAGE_SIZE + SPACEING) - IMAGE_SIZE / 2 > width / 2) {
      thumbListRef?.current?.scrollToOffset({
        offset: index * (IMAGE_SIZE + SPACEING) - width / 2 + IMAGE_SIZE / 2,
        animated: true,
      });
    } else {
      thumbListRef?.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={absoluteListRef}
        data={images}
        keyExtractor={(item) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        pagingEnabled={true}
        bounces={false}
        onMomentumScrollEnd={(event) =>
          scrollToActiveIndex(
            Math.floor(event.nativeEvent.contentOffset.x / width)
          )
        }
        renderItem={({ item }) => {
          return (
            <View style={{ width, height }}>
              <Image
                source={{ uri: item.src.portrait }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          );
        }}
      />
      <FlatList
        ref={thumbListRef}
        data={images}
        keyExtractor={(item) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={{ position: "absolute", bottom: IMAGE_SIZE }}
        contentContainerStyle={{ paddingHorizontal: SPACEING }}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity onPress={() => scrollToActiveIndex(index)}>
              <Image
                source={{ uri: item.src.portrait }}
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                  borderRadius: SPACEING,
                  marginRight: SPACEING,
                  borderWidth: 2,
                  borderColor: index === activeIndex ? "#fff" : "transparent",
                }}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
