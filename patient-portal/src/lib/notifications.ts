/**
 * Notification utilities for the patient portal.
 * Schedules local notifications for medication reminders.
 */

type TimerRef = { notifyTimer: number; missedTimer?: number };
const timers = new Map<string, TimerRef[]>();

function key(patientId: string, medId: string) {
  return `${patientId}::${medId}`;
}

function toNextOccurrence(time: string) {
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target;
}

export function scheduleMedReminders(
  patientId: string,
  med: { id: string; name: string; dosage: string; reminderTimes: string[]; foodInstructions: string },
  onTaken: () => void,
  onMissed: () => void
) {
  const k = key(patientId, med.id);
  cancelMedReminders(patientId, med.id);
  const refs: TimerRef[] = [];

  const timeLabels = ["morning", "afternoon", "evening", "night"];

  for (let i = 0; i < med.reminderTimes.length; i++) {
    const t = med.reminderTimes[i];
    const when = toNextOccurrence(t);
    const delay = Math.max(0, when.getTime() - Date.now());
    const label = timeLabels[i] || `dose ${i + 1}`;

    // Schedule 15-minute warning
    const warningDelay = Math.max(0, delay - 15 * 60 * 1000);
    if (delay > 15 * 60 * 1000) {
      const warnTimer = window.setTimeout(() => {
        try {
          new Notification(`Medication Reminder`, {
            body: `${med.name} dose due in 15 minutes (${t})`,
            tag: k,
          });
        } catch (e) {
          // Notifications may be blocked
        }
      }, warningDelay);
      refs.push({ notifyTimer: warnTimer });
    }

    // Schedule main reminder
    const notifyTimer = window.setTimeout(() => {
      try {
        const timeOfDay = when.getHours() < 12 ? "morning" : when.getHours() < 17 ? "afternoon" : "evening";
        const body =
          med.reminderTimes.length > 1
            ? `It's ${when.getHours()}:${String(when.getMinutes()).padStart(2, "0")} — Please take your ${med.name}`
            : `Time to take your ${timeOfDay} medication — ${med.name} ${med.dosage}`;

        const n = new Notification(`${med.name} — Reminder`, {
          body,
          tag: k,
        });
        let taken = false;
        n.onclick = () => {
          taken = true;
          try {
            onTaken();
          } catch (e) {
            /* ignore */
          }
          n.close();
        };
        // Mark missed after 10 minutes if not acknowledged
        const missedTimer = window.setTimeout(() => {
          if (!taken) {
            try {
              onMissed();
            } catch (e) {
              /* ignore */
            }
            n.close();
          }
        }, 10 * 60 * 1000);
        refs.push({ notifyTimer, missedTimer });
      } catch (e) {
        // Notifications may be blocked
        window.setTimeout(() => onMissed(), 10 * 60 * 1000);
      }
    }, delay);
    refs.push({ notifyTimer });
  }
  if (refs.length) timers.set(k, refs);
}

export function cancelMedReminders(patientId: string, medId: string) {
  const k = key(patientId, medId);
  const refs = timers.get(k) || [];
  for (const r of refs) {
    if (r.notifyTimer) clearTimeout(r.notifyTimer);
    if (r.missedTimer) clearTimeout(r.missedTimer);
  }
  timers.delete(k);
}

export function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === "undefined") return Promise.resolve(false);
  if (Notification.permission === "granted") return Promise.resolve(true);
  if (Notification.permission === "denied") return Promise.resolve(false);
  return Notification.requestPermission().then((p) => p === "granted");
}
