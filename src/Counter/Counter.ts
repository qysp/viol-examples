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
    <button
      x-text="state.time"
      @click="onClick()"
      class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
    ></button>
  `,
  state: {
    intervalId: null,
    time: 20,
  },
})
export class Counter extends ViolComponent<CounterState, CounterProps> {
  onClick() {
    if (this.state.intervalId !== null) {
      this.stop();
      return;
    } else if (this.state.time === 0) {
      this.reset();
    }
    this.start();
  }

  start() {
    --this.state.time;
    this.state.intervalId = setInterval(() => {
      --this.state.time;
      if (this.state.time === 0) {
        if (this.props.onDone !== undefined) {
          this.props.onDone();
        }
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
    this.state.time = 20;
  }
}
