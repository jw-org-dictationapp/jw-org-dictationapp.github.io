/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import {GoogleGenAI} from '@google/genai';
import {marked} from 'marked';

const MODEL_NAME = 'gemini-2.5-flash';

type Language = 'en' | 'lt' | 'ru';

const UI_STRINGS = {
  polishedTab: {en: 'Polished', lt: 'Nugludinta', ru: 'Обработанная'},
  rawTab: {en: 'Raw', lt: 'Neapdorota', ru: 'Черновик'},
  untitledNote: {en: 'Untitled Note', lt: 'Užrašas be pavadinimo', ru: 'Заметка без названия'},
  polishedPlaceholder: {en: 'Your polished notes will appear here...', lt: 'Čia atsiras jūsų nugludinti užrašai...', ru: 'Здесь появятся ваши обработанные заметки...'},
  rawPlaceholder: {en: 'Raw transcription will appear here...', lt: 'Čia atsiras neapdorota transkripcija...', ru: 'Здесь появится черновая транскрипция...'},
  readyToRecord: {en: 'Ready to record', lt: 'Pasiruošta įrašyti', ru: 'Готово к записи'},
  requestingMic: {en: 'Requesting microphone access...', lt: 'Prašoma prieigos prie mikrofono...', ru: 'Запрос доступа к микрофону...'},
  micDenied: {en: 'Microphone permission denied. Please check browser settings and reload page.', lt: 'Prieiga prie mikrofono atmesta. Patikrinkite naršyklės nustatymus ir perkraukite puslapį.', ru: 'Доступ к микрофону запрещен. Проверьте настройки браузера и перезагрузите страницу.'},
  micNotFound: {en: 'No microphone found. Please connect a microphone.', lt: 'Mikrofonas nerastas. Prijunkite mikrofoną.', ru: 'Микрофон не найден. Подключите микрофон.'},
  micInUse: {en: 'Cannot access microphone. It may be in use by another application.', lt: 'Nepavyksta pasiekti mikrofono. Gali būti, kad jį naudoja kita programa.', ru: 'Не удается получить доступ к микрофону. Возможно, он используется другим приложением.'},
  errorRecording: (msg: string) => ({en: `Error: ${msg}`, lt: `Klaida: ${msg}`, ru: `Ошибка: ${msg}`}),
  processingAudio: {en: 'Processing audio...', lt: 'Apdorojamas garsas...', ru: 'Обработка аудио...'},
  noAudioData: {en: 'No audio data captured. Please try again.', lt: 'Garso duomenų neužfiksuota. Bandykite dar kartą.', ru: 'Нет аудиоданных. Попробуйте еще раз.'},
  convertingAudio: {en: 'Converting audio...', lt: 'Konvertuojamas garsas...', ru: 'Преобразование аудио...'},
  errorProcessing: {en: 'Error processing recording. Please try again.', lt: 'Klaida apdorojant įrašą. Bandykite dar kartą.', ru: 'Ошибка обработки записи. Попробуйте еще раз.'},
  gettingTranscription: {en: 'Getting transcription...', lt: 'Gaunama transkripcija...', ru: 'Получение транскрипции...'},
  transcriptionComplete: {en: 'Transcription complete. Polishing note...', lt: 'Transkripcija baigta. Gludinamas užrašas...', ru: 'Транскрипция завершена. Обработка заметки...'},
  transcriptionFailed: {en: 'Transcription failed or returned empty.', lt: 'Transkripcija nepavyko arba tuščia.', ru: 'Ошибка транскрипции или пустой результат.'},
  couldNotTranscribe: {en: 'Could not transcribe audio. Please try again.', lt: 'Nepavyko transkribuoti garso. Bandykite dar kartą.', ru: 'Не удалось транскрибировать аудио. Попробуйте еще раз.'},
  errorDuringTranscription: (msg: string) => ({en: `Error during transcription: ${msg}`, lt: `Klaida transkribuojant: ${msg}`, ru: `Ошибка во время транскрипции: ${msg}`}),
  noTranscriptionToPolish: {en: 'No transcription to polish', lt: 'Nėra transkripcijos, kurią būtų galima nugludinti', ru: 'Нет транскрипции для обработки'},
  noTranscriptionAvailable: {en: 'No transcription available to polish.', lt: 'Nėra transkripcijos, kurią būtų galima nugludinti.', ru: 'Нет доступной транскрипции для обработки.'},
  polishingNote: {en: 'Polishing note...', lt: 'Gludinamas užrašas...', ru: 'Обработка заметки...'},
  notePolished: {en: 'Note polished. Ready for next recording.', lt: 'Užrašas nugludintas. Pasiruošta kitam įrašui.', ru: 'Заметка обработана. Готово к следующей записи.'},
  polishingFailed: {en: 'Polishing failed or returned empty.', lt: 'Gludinimas nepavyko arba tuščias.', ru: 'Ошибка обработки или пустой результат.'},
  polishingReturnedEmpty: {en: 'Polishing returned empty. Raw transcription is available.', lt: 'Gludinimas grąžino tuščią rezultatą. Prieinama neapdorota transkripcija.', ru: 'Обработка вернула пустой результат. Доступна черновая транскрипция.'},
  errorDuringPolishing: (msg: string) => ({en: `Error during polishing: ${msg}`, lt: `Klaida gludinant: ${msg}`, ru: `Ошибка при обработке: ${msg}`}),
  toggleTheme: {en: 'Toggle Theme', lt: 'Keisti temą', ru: 'Переключить тему'},
  startRecording: {en: 'Start Recording', lt: 'Pradėti įrašymą', ru: 'Начать запись'},
  stopRecording: {en: 'Stop Recording', lt: 'Stabdyti įrašymą', ru: 'Остановить запись'},
  newNote: {en: 'New Note / Clear', lt: 'Naujas užrašas / Išvalyti', ru: 'Новая заметка / Очистить'},
  recordText: {en: 'Record', lt: 'Įrašyti', ru: 'Запись'},
  toggleLanguage: {en: 'Change Language', lt: 'Keisti kalbą', ru: 'Изменить язык'},
  transcriptionPrompt: {en: 'Generate a complete, detailed transcript of this audio.', lt: 'Prašau sukurti išsamią šio garso įrašo transkripciją.', ru: 'Создайте полную и подробную транскрипцию этой аудиозаписи.'},
  polishPrompt: {en: `Take this raw transcription and create a polished, well-formatted note. Remove filler words (um, uh, like), repetitions, and false starts. Format any lists or bullet points properly. Use markdown formatting for headings, lists, etc. Maintain all the original content and meaning. Raw transcription:`, lt: `Paimkite šią neapdorotą transkripciją ir sukurkite nugludintą, gerai suformatuotą užrašą. Pašalinkite užpildo žodžius (um, uh, panašiai), pasikartojimus ir klaidingus startus. Tinkamai suformatuokite sąrašus ar punktus. Naudokite markdown formatavimą antraštėms, sąrašams ir t.t. Išsaugokite visą originalų turinį ir prasmę. Neapdorota transkripcija:`, ru: `Возьмите эту черновую транскрипцию и создайте отполированную, хорошо отформатированную заметку. Удалите слова-паразиты (эм, э-э, типа), повторы и фальстарты. Правильно отформатируйте любые списки. Используйте markdown-форматирование для заголовков, списков и т.д. Сохраните все исходное содержание и смысл. Черновая транскрипция:`},
};

type UIStringKey = keyof typeof UI_STRINGS;

interface Note {
  id: string;
  rawTranscription: string;
  polishedNote: string;
  timestamp: number;
}

class VoiceNotesApp {
  private genAI: GoogleGenAI;
  private mediaRecorder: MediaRecorder | null = null;
  private recordButton: HTMLButtonElement;
  private recordingStatus: HTMLDivElement;
  private rawTranscription: HTMLDivElement;
  private polishedNote: HTMLDivElement;
  private newButton: HTMLButtonElement;
  private themeToggleButton: HTMLButtonElement;
  private themeToggleIcon: HTMLElement;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private currentNote: Note | null = null;
  private stream: MediaStream | null = null;
  private editorTitle: HTMLDivElement;
  private hasAttemptedPermission = false;

  private recordingInterface: HTMLDivElement;
  private liveRecordingTitle: HTMLDivElement;
  private liveWaveformCanvas: HTMLCanvasElement | null;
  private liveWaveformCtx: CanvasRenderingContext2D | null = null;
  private liveRecordingTimerDisplay: HTMLDivElement;
  private statusIndicatorDiv: HTMLDivElement | null;

  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private waveformDataArray: Uint8Array | null = null;
  private waveformDrawingId: number | null = null;
  private timerIntervalId: number | null = null;
  private recordingStartTime: number = 0;

  private currentLanguage: Language = 'en';
  private languageToggleButton: HTMLButtonElement;
  private languageMenu: HTMLDivElement;

  constructor() {
    this.genAI = new GoogleGenAI({
      apiKey: process.env.API_KEY!,
    });

    this.recordButton = document.getElementById('recordButton') as HTMLButtonElement;
    this.recordingStatus = document.getElementById('recordingStatus') as HTMLDivElement;
    this.rawTranscription = document.getElementById('rawTranscription') as HTMLDivElement;
    this.polishedNote = document.getElementById('polishedNote') as HTMLDivElement;
    this.newButton = document.getElementById('newButton') as HTMLButtonElement;
    this.themeToggleButton = document.getElementById('themeToggleButton') as HTMLButtonElement;
    this.themeToggleIcon = this.themeToggleButton.querySelector('i') as HTMLElement;
    this.editorTitle = document.querySelector('.editor-title') as HTMLDivElement;
    this.languageToggleButton = document.getElementById('languageToggleButton') as HTMLButtonElement;
    this.languageMenu = document.getElementById('languageMenu') as HTMLDivElement;

    this.recordingInterface = document.querySelector('.recording-interface') as HTMLDivElement;
    this.liveRecordingTitle = document.getElementById('liveRecordingTitle') as HTMLDivElement;
    this.liveWaveformCanvas = document.getElementById('liveWaveformCanvas') as HTMLCanvasElement;
    this.liveRecordingTimerDisplay = document.getElementById('liveRecordingTimerDisplay') as HTMLDivElement;

    if (this.liveWaveformCanvas) {
      this.liveWaveformCtx = this.liveWaveformCanvas.getContext('2d');
    } else {
      console.warn('Live waveform canvas element not found. Visualizer will not work.');
    }

    if (this.recordingInterface) {
      this.statusIndicatorDiv = this.recordingInterface.querySelector('.status-indicator') as HTMLDivElement;
    } else {
      console.warn('Recording interface element not found.');
      this.statusIndicatorDiv = null;
    }

    this.bindEventListeners();
    this.initTheme();
    this.initLanguage();
    this.createNewNote();
  }

  private T(key: UIStringKey, ...args: any[]): string {
    const resource = UI_STRINGS[key];
    if (!resource) return key;

    let strOrFn: any;
    if (typeof resource === 'function') {
      strOrFn = resource(...args);
    } else {
      strOrFn = resource;
    }

    return strOrFn[this.currentLanguage] || strOrFn['en'];
  }

  private updateUIStrings() {
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n as UIStringKey;
      if (key) {
        el.textContent = this.T(key);
      }
    });

    document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach(el => {
      const key = el.dataset.i18nTitle as UIStringKey;
      if (key) {
        // Record button title is dynamic, handle it separately.
        if (el.id !== 'recordButton') {
          el.title = this.T(key);
        }
      }
    });

    document.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder as UIStringKey;
      if (key) {
        const placeholderText = this.T(key);
        el.setAttribute('placeholder', placeholderText);
        if (el.classList.contains('placeholder-active')) {
          if (el.id === 'polishedNote') {
            el.innerHTML = placeholderText;
          } else {
            el.textContent = placeholderText;
          }
        }
      }
    });

    this.recordButton.setAttribute('title', this.isRecording ? this.T('stopRecording') : this.T('startRecording'));
  }

  private bindEventListeners(): void {
    this.recordButton.addEventListener('click', () => this.toggleRecording());
    this.newButton.addEventListener('click', () => this.createNewNote());
    this.themeToggleButton.addEventListener('click', () => this.toggleTheme());
    this.languageToggleButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleLanguageMenu();
    });
    document.querySelectorAll('.language-option').forEach(button => {
      button.addEventListener('click', (e) => {
        const lang = (e.currentTarget as HTMLElement).dataset.lang as Language;
        if (lang) {
          this.setLanguage(lang);
        }
      });
    });
    window.addEventListener('resize', this.handleResize.bind(this));
    document.addEventListener('click', () => {
      if (this.languageMenu.classList.contains('visible')) {
        this.toggleLanguageMenu(false);
      }
    });
  }

  private handleResize(): void {
    if (this.isRecording && this.liveWaveformCanvas && this.liveWaveformCanvas.style.display === 'block') {
      requestAnimationFrame(() => {
        this.setupCanvasDimensions();
      });
    }
  }

  private setupCanvasDimensions(): void {
    if (!this.liveWaveformCanvas || !this.liveWaveformCtx) return;

    const canvas = this.liveWaveformCanvas;
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = rect.height;

    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);

    this.liveWaveformCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private initLanguage(): void {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'lt', 'ru'].includes(savedLanguage)) {
      this.setLanguage(savedLanguage, true);
    } else {
      this.setLanguage('en', true);
    }
  }

  private setLanguage(lang: Language, isInit = false): void {
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);

    document.querySelectorAll('.language-option').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    if (!isInit) {
      this.updateUIStrings();
    }
    
    this.toggleLanguageMenu(false);
  }

  private toggleLanguageMenu(forceState?: boolean): void {
    this.languageMenu.classList.toggle('visible', forceState);
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      this.themeToggleIcon.classList.remove('fa-sun');
      this.themeToggleIcon.classList.add('fa-moon');
    } else {
      document.body.classList.remove('light-mode');
      this.themeToggleIcon.classList.remove('fa-moon');
      this.themeToggleIcon.classList.add('fa-sun');
    }
  }

  private toggleTheme(): void {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
      localStorage.setItem('theme', 'light');
      this.themeToggleIcon.classList.remove('fa-sun');
      this.themeToggleIcon.classList.add('fa-moon');
    } else {
      localStorage.setItem('theme', 'dark');
      this.themeToggleIcon.classList.remove('fa-moon');
      this.themeToggleIcon.classList.add('fa-sun');
    }
  }

  private async toggleRecording(): Promise<void> {
    if (!this.isRecording) {
      await this.startRecording();
    } else {
      await this.stopRecording();
    }
  }

  private setupAudioVisualizer(): void {
    if (!this.stream || this.audioContext) return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyserNode = this.audioContext.createAnalyser();

    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.75;

    const bufferLength = this.analyserNode.frequencyBinCount;
    this.waveformDataArray = new Uint8Array(bufferLength);

    source.connect(this.analyserNode);
  }

  private drawLiveWaveform(): void {
    if (!this.analyserNode || !this.waveformDataArray || !this.liveWaveformCtx || !this.liveWaveformCanvas || !this.isRecording) {
      if (this.waveformDrawingId) cancelAnimationFrame(this.waveformDrawingId);
      this.waveformDrawingId = null;
      return;
    }

    this.waveformDrawingId = requestAnimationFrame(() => this.drawLiveWaveform());
    this.analyserNode.getByteFrequencyData(this.waveformDataArray);

    const ctx = this.liveWaveformCtx;
    const canvas = this.liveWaveformCanvas;

    const logicalWidth = canvas.clientWidth;
    const logicalHeight = canvas.clientHeight;

    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    const bufferLength = this.analyserNode.frequencyBinCount;
    const numBars = Math.floor(bufferLength * 0.5);

    if (numBars === 0) return;

    const totalBarPlusSpacingWidth = logicalWidth / numBars;
    const barWidth = Math.max(1, Math.floor(totalBarPlusSpacingWidth * 0.7));
    const barSpacing = Math.max(0, Math.floor(totalBarPlusSpacingWidth * 0.3));

    let x = 0;

    const recordingColor = getComputedStyle(document.documentElement).getPropertyValue('--color-recording').trim() || '#ff3b30';
    ctx.fillStyle = recordingColor;

    for (let i = 0; i < numBars; i++) {
      if (x >= logicalWidth) break;

      const dataIndex = Math.floor(i * (bufferLength / numBars));
      const barHeightNormalized = this.waveformDataArray[dataIndex] / 255.0;
      let barHeight = barHeightNormalized * logicalHeight;

      if (barHeight < 1 && barHeight > 0) barHeight = 1;
      barHeight = Math.round(barHeight);

      const y = Math.round((logicalHeight - barHeight) / 2);

      ctx.fillRect(Math.floor(x), y, barWidth, barHeight);
      x += barWidth + barSpacing;
    }
  }

  private updateLiveTimer(): void {
    if (!this.isRecording || !this.liveRecordingTimerDisplay) return;
    const now = Date.now();
    const elapsedMs = now - this.recordingStartTime;

    const totalSeconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((elapsedMs % 1000) / 10);

    this.liveRecordingTimerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  }

  private startLiveDisplay(): void {
    if (!this.recordingInterface || !this.liveRecordingTitle || !this.liveWaveformCanvas || !this.liveRecordingTimerDisplay) {
      console.warn('One or more live display elements are missing. Cannot start live display.');
      return;
    }

    this.recordingInterface.classList.add('is-live');
    this.liveRecordingTitle.style.display = 'block';
    this.liveWaveformCanvas.style.display = 'block';
    this.liveRecordingTimerDisplay.style.display = 'block';

    this.setupCanvasDimensions();

    if (this.statusIndicatorDiv) this.statusIndicatorDiv.style.display = 'none';

    const iconElement = this.recordButton.querySelector('.record-button-inner i') as HTMLElement;
    if (iconElement) {
      iconElement.classList.remove('fa-microphone');
      iconElement.classList.add('fa-stop');
    }

    const currentTitle = this.editorTitle.textContent?.trim();
    const placeholder = this.editorTitle.getAttribute('placeholder') || this.T('untitledNote');
    this.liveRecordingTitle.textContent = currentTitle && currentTitle !== placeholder ? currentTitle : this.T('recordText');

    this.setupAudioVisualizer();
    this.drawLiveWaveform();

    this.recordingStartTime = Date.now();
    this.updateLiveTimer();
    if (this.timerIntervalId) clearInterval(this.timerIntervalId);
    this.timerIntervalId = window.setInterval(() => this.updateLiveTimer(), 50);
  }

  private stopLiveDisplay(): void {
    if (!this.recordingInterface || !this.liveRecordingTitle || !this.liveWaveformCanvas || !this.liveRecordingTimerDisplay) {
      if (this.recordingInterface) this.recordingInterface.classList.remove('is-live');
      return;
    }
    this.recordingInterface.classList.remove('is-live');
    this.liveRecordingTitle.style.display = 'none';
    this.liveWaveformCanvas.style.display = 'none';
    this.liveRecordingTimerDisplay.style.display = 'none';

    if (this.statusIndicatorDiv) this.statusIndicatorDiv.style.display = 'block';

    const iconElement = this.recordButton.querySelector('.record-button-inner i') as HTMLElement;
    if (iconElement) {
      iconElement.classList.remove('fa-stop');
      iconElement.classList.add('fa-microphone');
    }

    if (this.waveformDrawingId) {
      cancelAnimationFrame(this.waveformDrawingId);
      this.waveformDrawingId = null;
    }
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
    if (this.liveWaveformCtx && this.liveWaveformCanvas) {
      this.liveWaveformCtx.clearRect(0, 0, this.liveWaveformCanvas.width, this.liveWaveformCanvas.height);
    }

    if (this.audioContext) {
      if (this.audioContext.state !== 'closed') {
        this.audioContext.close().catch((e) => console.warn('Error closing audio context', e));
      }
      this.audioContext = null;
    }
    this.analyserNode = null;
    this.waveformDataArray = null;
  }

  private async startRecording(): Promise<void> {
    try {
      this.audioChunks = [];
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }
      if (this.audioContext && this.audioContext.state !== 'closed') {
        await this.audioContext.close();
        this.audioContext = null;
      }

      this.recordingStatus.textContent = this.T('requestingMic');

      try {
        this.stream = await navigator.mediaDevices.getUserMedia({audio: true});
      } catch (err) {
        console.error('Failed with basic constraints:', err);
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: {echoCancellation: false, noiseSuppression: false, autoGainControl: false},
        });
      }

      try {
        this.mediaRecorder = new MediaRecorder(this.stream, {mimeType: 'audio/webm'});
      } catch (e) {
        console.error('audio/webm not supported, trying default:', e);
        this.mediaRecorder = new MediaRecorder(this.stream);
      }

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        this.stopLiveDisplay();

        if (this.audioChunks.length > 0) {
          const audioBlob = new Blob(this.audioChunks, {type: this.mediaRecorder?.mimeType || 'audio/webm'});
          this.processAudio(audioBlob).catch((err) => {
            console.error('Error processing audio:', err);
            this.recordingStatus.textContent = this.T('errorProcessing');
          });
        } else {
          this.recordingStatus.textContent = this.T('noAudioData');
        }

        if (this.stream) {
          this.stream.getTracks().forEach((track) => {
            track.stop();
          });
          this.stream = null;
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;

      this.recordButton.classList.add('recording');
      this.recordButton.setAttribute('title', this.T('stopRecording'));

      this.startLiveDisplay();
    } catch (error) {
      console.error('Error starting recording:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.name : 'Unknown';

      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        this.recordingStatus.textContent = this.T('micDenied');
      } else if (errorName === 'NotFoundError' || (errorName === 'DOMException' && errorMessage.includes('Requested device not found'))) {
        this.recordingStatus.textContent = this.T('micNotFound');
      } else if (errorName === 'NotReadableError' || errorName === 'AbortError' || (errorName === 'DOMException' && errorMessage.includes('Failed to allocate audiosource'))) {
        this.recordingStatus.textContent = this.T('micInUse');
      } else {
        this.recordingStatus.textContent = this.T('errorRecording', errorMessage);
      }

      this.isRecording = false;
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }
      this.recordButton.classList.remove('recording');
      this.recordButton.setAttribute('title', this.T('startRecording'));
      this.stopLiveDisplay();
    }
  }

  private async stopRecording(): Promise<void> {
    if (this.mediaRecorder && this.isRecording) {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        console.error('Error stopping MediaRecorder:', e);
        this.stopLiveDisplay();
      }

      this.isRecording = false;

      this.recordButton.classList.remove('recording');
      this.recordButton.setAttribute('title', this.T('startRecording'));
      this.recordingStatus.textContent = this.T('processingAudio');
    } else {
      if (!this.isRecording) this.stopLiveDisplay();
    }
  }

  private async processAudio(audioBlob: Blob): Promise<void> {
    if (audioBlob.size === 0) {
      this.recordingStatus.textContent = this.T('noAudioData');
      return;
    }

    try {
      URL.createObjectURL(audioBlob);

      this.recordingStatus.textContent = this.T('convertingAudio');

      const reader = new FileReader();
      const readResult = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          try {
            const base64data = reader.result as string;
            const base64Audio = base64data.split(',')[1];
            resolve(base64Audio);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(reader.error);
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await readResult;

      if (!base64Audio) throw new Error('Failed to convert audio to base64');

      const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
      await this.getTranscription(base64Audio, mimeType);
    } catch (error) {
      console.error('Error in processAudio:', error);
      this.recordingStatus.textContent = this.T('errorProcessing');
    }
  }

  private async getTranscription(base64Audio: string, mimeType: string): Promise<void> {
    try {
      this.recordingStatus.textContent = this.T('gettingTranscription');
      const promptText = this.T('transcriptionPrompt');

      const response = await this.genAI.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [{text: promptText}, {inlineData: {mimeType: mimeType, data: base64Audio}}],
        },
      });

      const transcriptionText = response.text;

      if (transcriptionText) {
        this.rawTranscription.textContent = transcriptionText;
        if (transcriptionText.trim() !== '') {
          this.rawTranscription.classList.remove('placeholder-active');
        } else {
          const placeholder = this.rawTranscription.getAttribute('placeholder') || '';
          this.rawTranscription.textContent = placeholder;
          this.rawTranscription.classList.add('placeholder-active');
        }

        if (this.currentNote) this.currentNote.rawTranscription = transcriptionText;
        this.recordingStatus.textContent = this.T('transcriptionComplete');
        this.getPolishedNote().catch((err) => {
          console.error('Error polishing note:', err);
          this.recordingStatus.textContent = this.T('polishingFailed');
        });
      } else {
        this.recordingStatus.textContent = this.T('transcriptionFailed');
        this.polishedNote.innerHTML = `<p><em>${this.T('couldNotTranscribe')}</em></p>`;
        this.rawTranscription.textContent = this.rawTranscription.getAttribute('placeholder');
        this.rawTranscription.classList.add('placeholder-active');
      }
    } catch (error) {
      console.error('Error getting transcription:', error);
      this.recordingStatus.textContent = this.T('transcriptionFailed');
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.polishedNote.innerHTML = `<p><em>${this.T('errorDuringTranscription', errorMessage)}</em></p>`;
      this.rawTranscription.textContent = this.rawTranscription.getAttribute('placeholder');
      this.rawTranscription.classList.add('placeholder-active');
    }
  }

  private async getPolishedNote(): Promise<void> {
    try {
      if (!this.rawTranscription.textContent || this.rawTranscription.textContent.trim() === '' || this.rawTranscription.classList.contains('placeholder-active')) {
        this.recordingStatus.textContent = this.T('noTranscriptionToPolish');
        this.polishedNote.innerHTML = `<p><em>${this.T('noTranscriptionAvailable')}</em></p>`;
        const placeholder = this.polishedNote.getAttribute('placeholder') || '';
        this.polishedNote.innerHTML = placeholder;
        this.polishedNote.classList.add('placeholder-active');
        return;
      }

      this.recordingStatus.textContent = this.T('polishingNote');

      const prompt = `${this.T('polishPrompt')}
                    ${this.rawTranscription.textContent}`;

      const response = await this.genAI.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
      const polishedText = response.text;

      if (polishedText) {
        const htmlContent = await marked.parse(polishedText);
        this.polishedNote.innerHTML = htmlContent;
        if (polishedText.trim() !== '') {
          this.polishedNote.classList.remove('placeholder-active');
        } else {
          const placeholder = this.polishedNote.getAttribute('placeholder') || '';
          this.polishedNote.innerHTML = placeholder;
          this.polishedNote.classList.add('placeholder-active');
        }

        let noteTitleSet = false;
        const lines = polishedText.split('\n').map((l) => l.trim());

        for (const line of lines) {
          if (line.startsWith('#')) {
            const title = line.replace(/^#+\s+/, '').trim();
            if (this.editorTitle && title) {
              this.editorTitle.textContent = title;
              this.editorTitle.classList.remove('placeholder-active');
              noteTitleSet = true;
              break;
            }
          }
        }

        if (!noteTitleSet && this.editorTitle) {
          for (const line of lines) {
            if (line.length > 0) {
              let potentialTitle = line.replace(/^[\*_\`#\->\s\[\]\(.\d)]+/, '');
              potentialTitle = potentialTitle.replace(/[\*_\`#]+$/, '');
              potentialTitle = potentialTitle.trim();

              if (potentialTitle.length > 3) {
                const maxLength = 60;
                this.editorTitle.textContent = potentialTitle.substring(0, maxLength) + (potentialTitle.length > maxLength ? '...' : '');
                this.editorTitle.classList.remove('placeholder-active');
                noteTitleSet = true;
                break;
              }
            }
          }
        }

        if (!noteTitleSet && this.editorTitle) {
          const currentEditorText = this.editorTitle.textContent?.trim();
          const placeholderText = this.editorTitle.getAttribute('placeholder') || this.T('untitledNote');
          if (currentEditorText === '' || currentEditorText === placeholderText) {
            this.editorTitle.textContent = placeholderText;
            if (!this.editorTitle.classList.contains('placeholder-active')) {
              this.editorTitle.classList.add('placeholder-active');
            }
          }
        }

        if (this.currentNote) this.currentNote.polishedNote = polishedText;
        this.recordingStatus.textContent = this.T('notePolished');
      } else {
        this.recordingStatus.textContent = this.T('polishingFailed');
        this.polishedNote.innerHTML = `<p><em>${this.T('polishingReturnedEmpty')}</em></p>`;
        if (this.polishedNote.textContent?.trim() === '' || this.polishedNote.innerHTML.includes('<em>')) {
          const placeholder = this.polishedNote.getAttribute('placeholder') || '';
          this.polishedNote.innerHTML = placeholder;
          this.polishedNote.classList.add('placeholder-active');
        }
      }
    } catch (error) {
      console.error('Error polishing note:', error);
      this.recordingStatus.textContent = this.T('polishingFailed');
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.polishedNote.innerHTML = `<p><em>${this.T('errorDuringPolishing', errorMessage)}</em></p>`;
      if (this.polishedNote.textContent?.trim() === '' || this.polishedNote.innerHTML.includes('<em>')) {
        const placeholder = this.polishedNote.getAttribute('placeholder') || '';
        this.polishedNote.innerHTML = placeholder;
        this.polishedNote.classList.add('placeholder-active');
      }
    }
  }

  private createNewNote(): void {
    this.currentNote = {
      id: `note_${Date.now()}`,
      rawTranscription: '',
      polishedNote: '',
      timestamp: Date.now(),
    };

    const rawPlaceholder = this.rawTranscription.getAttribute('placeholder') || this.T('rawPlaceholder');
    this.rawTranscription.textContent = rawPlaceholder;
    this.rawTranscription.classList.add('placeholder-active');

    const polishedPlaceholder = this.polishedNote.getAttribute('placeholder') || this.T('polishedPlaceholder');
    this.polishedNote.innerHTML = polishedPlaceholder;
    this.polishedNote.classList.add('placeholder-active');

    if (this.editorTitle) {
      const placeholder = this.editorTitle.getAttribute('placeholder') || this.T('untitledNote');
      this.editorTitle.textContent = placeholder;
      this.editorTitle.classList.add('placeholder-active');
    }
    this.recordingStatus.textContent = this.T('readyToRecord');

    if (this.isRecording) {
      this.mediaRecorder?.stop();
      this.isRecording = false;
      this.recordButton.classList.remove('recording');
    } else {
      this.stopLiveDisplay();
    }
    this.updateUIStrings();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new VoiceNotesApp();

  document.querySelectorAll<HTMLElement>('[contenteditable][placeholder]').forEach((el) => {
    function updatePlaceholderState() {
      const placeholder = el.getAttribute('placeholder')!;
      const currentText = (el.id === 'polishedNote' ? el.innerText : el.textContent)?.trim();

      if (currentText === '' || currentText === placeholder) {
        if (currentText === '') {
          if (el.id === 'polishedNote') {
            el.innerHTML = placeholder;
          } else {
            el.textContent = placeholder;
          }
        }
        el.classList.add('placeholder-active');
      } else {
        el.classList.remove('placeholder-active');
      }
    }

    updatePlaceholderState();

    el.addEventListener('focus', function() {
      const placeholder = this.getAttribute('placeholder')!;
      const currentText = (this.id === 'polishedNote' ? this.innerText : this.textContent)?.trim();
      if (currentText === placeholder) {
        if (this.id === 'polishedNote') this.innerHTML = '';
        else this.textContent = '';
        this.classList.remove('placeholder-active');
      }
    });

    el.addEventListener('blur', function() {
      updatePlaceholderState();
    });
  });
});

export {};