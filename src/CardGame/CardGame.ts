import {
  AlpineComponent,
  Component,
} from '../../../ayce/lib/index';

type Card = { color: string, flipped: boolean, cleared: boolean };

type CardGameState = {
  cards: Card[],
};

@Component<CardGame>({
  template: `
    <div class="px-10 flex items-center justify-center">
      <h1 class="fixed top-0 right-0 p-10 font-bold text-3xl">
        <span x-text="points"></span>
        <span class="text-xs">pts</span>
      </h1>

      <div class="flex-1 grid grid-cols-4 gap-10">
        <template x-for="(card, index) in state.cards" :key="index">
          <div>
            <button
              x-show="! card.cleared"
              :style="'background: ' + (card.flipped ? card.color : '#999')"
              :disabled="flippedCards.length >= 2"
              class="w-full h-32"
              @click="flipCard(card)"
            ></button>
          </div>
        </template>
      </div>
    </div>
  `,
  state: {
    cards: [
      { color: 'green', flipped: false, cleared: false },
      { color: 'red', flipped: false, cleared: false },
      { color: 'blue', flipped: false, cleared: false },
      { color: 'yellow', flipped: false, cleared: false },
      { color: 'green', flipped: false, cleared: false },
      { color: 'red', flipped: false, cleared: false },
      { color: 'blue', flipped: false, cleared: false },
      { color: 'yellow', flipped: false, cleared: false },
    ].sort(() => Math.random() - .5),
  },
})
export class CardGame extends AlpineComponent<CardGameState> {
    pause(milliseconds = 1000): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }

    flash(message: string): void {
      window.dispatchEvent(new CustomEvent('flash', {
        detail: { message },
      }));
    }

    get flippedCards() {
      return this.state.cards.filter((card) => card.flipped);
    }

    get clearedCards() {
      return this.state.cards.filter((card) => card.cleared);
    }

    get remainingCards() {
      return this.state.cards.filter((card) => !card.cleared);
    }

    get points() {
      return this.clearedCards.length;
    }

    async flipCard(card: Card) {
      card.flipped = !card.flipped;

      if (this.flippedCards.length !== 2) return;

      if (this.hasMatch()) {
        this.flash('You found a match!');

        await this.pause();

        this.flippedCards.forEach((card) => card.cleared = true);

        if (!this.remainingCards.length) {
          alert('You Won!');
        }
      } else {
        await this.pause();
      }

      this.flippedCards.forEach((card) => card.flipped = false);
    }

    hasMatch() {
      const [cardA, cardB] = this.flippedCards;
      return cardA.color === cardB.color;
    }
}
