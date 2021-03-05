import { AlpineComponent, Component } from '../../../ayce/lib/index';

type FlashMessageState = {
  show: boolean;
  message: string;
}

@Component({
  template: `
    <div
      x-show.transition.opacity="state.show"
      x-text="state.message"
      @flash.window="onFlash($event)"
      class="fixed bottom-0 right-0 bg-green-500 text-white p-2 mb-4 mr-4 rounded"
    >
    </div>
  `,
  state: {
    show: false,
    message: '',
  },
})
export class FlashMessage extends AlpineComponent<FlashMessageState> {
  onFlash($event: CustomEvent<{ message: string }>) {
    this.state.message = $event.detail.message;
    this.state.show = true;
    setTimeout(() => this.state.show = false, 1000)
  }
}