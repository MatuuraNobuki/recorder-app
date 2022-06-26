Vue.config.devtools = true;
var app = new Vue({
  el: '#app',
  data: {
    btnMsg: '録音する',
    recording: false,
    recorder: null,
    audioData: [],
    audioUrl: null,
  },
  methods: {
    startRecording: function () {
      this.switchRecordingState();
    },
    switchRecordingState: function () {
      this.recording = !this.recording;
      if (this.recording) {
        this.btnMsg = '録音中'
        this.recorder.start();
        this.audioData = [];

      } else {
        this.btnMsg = '録音する'
        this.status = 'ready';
        this.recorder.stop();
      }
    },
  },
  mounted() {
    async function runRecordingSystem() {
      try {
        return navigator.mediaDevices.getUserMedia({
          audio: true
        })
      } catch (e) {
        throw "reject"
      }
    }
    launchRecordingSystem = async () => {
      stream = await runRecordingSystem();
      this.recorder = new MediaRecorder(stream);

      this.recorder.addEventListener('dataavailable', e => {
        this.audioData.push(e.data);
      });

      this.recorder.addEventListener('stop', () => {
        const audioBlob = new Blob(this.audioData);
        const url = URL.createObjectURL(audioBlob);
        this.audioUrl = url;
      });

    };
    launchRecordingSystem();
  }
})