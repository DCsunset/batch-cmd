// Copyright (C) 2023  DCsunset

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

export type SignalCallback = (signal: NodeJS.Signals, count: number) => void;

export class SignalHandler {
  signals: NodeJS.Signals[];
  callback: SignalCallback;
  /// Counter of received signals
  counter: number = 0;

  constructor(signals: NodeJS.Signals[], callback: SignalCallback) {
    this.signals = signals;
    this.callback = callback;
  }

  // use arrow function to bind this in callback
  private handler = (signal: NodeJS.Signals) => {
    const cnt = ++this.counter;
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

