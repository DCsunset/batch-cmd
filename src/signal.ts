export type SignalCallback = (signal: NodeJS.Signals, count: number) => void;

export class SignalHandler {
  signals: NodeJS.Signals[];
  /// Counter of corresponding signal
  counters: { [signal in NodeJS.Signals]?: number };
  callback: SignalCallback;

  constructor(signals: NodeJS.Signals[], callback: SignalCallback) {
    this.signals = signals;
    this.counters = {}
    this.callback = callback;
    signals.forEach(sig => this.counters[sig] = 0);
  }

  // use arrow function to bind this in callback
  private handler = (signal: NodeJS.Signals) => {
    const cnt = ++this.counters[signal]!;
    this.callback(signal, cnt);
  }

  register() {
    this.signals.forEach(sig => {
      process.on(sig, this.handler);
    });
  }

  unregister() {
    this.signals.forEach(sig => {
      process.removeListener(sig, this.handler);
    });
  }
}

