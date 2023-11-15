# Translator App

음성인식 번역기 및 번역 내용 여러 언어로 변환 앱

## Getting Started

### Installing

Node, JDK 설치

설치 가이드 링크: https://reactnative.dev/docs/environment-setup

git clone하여 프로젝트 설치

    git clone https://github.com/yeonghoon123/translator_app.git

clone 완료후 npm install로 설치

    npm install

env 파일 생성 후 env 설정

    GOOGLE_STT_API=https://speech.googleapis.com/v1/speech:recognize?key={google cloud key}
    GOOGLE_TRANSLATE_AVAILABLE_API=https://translation.googleapis.com/language/translate/v2/languages?key={google cloud key}
    GOOGLE_TRANSLATE_API=https://translation.googleapis.com/language/translate/v2?key={google cloud key}
    GOOGLE_TTS_API=https://texttospeech.googleapis.com/v1/text:synthesize?key={google cloud key}
    LAMBDA_API={API Gateway url}

## Running the tests

### Sample Tests

안드로이드 실행

    npx react-native run-android

## Deployment

Add additional notes to deploy this on a live system

## Built With

```
framework
React Native

etc

react-native-picker
react-navigation
rneui/base
react-native-audio-recorder-player
ffmpeg-kit-react-native
react-native-sound
```

## Versioning

v0.1 - react native 설치 및 안드로이드 초기 설정 <br>
v0.2 - 음성 녹음 기능 구현 <br>
v0.3 - STT 기능 구현 <br>
v0.4 - translator 기능 구현 <br>
v0.5 - TTS 기능 구현 <br>
v0.6 - GO Lambda 서버와 연동 완료 <br>
v0.7 - 번역 목록 저장 및 불러오기 완료 <br>
v0.8 - 번역 내용 삭제 기능 완료 <br>
v0.9 - 테스트 검증 <br>
