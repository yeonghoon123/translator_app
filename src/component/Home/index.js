import React, {useEffect, useState} from 'react';
import {View, Text, PermissionsAndroid} from 'react-native';
import {Icon} from '@rneui/themed';

import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const Home = ({navigation}) => {
  const [recordSwitch, setRecordSwitch] = useState(false); // 녹음 진행 스위치
  const [recorder, setRecorder] = useState(null); // 녹음 정보
  const [recordPath, setRecordPath] = useState(null); // 녹음 정보 저장 경로

  const audioRecorderPlayer = new AudioRecorderPlayer();

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

  const onStartRecord = async () => {
    console.log('teat');

    const result = await audioRecorderPlayer.startRecorder();
    audioRecorderPlayer.addRecordBackListener(e => {
      setRecorder({
        recordSecs: e.currentPosition,
        recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
      });
      return;
    });

    console.log(result);
    setRecordSwitch(true);
  };

  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setRecorder(null);
    console.log(result);
    console.log(recorder);
    setRecordSwitch(false);
  };

  useEffect(() => {
    permissionCheck();
  }, []);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      {recordSwitch ? (
        <View>
          <Text>Record Text</Text>
          <Icon name="mic" color="#517fa4" onPress={onStopRecord} />
        </View>
      ) : (
        <View>
          <Text>ty</Text>
          <Text style={{marginBottom: '10px'}}>Translator speech</Text>
          <Icon name="mic" color="#517fa4" onPress={() => onStartRecord()} />
        </View>
      )}
    </View>
  );
};

export default Home;
