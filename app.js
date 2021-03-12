(function () {
    'use strict';

    const UidGenerator = (function* (id = 0) {
        while (++id)
            yield (id + Math.random()).toString(36);
    })();
    const uid = () => UidGenerator.next().value;
    const createFragment = (html) => {
        const template = document.createElement('template');
        template.innerHTML = html;
        return template.content;
    };
    const has = (obj, prop) => {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    const generateName = (component) => {
        return `${component.constructor.name}_${uid()}`;
    };
    const defineAlpineComponent = (name, component) => {
        if (name in window.AlpineComponents) {
            throw new Error(`[Ayce] Error: component with name '${name}' already exists!`);
        }
        window.AlpineComponents[name] = component;
    };
    const createReactivity = (component, state) => {
        return new Proxy(state, {
            get: (target, prop, receiver) => {
                const value = Reflect.get(target, prop, receiver);
                if (typeof value === 'object' && value !== null) {
                    return createReactivity(component, value);
                }
                return value;
            },
            set: (target, prop, value, receiver) => {
                const success = Reflect.set(target, prop, value, receiver);
                if (success && component.$el instanceof HTMLElement && component.$el.__x !== undefined) {
                    component.$el.__x.updateElements(component.$el);
                }
                return success;
            },
        });
    };
    class AlpineComponent {
        constructor(props, name) {
            this.name = name ?? generateName(this);
            defineAlpineComponent(this.name, this);
            this.props = props ?? {};
            this.state = createReactivity(this, { ...this.state });
        }
        __getTemplate() {
            const html = typeof this.template === 'string'
                ? this.template
                : this.template({
                    props: this.props,
                    state: this.state,
                    self: this,
                });
            const fragment = createFragment(html);
            const root = fragment.firstElementChild;
            if (root !== null) {
                root.setAttribute('x-data', `AlpineComponents['${this.name}']`);
                if (has(this, 'onInit') && typeof this.onInit === 'function') {
                    let xInit = root.hasAttribute('x-init')
                        ? `${root.getAttribute('x-init')}; `
                        : '';
                    root.setAttribute('x-init', xInit + 'onInit()');
                }
            }
            return [...fragment.children].reduce((markup, child) => {
                return markup + child.outerHTML;
            }, '');
        }
    }

    function Component(def) {
        return (target) => {
            Object.defineProperties(target.prototype, {
                template: { value: def.template },
                state: { value: def.state ?? {}, writable: true },
            });
        };
    }
    const html = (strings, ...substitutes) => {
        return (args) => {
            return [...strings].reduce((html, string, index) => {
                let substitute = substitutes[index];
                if (typeof substitute === 'function') {
                    substitute = substitute(args);
                }
                if (substitute instanceof AlpineComponent) {
                    substitute.parent = args.self;
                    string += substitute.__getTemplate();
                }
                else {
                    string += String(substitute);
                }
                return html + string;
            }, '');
        };
    };
    const createApp = (component, root) => {
        const alpine = window.deferLoadingAlpine ?? ((cb) => cb());
        window.deferLoadingAlpine = (callback) => {
            alpine(callback);
            root.innerHTML = component.__getTemplate();
        };
    };

    if (!('AlpineComponents' in window)) {
        window.AlpineComponents = {};
    }

    var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    let RenderedIn = class RenderedIn extends AlpineComponent {
    };
    RenderedIn = __decorate$7([
        Component({
            template: `
    <p class="text-sm text-gray-900 py-4">
      Rendered in: <strong x-text="props.name"></strong>
    </p>
  `,
        })
    ], RenderedIn);

    var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    let CardGame = class CardGame extends AlpineComponent {
        pause(milliseconds = 1000) {
            return new Promise(resolve => setTimeout(resolve, milliseconds));
        }
        flash(message) {
            window.dispatchEvent(new CustomEvent('flash', {
                detail: { message },
            }));
        }
        get flippedCards() {
            return this.state.cards.filter(card => card.flipped);
        }
        get clearedCards() {
            return this.state.cards.filter(card => card.cleared);
        }
        get remainingCards() {
            return this.state.cards.filter(card => !card.cleared);
        }
        get points() {
            return this.clearedCards.length;
        }
        async flipCard(card) {
            card.flipped = !card.flipped;
            if (this.flippedCards.length !== 2)
                return;
            if (this.hasMatch()) {
                this.flash('You found a match!');
                await this.pause();
                this.flippedCards.forEach(card => card.cleared = true);
                if (!this.remainingCards.length) {
                    alert('You Won!');
                }
            }
            else {
                await this.pause();
            }
            this.flippedCards.forEach(card => card.flipped = false);
        }
        hasMatch() {
            return this.flippedCards[0]['color'] === this.flippedCards[1]['color'];
        }
    };
    CardGame = __decorate$6([
        Component({
            template: `
    <div class="px-10 flex items-center justify-center min-h-screen">
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
                  >
                  </button>
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
    ], CardGame);

    var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    let FlashMessage = class FlashMessage extends AlpineComponent {
        onFlash($event) {
            this.state.message = $event.detail.message;
            this.state.show = true;
            setTimeout(() => this.state.show = false, 1000);
        }
    };
    FlashMessage = __decorate$5([
        Component({
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
    ], FlashMessage);

    var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    let MemoryApp = class MemoryApp extends AlpineComponent {
        onInit() {
            console.log('Init: Memory App');
        }
    };
    MemoryApp = __decorate$4([
        Component({
            template: html `
    <div id="memory-app" class="text-center">
      ${({ self }) => new RenderedIn({ name: self.parent.name })}
      ${new CardGame()}
      ${new FlashMessage()}
    </div>
  `,
        })
    ], MemoryApp);

    var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    let Counter = class Counter extends AlpineComponent {
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
            this.reset();
        }
        reset() {
            this.state.time = 20;
        }
    };
    Counter = __decorate$3([
        Component({
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
        })
    ], Counter);

    var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    let CounterApp = class CounterApp extends AlpineComponent {
        onInit() {
            console.log('Init: Counter App');
        }
        onDone(name) {
            return () => alert(`${name} -> done!`);
        }
    };
    CounterApp = __decorate$2([
        Component({
            template: html `
    <div id="counter-app" class="text-center p-8">
      ${({ self }) => new RenderedIn({ name: self.parent.name })}
      <div class="pb-4">
        <label
          for="counter1"
          class="text-lg font-bold text-gray-900"
        >
          Counter (1s interval)
        </label>
        ${({ self }) => new Counter({
            id: 'counter1',
            onDone: self.onDone('Counter 1'),
        })}
      </div>
      <div class="pb-4">
        <label
          for="counter2"
          class="text-lg font-bold text-gray-900"
        >
          Counter (.5s interval)
        </label>
        ${({ self }) => new Counter({
            id: 'counter2',
            tickrate: 500,
            onDone: self.onDone('Counter 2'),
        })}
      </div>
    </div>
  `,
        })
    ], CounterApp);

    var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    let NavItem = class NavItem extends AlpineComponent {
    };
    NavItem = __decorate$1([
        Component({
            template: `
    <button
      @click="props.onClick()"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
      x-text="props.caption"
    ></button>
  `,
        })
    ], NavItem);

    var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    let App = class App extends AlpineComponent {
        onRouteChange(route) {
            return () => {
                console.log('Route changed to:', route);
                this.state.route = route;
            };
        }
    };
    App = __decorate([
        Component({
            template: html `
    <div id="app" class="p-8">
      <nav id="app-nav" class="text-center">
        ${({ self }) => new NavItem({
            onClick: self.onRouteChange(''),
            caption: 'Home',
        })}
        ${({ self }) => new NavItem({
            onClick: self.onRouteChange('counter'),
            caption: 'Counter Example',
        })}
        ${({ self }) => new NavItem({
            onClick: self.onRouteChange('memory'),
            caption: 'Memory Game Example',
        })}
      </nav>
      <p x-show="state.route === ''" class="text-center text-3xl font-bold text-gray-900 pt-16">
        Go ahead and click one of those examples above (:
      </p>
      <template x-if="state.route === 'counter'">
        ${new CounterApp({}, 'CounterApp')}
      </template>
      <template x-if="state.route === 'memory'">
        ${new MemoryApp({}, 'MemoryApp')}
      </template>
    </div>
  `,
            state: {
                route: '',
            },
        })
    ], App);
    createApp(new App({}, 'DemoApp'), document.getElementById('root'));

}());
