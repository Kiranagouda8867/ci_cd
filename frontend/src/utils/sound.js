/**
 * Sound Utilities
 * Plays audio feedback for detection events
 */

/**
 * Play a simple beep sound
 * @param {number} frequency - Frequency in Hz (default 800)
 * @param {number} duration - Duration in milliseconds (default 200)
 */
export function playBeep(frequency = 800, duration = 200) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);

    console.log('🔔 Detection beep played');
  } catch (error) {
    console.warn('⚠️ Could not play beep:', error);
  }
}

/**
 * Play success sound (3 ascending beeps)
 */
export function playSuccessSound() {
  try {
    playBeep(600, 150);
    setTimeout(() => playBeep(800, 150), 200);
    setTimeout(() => playBeep(1000, 200), 400);
  } catch (error) {
    console.warn('⚠️ Could not play success sound:', error);
  }
}

/**
 * Play error sound (descending beep)
 */
export function playErrorSound() {
  try {
    playBeep(1000, 200);
    setTimeout(() => playBeep(600, 200), 250);
  } catch (error) {
    console.warn('⚠️ Could not play error sound:', error);
  }
}
