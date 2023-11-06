/*
프로그램ID: PT-TR-100
작성자: 김영훈
작성일: 2023.10.10
설명: 변환한 텍스트를 원하는 언어로 번역
버전: 0.5
*/

import React, {useEffect, useState} from 'react'; // React 기능 사용
import {View, Text, StyleSheet, ScrollView} from 'react-native'; // React Native 기능 사용
import {ListItem, Icon} from '@rneui/themed'; // React Native Style 라이브러리 사용
import uuid from 'react-native-uuid'; // uuid 라이브러리 사용
import Sound from 'react-native-sound'; // 음성 재생 라이브러리 사용
import RNFS from 'react-native-fs'; // fs 기능 사용

const TranslateScreen = ({route, navigation}) => {
  const {sttText, languageCode} = route.params; // 음성 인식 데이터
  const [translateData, setTranslateData] = useState([]); // 번역한 데이터
  const [speechData, setSpeechData] = useState(null); // 음성 재생 정보

  // TTS에서 사용되는 language code
  const getLanguageCode = language => {
    switch (language) {
      case 'ko':
        return 'ko-KR';
      case 'en':
        return 'en-US';
      case 'ja':
        return 'ja-JP';
    }
  };

  // 번역 가능한 언어 목록 가져오기
  const getAvailableLang = async () => {
    try {
      const translateLanguage = ['한국어', '영어', '일본어']; // 번역 언어 목록

      // 번역 가능한 언어 목록 요청
      const fetchResponse = await fetch(
        process.env.GOOGLE_TRANSLATE_AVAILABLE_API,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            target: 'ko',
          }),
        },
      );

      const fetchResult = await fetchResponse.json(); // 번역 가능한 언어 목록 데이터

      // 번역할 언어 데이터 필터
      const filterLanguage = fetchResult.data.languages.filter((v, _) => {
        return translateLanguage.includes(v.name);
      });

      // 해당하는 언어 번역 데이터 요청 및 저장
      filterLanguage.map(async (v, _) => {
        const LANGUAGE_CODE = getLanguageCode(v.language); // 현재 번역할 국가 코드
        let combineText = sttText;

        if (LANGUAGE_CODE !== languageCode) {
          // 텍스트 번역 요청
          const translateResponse = await fetch(
            process.env.GOOGLE_TRANSLATE_API,
            {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                q: sttText,
                target: v.language,
              }),
            },
          );

          const translateResult = await translateResponse.json(); // 텍스트 번역 요청 결과

          // 텍스트 번역후 배열을 문자열로 변경뒤에 &#39;문자를 '문자로 변환
          combineText = translateResult.data.translations
            .map((v, _) => v.translatedText)
            .join('')
            .replaceAll('&#39;', "'")
            .replaceAll('.', '.\n');
        }

        // TTS 데이터 요청
        const ttsResponse = await fetch(process.env.GOOGLE_TTS_API, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            input: {text: combineText},
            voice: {languageCode: LANGUAGE_CODE},
            audioConfig: {
              audioEncoding: 'mp3',
            },
          }),
        });

        const ttsResult = await ttsResponse.json(); // TTS 데이터 결과

        const FILE_PATH = `${RNFS.CachesDirectoryPath}/${uuid.v4()}.mp3`; // 음성 재생을 위한 임시 파일 경로
        await RNFS.writeFile(FILE_PATH, ttsResult.audioContent, 'base64'); // 파일의 데이터 삽입

        // 텍스트 번역 데이터 저장
        setTranslateData(c => [
          ...c,
          {
            language: v.name,
            textData: combineText,
            ttsFilePath: FILE_PATH,
          },
        ]);
      });
      console.log('TR100-L10. Success');
    } catch (err) {
      console.log(`TR100-E10. ${err}`);
    }
  };

  // 음성 재생 및 정지
  const speechTextControl = ttsFilePath => {
    try {
      // 음성 재생을 한번이라도 한경우 정지, 만약 경로와 요청한 음성 데이터 경로가 같을경우 초기화
      if (speechData) {
        speechData.stop();
        if (speechData._filename === ttsFilePath) {
          setSpeechData(null);
          return;
        }
      }

      // 음성 재생 정보 생성 및 재생
      const sound = new Sound(ttsFilePath, '', error => {
        if (error) {
          console.log(`TR100-E20. Error in playing sound: ${error}`);
        } else {
          setSpeechData(sound);
          sound.play(success => {
            if (!success) {
              console.log('TR100-L20. Sound did not play');
            }
          });
        }
      });
    } catch (err) {
      console.log(`TR100-E21 . ${err}`);
    }
  };

  useEffect(() => {
    getAvailableLang();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Translate Text</Text>
      <ScrollView style={{alignSelf: 'stretch'}}>
        {translateData.map((value1, i) => {
          return (
            <ListItem style={{marginVertical: 15}} key={`language_${i}`}>
              <ListItem.Content>
                <ListItem.Title style={{marginBottom: 15}}>
                  {value1.language}
                  <Icon
                    name="mic"
                    onPress={() => speechTextControl(value1.ttsFilePath)}
                  />
                </ListItem.Title>
                <ListItem.Subtitle
                  style={{
                    borderWidth: 1,
                    padding: 5,
                    alignSelf: 'stretch',
                    fontSize: 14,
                  }}>
                  {value1.textData}
                </ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default TranslateScreen;
