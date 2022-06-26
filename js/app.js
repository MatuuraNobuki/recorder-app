Vue.config.devtools = true;
var app = new Vue({
  el: '#app',
  data: {
    btnMsg: '録音する',
    hideBtn: false,
    isRecording: false,
    recorder: null,
    audioData: [],
    audioUrl: null,
  },
  methods: {
    startRecording: async function () {
      this.isRecording = !this.isRecording;
      this.btnMsg = '録音中'
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      await this.launchRecordingSystem(stream)
      await this.recorder.start();
      this.audioData = [];
    },
    stopRecording: async function () {
      this.hideBtn = true;
      setTimeout(() => {
        this.isRecording = !this.isRecording;
        this.btnMsg = '録音する'
        stream.getTracks()[0].stop();
        this.recorder.stop();
        this.hideBtn = false;
      }, 600);
    },
    launchRecordingSystem: async function (stream) {
      this.recorder = new MediaRecorder(stream);
      this.recorder.addEventListener('dataavailable', e => {
        this.audioData.push(e.data);
      });

      this.recorder.addEventListener('stop', () => {
        const audioBlob = new Blob(this.audioData);
        const url = URL.createObjectURL(audioBlob);
        this.audioUrl = url;
      });
    }
  },
})