class SoundManager {
  constructor() {
    this.isMuted = false;
    this.sounds = {
      roll: new Audio('/sound_effect/dice_roll.mp3'),
      pigOut: new Audio('/sound_effect/invalid.mp3'),
      hold: new Audio('/sound_effect/selection_button.mp3'),
      win: new Audio('/sound_effect/celebration.mp3')
    };
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  play(event) {
    if (this.isMuted || !this.sounds[event]) return;
    this.sounds[event].currentTime = 0;
    this.sounds[event].play().catch(() => {});
  }
}

export const soundManager = new SoundManager();