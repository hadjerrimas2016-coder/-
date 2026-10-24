// Web Notifications API helper with safe fallback and rich kids styling
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported in this browser.');
    return false;
  }
  try {
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return false;
  }
}

export function hasNotificationPermission(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

export function sendLocalNotification(
  title: string,
  options?: NotificationOptions & { soundEffect?: boolean }
): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const defaultIcon = '/assets/aistudio/Capture_d__cran_2026-10-17_165411_ea7c3f60.png';
    const notification = new Notification(title, {
      icon: options?.icon || defaultIcon,
      badge: options?.badge || defaultIcon,
      dir: 'rtl',
      lang: 'ar',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto close after 8 seconds
    setTimeout(() => {
      try {
        notification.close();
      } catch {
        // ignore
      }
    }, 8000);
  } catch (err) {
    console.warn('Failed to send notification:', err);
  }
}

export function notifyStoryPlayback(storyTitle: string, progressText?: string) {
  sendLocalNotification(`🎧 جاري تشغيل: ${storyTitle}`, {
    body: progressText || 'يمكنك إكمال الاستماع في خلفية الهاتف حتى والشاشة مقفلة! ✨',
    tag: 'playback-active',
  });
}

export function notifyStoryCompleted(storyTitle: string, moralLesson?: string) {
  sendLocalNotification(`🎉 أحسنت يا بطل! أنهيت قصة: ${storyTitle}`, {
    body: moralLesson ? `💡 الحكمة: ${moralLesson}` : 'ما رأيك في تلاوة سورة أو دعاء من ركن السُنّة قبل النوم؟ 🌙',
    tag: 'story-finished',
  });
}

export function notifyDuaaReminder(duaaTitle: string, duaaText: string) {
  sendLocalNotification(`🕌 تذكير ركن السُنّة: ${duaaTitle}`, {
    body: `«${duaaText.slice(0, 100)}...» هيا نردد معاً لننال الثواب! 🤲`,
    tag: 'sunnah-reminder',
  });
}
