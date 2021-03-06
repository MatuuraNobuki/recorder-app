Vue.config.devtools = true;
var app = new Vue({
  el: '#app',
  data: {
    hideBtn: false,
    isRecording: false,
    recorder: null,
    stream: null,
    audio: null,
    duration: '00:00',
    current: '00:00',
    audioData: [],
    audioUrl: null,
    speech: null,
    interimTranscript: '',
    finalTranscript: '',
    recognition: '',
    ActivateBtn: true,
    radius: 50,
    context: null,
    showplayer: false,
    dateTime: '',
    isPlayingAudio: false,
    detailCard: false,
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
      this.detailCard = false;
      this.finalTranscript = '';
      await this.operateRecordingSystem();
      this.hideBtn = true;
      this.radius = 25;
      this.transcription();
      setTimeout(() => {
        this.hideBtn = false;
      }, 600);
      this.recognition.start();
      this.showplayer = false;
      this.recorder.start();
      this.audioData = [];
      this.loadProc();
    },

    stopRecording: function () {
      this.transcription();
      this.recognition.stop();
      this.hideBtn = true;
      this.radius = 50;
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
    loadProc: function () {
      const now = new Date();
      const dayOfWeekStrJP = ["???", "???", "???", "???", "???", "???", "???"];
      const year = now.getFullYear();
      const month = ("0" + (now.getMonth() + 1)).slice(-2);
      const date = ("0" + now.getDate()).slice(-2);
      const week = dayOfWeekStrJP[now.getDay()];
      const hour = ("0" + now.getHours()).slice(-2);
      const min = ("0" + now.getMinutes()).slice(-2);
      const sec = ("0" + now.getSeconds()).slice(-2);

      this.dateTime = year + "???" + month + "???" + date + "???" + week + "??????" + hour + ":" + min + ":" + sec;
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
      }
    },
    controllAudio: function () {
      if (this.isPlayingAudio) {
        this.isPlayingAudio = !this.isPlayingAudio;
        this.audio.pause();
      } else {
        this.isPlayingAudio = !this.isPlayingAudio;
        this.audio.play();
      }
    },
    getDuration: function () {
      this.audio.currentTime = 0
      this.audio.removeEventListener('timeupdate', this.getDuration)
    },
    playTime: function (t) {
      let hms = ''
      const h = t / 3600 | 0
      const m = t % 3600 / 60 | 0
      const s = t % 60
      const z2 = (v) => {
        const s = '00' + v
        return s.substr(s.length - 2, 2)
      }
      if (h != 0) {
        hms = h + ':' + z2(m) + ':' + z2(s)
      } else if (m != 0) {
        hms = z2(m) + ':' + z2(s)
      } else {
        hms = '00:' + z2(s)
      }
      return hms
    },
    spreadPlayer: function () {
      this.detailCard = !this.detailCard;
    }
  },
  mounted() {
    var userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('chrome') == -1) {
      alert('??????????????????chrome??????????????????????????????????????????????????????????????????????????????chrome?????????????????????????????????')
    }

    SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'ja-JP';
    this.recognition.interimResults = true;
    this.recognition.continuous = true;

    this.audio = document.getElementById("audioPlayer");

    this.audio.addEventListener('loadedmetadata', async () => {
      while (this.audio.duration === Infinity) {
        await new Promise(r => setTimeout(r, 1000));
        this.audio.currentTime = 1e101;
      }
      this.audio.currentTime = 0;
    })


    this.audio.addEventListener("timeupdate", (e) => {
      let current = Math.floor(this.audio.currentTime);
      const duration = Math.round(this.audio.duration);
      if (duration != Infinity && !isNaN(duration)) {
        if (current == 0 && this.isRecording == false) {
          this.showplayer = true;
        }
        this.duration = this.playTime(duration);
        let percent = Math.round((this.audio.currentTime / this.audio.duration) * 1000) / 10;
        if (percent >= 100) {
          this.controllAudio();
        }
        this.current = this.playTime(current);
        document.getElementById('seekbar').style.backgroundSize = percent + '%';
      }
    })
    const seekbar = document.getElementById('seekbar');
    seekbar.addEventListener('click', (e) => {
      const duration = Math.round(this.audio.duration);
      if (!isNaN(duration)) {
        const mouse = e.pageX
        const element = document.getElementById('seekbar');
        const rect = element.getBoundingClientRect();
        const position = rect.left + window.pageXOffset;
        const offset = mouse - position;
        const width = rect.right - rect.left;
        this.audio.currentTime = Math.round(duration * (offset / width));
      }
    })
  }
})