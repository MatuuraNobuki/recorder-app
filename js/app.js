Vue.config.devtools = true;
var app = new Vue({
  el: '#app',
  data: {
    btnMsg: '録音する',
    recording: false,
    recordingStatus: 'init',
    recorder: null,
    audioData: [],
    audioUrl: null,
    audioExtension: ''
  },
  methods: {
    startRecording: function () {
      this.switchRecordingState();
    },
    switchRecordingState: function () {
      this.recording = !this.recording;
      if (this.recording) {
        this.btnMsg = '録音中'
        this.status = 'recording';
        this.recorder.start();
        this.audioData = [];

      } else {
        this.btnMsg = '録音する'
        this.status = 'ready';
        this.recorder.stop();
      }
    },
    getExtension: function (audioType) {
      let extension = 'wav';
      // const matches = audioType.match(/audio\/([^;]+)/);
      // if (matches) {
      //   extension = matches[1];
      // }
      return '.' + extension;
    }
  },
  mounted() {
    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then(stream => {
      this.recorder = new MediaRecorder(stream);
      this.recorder.addEventListener('dataavailable', e => {
        this.audioData.push(e.data);
        this.audioExtension = this.getExtension(e.data.type);
      });

      this.recorder.addEventListener('stop', () => {
        const audioBlob = new Blob(this.audioData);
        const url = URL.createObjectURL(audioBlob);
        this.audioUrl = url;
      });
      this.status = 'ready';
    });
  }
})