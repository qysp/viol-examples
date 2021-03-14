import { AyceComponent, Component, html } from 'ayce';
import { SourceLink } from '../components/SourceLink';
import { CardGame } from './CardGame';
import { FlashMessage } from './FlashMessage';

@Component<MemoryApp>({
  template: html`
    <div class="text-center py-16">
      ${new SourceLink({ url: MemoryApp.SourceUrl })}
      ${new CardGame()}
      ${new FlashMessage()}
    </div>
  `,
})
export class MemoryApp extends AyceComponent {
  static readonly SourceUrl = 'https://github.com/alpinejs/alpine/blob/master/examples/card-game.html';

  onInit(): void {
    console.log('Init: Memory App');
  }
}
