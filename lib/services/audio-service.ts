'use client';

export class AudioService {
  public getLetterAudio(marathiLetter: string): HTMLAudioElement | null {
    if (typeof window !== 'undefined') {
      return new Audio(`/audio/marathi/${marathiLetter}.mp3`);
    }

    return null;
  }
}

export const audioService = new AudioService();
