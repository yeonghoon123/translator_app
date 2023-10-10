/*
작성코드: ST10
작성자: 김영훈
작성일: 2023.10.10
설명: 사용자의 음성녹음 파일을 Text로 변환하는 화면 구현
*/

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  PermissionsAndroid,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import convertWavToFlac from '../../compositions/ffmpeg';
import RNFS from 'react-native-fs';
import uuid from 'react-native-uuid';

import AudioRecorderPlayer from 'react-native-audio-recorder-player';
const audioRecorderPlayer = new AudioRecorderPlayer(); // 녹음 플레이어 사용

const Home = ({navigation}) => {
  const [recordSwitch, setRecordSwitch] = useState(false); // 녹음 진행 스위치
  const [recorder, setRecorder] = useState(null); // 녹음 정보
  const [recordPath, setRecordPath] = useState(null); // 녹음 정보 저장 경로
  const [STTResult, setSTTResult] = useState(null); // Speach 번역한 Text데이터

  // 사용자 기기의 파일 읽기/쓰기, 마이크 사용 권한 확인
  const permissionCheck = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        console.log('write external stroage', grants);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
        } else {
          console.log('All required permissions not granted');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }
  };

  // 녹음 시작 기능
  const onStartRecord = async () => {
    console.log('record start');
    const recordPath = `${RNFS.CachesDirectoryPath}/${uuid.v4()}.wav`;

    await audioRecorderPlayer.startRecorder(recordPath); // 녹음 시작

    // 녹음 시작 이벤트 실행
    audioRecorderPlayer.addRecordBackListener(e => {
      setRecorder({
        recordSecs: e.currentPosition,
        recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
      });
    });

    setRecordSwitch(true);
  };

  // 녹음 중지 기능
  const onStopRecord = async () => {
    console.log('record stop');

    const result = await audioRecorderPlayer.stopRecorder(); // 녹음 정지
    audioRecorderPlayer.removeRecordBackListener(); // 녹음 정지 이벤트 실행

    console.log('record result' + result);

    setRecorder({
      recordSecs: 0,
    });

    const fileTypeChange = result.replace('.wav', '.flac'); // wav파일을 flac파일로 변경하기 위해 확장자 수정
    await convertWavToFlac(result, fileTypeChange); // 기존 wav확장자 경로와 수정한 flac확장자 경로를 넣어 파일 변환

    setRecordPath(fileTypeChange);
    setRecorder(null);
    setRecordSwitch(false);
  };

  // Google STT Rest API로 데이터 전송
  const fetchSTT = async () => {
    const readFile = await RNFS.readFile(recordPath, 'base64'); // 파일경로에 이미지 base64로 변경

    // Rest API로 보낼 body 데이터
    const bodyJson = JSON.stringify({
      config: {
        languageCode: 'ko-KR',
        encoding: 'FLAC',
        sampleRateHertz: 48000,
        audio_channel_count: 1,
      },
      audio: {
        content: readFile,
      },
    });

    // fetch의 response
    const fetchRes = await fetch(
      'https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyDIa8Ql9TVYIPLmpY4aOL-sNu-Kk7B-pns',
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: bodyJson,
      },
    );

    const fetchResult = await fetchRes.json(); // response의 결과 데이터

    fetchResult.results
      ? setSTTResult(fetchResult.results[0].alternatives[0].transcript)
      : setSTTResult('Not Working Transform'); // STT변환 확인 여부 검사
  };

  // 첫 렌더시 권한 확인
  useEffect(() => {
    permissionCheck();
  }, []);

  // 녹음 정보가 변할경우 로그 남김
  useEffect(() => {
    console.log(recorder);
  }, [recorder]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>음성 녹음 화면</Text>
      <TouchableOpacity
        style={styles.recordButton}
        onPress={recordSwitch ? onStopRecord : onStartRecord}>
        <Text style={styles.recordButtonText}>
          {recordSwitch ? '녹음 중지' : '녹음 시작'}
        </Text>
      </TouchableOpacity>

      {recordPath && (
        <>
          <TouchableOpacity style={styles.transformButton} onPress={fetchSTT}>
            <Text style={styles.transformButtonText}>텍스트 변환</Text>
          </TouchableOpacity>
          <View style={styles.sttResult}>
            <Text style={styles.sttResultText}>
              {STTResult && `변환 결과 : ${STTResult}`}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 10,
    borderRadius: 5,
  },
  transformButtonText: {
    color: 'white',
  },
  audioInfo: {
    marginTop: 20,
    fontSize: 16,
  },
  sttResult: {
    margin: 30,
  },
  sttResultText: {
    fontSize: 14,
  },
});

export default Home;
