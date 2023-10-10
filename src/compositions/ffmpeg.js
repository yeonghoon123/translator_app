import {FFmpegKit, FFmpegKitConfig} from 'ffmpeg-kit-react-native';

const convertWavToFlac = async (inputWavPath, outputFlacPath) => {
  try {
    // FFmpeg 명령어 설정
    const command = `-i ${inputWavPath} -c:a flac ${outputFlacPath}`;

    // FFmpeg 실행
    const executeResponse = await FFmpegKit.execute(command);

    // 변환 완료 시 로그
    console.log('FFmpeg execution completed:', executeResponse);
  } catch (error) {
    console.error('FFmpeg execution failed:', error);
  }
};

export default convertWavToFlac;
