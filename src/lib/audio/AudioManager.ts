class AudioManager {
  private static instance: AudioManager;
  private audio: HTMLAudioElement;

  private constructor() {
    this.audio = new Audio();
    this.audio.preload = "auto";
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async play(url: string): Promise<void> {
    this.stop();
    this.audio.src = url;
    try {
      await this.audio.play();
    } catch {
      /* autoplay policy — user gesture may be required */
    }
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.removeAttribute("src");
    this.audio.load();
  }
}

export const audioManager =
  typeof window !== "undefined"
    ? AudioManager.getInstance()
    : ({
        play: async () => {},
        stop: () => {},
      } as Pick<AudioManager, "play" | "stop">);
