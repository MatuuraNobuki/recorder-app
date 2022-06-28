Vue.config.devtools = true;
var app = new Vue({
  el: '#app',
  data: {
    btnMsg: '',
    hideBtn: false,
    isRecording: false,
    recorder: null,
    stream: null,
    audioData: [],
    audioUrl: null,
    speech: null,
    interimTranscript: '',
    finalTranscript: '',
    transcript: '',
    recognition: '',
    ActivateBtn: true,
  },
  methods: {
    switchRecordingState: function () {
      this.isRecording = !this.isRecording;
      if (this.isRecording) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
    },

    startRecording: async function () {
      await this.operateRecordingSystem();
      this.hideBtn = true;
      this.transcription();
      setTimeout(() => {
        this.hideBtn = false;
      }, 600);
      this.recognition.start();
      this.btnMsg = '録音中'

      this.recorder.start();
      this.audioData = [];
    },

    stopRecording: function () {
      this.transcription();
      this.recognition.stop();
      this.btnMsg = '録音する'
      this.hideBtn = true;
      this.recorder.stop();
      setTimeout(() => {
        this.stream.getTracks()[0].stop();
        this.hideBtn = false;
      }, 600);
    },

    operateRecordingSystem: async function () {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      this.recorder = new MediaRecorder(this.stream);

      this.recorder.ondataavailable = e => {
        this.audioData.push(e.data);
      };

      this.recorder.onstop = () => {
        this.buildAudioURL();
      };
    },

    buildAudioURL: function () {
      const audioBlob = new Blob(this.audioData);
      const url = URL.createObjectURL(audioBlob);
      this.audioUrl = url;
    },

    transcription: function () {
      this.recognition.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          let transcript = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            this.finalTranscript += transcript;
            this.interimTranscript = '';
          } else {
            this.interimTranscript = transcript;
          }
        }
        this.transcript = this.finalTranscript + this.interimTranscript;
      }
    }
  },
  mounted() {
    var userAgent = window.navigator.userAgent.toLowerCase();
    // if (userAgent.indexOf('chrome') == -1) {
    //   alert('このアプリはchrome以外では正常に動作しない可能性があります。ブラウザをchromeに切り替えてください。')
    // }

    SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'ja-JP';
    this.recognition.interimResults = true;
    this.recognition.continuous = true;
  }

})