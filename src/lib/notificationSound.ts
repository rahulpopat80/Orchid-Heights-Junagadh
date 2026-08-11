export const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification.wav');
    audio.play().catch((err) => {
      console.warn('Audio playback blocked by browser. User interaction required first.', err);
    });
  } catch (err) {
    console.error('Error playing sound', err);
  }
};
