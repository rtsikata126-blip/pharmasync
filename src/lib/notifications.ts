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

export function scheduleMedReminders(patientId: string, med: any, onTaken: () => void, onMissed: () => void) {
  const k = key(patientId, med.id);
  // clear existing
  cancelMedReminders(patientId, med.id);
  const refs: TimerRef[] = [];
  for (const t of med.reminderTimes || []) {
    const when = toNextOccurrence(t);
    const delay = Math.max(0, when.getTime() - Date.now());
    const notifyTimer = window.setTimeout(() => {
      try {
        const n = new Notification(`${med.name} — Reminder`, { body: `${med.dosage} • ${med.foodInstructions}`, tag: k });
        let taken = false;
        n.onclick = () => {
          taken = true;
          try { onTaken(); } catch (e) { /* ignore */ }
          n.close();
        };
        // mark missed after 10 minutes if not acknowledged
        const missedTimer = window.setTimeout(() => {
          if (!taken) {
            try { onMissed(); } catch (e) { /* ignore */ }
            n.close();
          }
        }, 10 * 60 * 1000);
        refs.push({ notifyTimer, missedTimer });
      } catch (e) {
        // Notifications may be blocked; still call missed after window to keep logs consistent
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

export function requestPermission() {
  if (typeof Notification === "undefined") return Promise.resolve(false);
  if (Notification.permission === "granted") return Promise.resolve(true);
  return Notification.requestPermission().then(p => p === "granted");
}
