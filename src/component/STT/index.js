/*
프로그램ID: PT-ST-100
작성자: 김영훈
작성일: 2023.10.10
설명: 사용자의 음성녹음 파일을 Text로 변환하는 화면 구현
버전: 0.5
*/

import React, {useEffect, useState} from 'react'; // React 기능 사용
import {
  View,
  Text,
  PermissionsAndroid,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Button,
  Alert,
} from 'react-native'; // React Native 컴포넌트, API 기능 사용
import convertWavToFlac from '../../compositions/ffmpeg'; // 데이터 변환 함수 사용
import RNFS from 'react-native-fs'; // fs 라이브러리 사용
import uuid from 'react-native-uuid'; // uuid 라이브러리 사용
import {Picker} from '@react-native-picker/picker'; // picker 라이브러리 사용
import data from '../../compositions/testFile.json'; // 테스트 데이터 사용

import AudioRecorderPlayer from 'react-native-audio-recorder-player'; // 음성 녹음 라이브러리 사용
const audioRecorderPlayer = new AudioRecorderPlayer(); // 녹음 플레이어 사용

const STTScreen = ({navigation}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('ko-KR'); // 인식 언어 설정
  const [recordSwitch, setRecordSwitch] = useState(false); // 녹음 진행 스위치
  const [recorder, setRecorder] = useState(null); // 녹음 정보
  const [recordPath, setRecordPath] = useState(null); // 녹음 정보 저장 경로
  const [loadingSTT, setLoadingSTT] = useState(false); // STT 데이터 요청 확인 스위치

  // Speach 번역한 Text데이터
  const [STTResult, setSTTResult] = useState({
    sttText: false,
    transformChk: false,
  });

  // 사용자 기기의 파일 읽기/쓰기, 마이크 사용 권한 확인
  const permissionCheck = async () => {
    if (Platform.OS === 'android') {
      try {
        // react native의 안드로이드 권한 목록 생성
        const deviceGrants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        console.log('ST100-L10. write external stroage', deviceGrants);

        // 사용자 권한여부 상태를 비교
        if (
          deviceGrants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          deviceGrants['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          deviceGrants['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('ST100-L11. Permissions granted');
        } else {
          console.log('ST100-L12. All required permissions not granted');
          return;
        }
      } catch (err) {
        console.warn(`ST100-E10${err}`);
        return;
      }
    }
  };

  // Google STT Rest API로 데이터 전송
  const fetchSTT = async recordPath => {
    try {
      setLoadingSTT(true);
      const base64Data = await RNFS.readFile(recordPath, 'base64'); // 파일경로에 이미지파일을 base64로 변경

      // Rest API로 보낼 body 데이터
      const bodyJson = JSON.stringify({
        config: {
          languageCode: selectedLanguage,
          encoding: 'FLAC',
          sampleRateHertz: 48000,
          audio_channel_count: 1,
          enableAutomaticPunctuation: true,
        },
        audio: {
          content: base64Data,
        },
      });

      // Rest API로 보낼 body 테스트 데이터
      // const bodyJson = JSON.stringify({
      //   config: {
      //     languageCode: selectedLanguage,
      //     encoding: 'FLAC',
      //     sampleRateHertz: 44100,
      //     audio_channel_count: 2,
      //     enableAutomaticPunctuation: true,
      //   },
      //   audio: {
      //     content: data.testData,
      //   },
      // });

      // fetch의 response
      const fetchResponse = await fetch(process.env.GOOGLE_STT_API, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: bodyJson,
      });

      const fetchResult = await fetchResponse.json(); // response의 데이터

      // STT변환 확인 여부 검사
      if (fetchResult.results) {
        // 여러줄 인식할경우 배열로 만들어 준 다음 줄바꿈으로 합쳐서 문자열 생성
        const sttTextArr =
          fetchResult.results &&
          fetchResult.results
            .map((v, _) => v.alternatives[0].transcript)
            .join('')
            .replaceAll('.', '.\n');

        setSTTResult({sttText: sttTextArr, transformChk: true});
      } else {
        setSTTResult({sttText: 'Not Working Transform', transformChk: false});
      }
    } catch (err) {
      setSTTResult(`ST100-E20. ${err}`);
    } finally {
      setLoadingSTT(false);
    }
  };

  // 녹음 시작 기능
  const onStartRecord = async () => {
    console.log('ST100-L20. record start');
    const RECORD_PATH = `${RNFS.CachesDirectoryPath}/${uuid.v4()}.wav`; // 녹음 파일 경로

    await audioRecorderPlayer.startRecorder(RECORD_PATH); // 녹음 시작 이벤트 실행

    // 녹음 시작 이벤트 실행
    audioRecorderPlayer.addRecordBackListener(e => {
      setRecorder({
        recordSecs: e.currentPosition,
        recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
      });
    });

    setRecordPath(null); // 녹음 시작시 저장 경로 초기화

    // 녹음 시작시 변환 데이터 초기화
    setSTTResult({
      sttText: false,
      transformChk: false,
    });

    setRecordSwitch(true); // 녹음 시작 스위치
  };

  // 녹음 중지 기능
  const onStopRecord = async () => {
    console.log('ST100-L30. record stop');

    const result = await audioRecorderPlayer.stopRecorder(); // 녹음 정지
    audioRecorderPlayer.removeRecordBackListener(); // 녹음 정지 이벤트 실행

    console.log('ST100-L31. record result' + result);

    setRecorder({
      recordSecs: 0,
    });

    const changeFileType = result.replace('.wav', '.flac'); // wav파일을 flac파일로 변경하기 위해 확장자 수정
    await convertWavToFlac(result, changeFileType); // 기존 wav확장자 경로와 수정한 flac확장자 경로를 넣어 파일 변환

    setRecordPath(changeFileType); // 녹음 파일 경로 저장
    setRecorder(null); // 녹음 정보 초기화
    setRecordSwitch(false); // 녹음 중지 스위치
    fetchSTT(changeFileType);
  };

  // 음성인식 완료후 번역 페이지로 이동하기 전 검사
  const nextScreenCheck = () => {
    if (STTResult.transformChk) {
      navigation.navigate('Text Translator', {
        sttText: STTResult.sttText,
        languageCode: selectedLanguage,
      });
    } else {
      Alert.alert('알림', '음성 인식이 완료되지 않았습니다.', [{text: '확인'}]);
    }
  };

  // 첫 렌더시 권한 확인
  useEffect(() => {
    permissionCheck();
  }, []);

  // 번역 페이지로 이동하기전 변환 확인
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button onPress={() => nextScreenCheck()} title="Next" />
      ),
    });
  }, [navigation, STTResult]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>음성 녹음 화면</Text>
      {!recordSwitch && (
        <View style={styles.picker}>
          <Picker
            selectedValue={selectedLanguage}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedLanguage(itemValue)
            }>
            <Picker.Item label="Korean" value="ko-KR" />
            <Picker.Item label="English" value="en-US" />
            <Picker.Item label="Japanese" value="ja-JP" />
          </Picker>
        </View>
      )}
      <TouchableOpacity
        style={styles.recordButton}
        disabled={loadingSTT}
        onPress={recordSwitch ? onStopRecord : onStartRecord}>
        <Text style={styles.recordButtonText}>
          {recordSwitch ? '녹음 중지' : '녹음 시작'}
        </Text>
      </TouchableOpacity>
      {!recordSwitch && recordPath && (
        <>
          <View style={styles.sttResult}>
            <Text style={styles.sttResultheader}>변환 결과: </Text>
            {STTResult.sttText ? (
              <ScrollView>
                <Text style={styles.sttResultText}>{STTResult.sttText}</Text>
              </ScrollView>
            ) : (
              <ActivityIndicator />
            )}
          </View>
        </>
      )}
    </View>
  );
};

// JSX Style 시트
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  recordButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  recordButtonText: {
    color: 'white',
  },
  transformButton: {
    backgroundColor: 'green',
    width: 100,
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transformButtonText: {
    color: 'white',
  },
  picker: {
    height: 50,
    width: 150,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 4,
  },
  audioInfo: {
    marginTop: 20,
    fontSize: 16,
  },
  sttResult: {
    margin: 30,
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
  },
  sttResultheader: {
    fontSize: 14,
    marginBottom: 10,
  },
  sttResultText: {
    fontSize: 14,
    borderWidth: 1,
    padding: 5,
  },
});

export default STTScreen;
