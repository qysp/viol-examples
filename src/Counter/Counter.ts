import {
  AlpineComponent,
  required,
  withDefault,
  Component,
} from '../../../ayce/lib/index';

type CounterState = {
  intervalId: null | number;
  time: number;
};

type CounterProps = {
  id: string;
  tickrate?: number;
  onDone?: Function;
};

@Component<Counter>({
  template: `
    <button
      :id="props.id"
      x-text="state.time"
      @click="start()"
      class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
    ></button>
  `,
  state: {
    intervalId: null,
    time: 20,
  },
  propTypes: {
    id: required(String),
    tickrate: withDefault(Number, 1000),
  },
})
export class Counter extends AlpineComponent<CounterState, CounterProps> {
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
    }, this.props.tickrate!);
  }

  stop() {
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }
    this.reset();
  }

  reset() {
    this.state.time = 20;
  }
}
