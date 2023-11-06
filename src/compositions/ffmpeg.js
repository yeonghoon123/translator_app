/*
프로그램ID: CP-FM-10
작성자: 김영훈
작성일: 2023.10.17
설명: ffmpeg 라이브러리를 사용하여 .wav파일을 .flac파일로 변환
버전: 0.5
*/

import {FFmpegKit, FFmpegKitConfig} from 'ffmpeg-kit-react-native';

const convertWavToFlac = async (inputWavPath, outputFlacPath) => {
  try {
    // FFmpeg 명령어 설정
    const command = `-i ${inputWavPath} -c:a flac ${outputFlacPath}`;

    // FFmpeg 실행
    const executeResponse = await FFmpegKit.execute(command);

    // 변환 완료 시 로그
    console.log('FM-10-L10. FFmpeg execution completed:', executeResponse);
  } catch (error) {
    console.error('FM-10-E10. FFmpeg execution failed:', error);
  }
};

export default convertWavToFlac;
