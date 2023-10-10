const audioSet: AudioSet = {
    AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
    AudioSourceAndroid: AudioSourceAndroidType.MIC,
    AVModeIOS: AVModeIOSOption.measurement,
    AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
    AVNumberOfChannelsKeyIOS: 2,
    AVFormatIDKeyIOS: AVEncodingOption.aac,
  };
  const meteringEnabled = false;
  
  const uri = await this.audioRecorderPlayer.startRecorder(
    path,
    audioSet,
    meteringEnabled,
  );
  
  this.audioRecorderPlayer.addRecordBackListener((e: any) => {
    this.setState({
      recordSecs: e.currentPosition,
      recordTime: this.audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
    });
  });