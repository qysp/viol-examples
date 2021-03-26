import {
  ViolComponent,
  Component,
} from '@viol/core';

type CounterState = {
  intervalId: null | NodeJS.Timeout;
  time: number;
};

type CounterProps = {
  tickrate?: number;
  onDone?: Function;
};

@Component<Counter>({
  template: `
    <span x-text="state.time"></span>
  `,
  state: {
    intervalId: null,
    time: 20,
  },
})
export class Counter extends ViolComponent<CounterState, CounterProps> {
  onDestroy() {
    this.reset();
  }

  start() {
    if (this.state.intervalId !== null) {
      this.stop();
    }
    --this.state.time;
    this.state.intervalId = setInterval(() => {
      --this.state.time;
      if (this.state.time === 0) {
        this.props.onDone?.();
        this.stop();
      }
    }, this.props.tickrate ?? 1000);
  }

  stop() {
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }
  }

  reset() {
    this.stop();
    this.state.time = 20;
  }

  get isActive() {
    return this.state.intervalId !== null;
  }
}
