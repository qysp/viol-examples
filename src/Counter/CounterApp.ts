import { ViolComponent, Component, html, getComponent } from '@viol/core';
import { RenderedIn } from '../components/RenderedIn';
import { Counter } from '../components/Counter';

const classes = [
  'bg-transparent',
  'hover:bg-blue-500',
  'text-blue-700',
  'font-semibold',
  'hover:text-white',
  'py-2',
  'px-4',
  'border',
  'border-blue-500',
  'hover:border-transparent',
  'rounded',
];

@Component<CounterApp>({
  template: ({ self }) => html`
    <div class="text-center">
      ${new RenderedIn({ name: self.parent!.name })}
      <div class="pb-4">
        <p class="text-lg font-bold text-gray-900 my-4">
          Counter (1s interval)
        </p>
        <button @click="onClick('Counter1')" class="${classes.join(' ')}">
          ${new Counter({ onDone: self.onDone('Counter 1') }, 'Counter1')}
        </button>
      </div>
      <div>
        <p class="text-lg font-bold text-gray-900 my-4">
          Counter (.5s interval)
        </p>
        <button @click="onClick('Counter2')" class="${classes.join(' ')}">
          ${new Counter({ onDone: self.onDone('Counter 2'), tickrate: 500 }, 'Counter2')}
        </button>
      </div>
    </div>
  `,
})
export class CounterApp extends ViolComponent {
  onInit() {
    console.log('Init: Counter App');
  }

  onAfterInit() {
    console.log('After Init: Counter App');
  }

  onClick(name: string) {
    const counter = getComponent(name) as Counter;
    if (counter.state.intervalId !== null) {
      counter.stop();
      return;
    } else if (counter.state.time === 0) {
      counter.reset();
    }
    counter.start();
  } 

  onDone(name: string) {
    return () => alert(`${name} -> done!`);
  }
}
