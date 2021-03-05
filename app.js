(function () {
    'use strict';

    var Mod;
    (function (Mod) {
        Mod[Mod["Required"] = 0] = "Required";
        Mod[Mod["Default"] = 1] = "Default";
    })(Mod || (Mod = {}));

    const isValidProp = (propValue, propType) => {
        switch (propType) {
            case String:
                return typeof propValue === 'string';
            case Number:
                return typeof propValue === 'number';
            case Boolean:
                return typeof propValue === 'boolean';
            case Function:
                return typeof propValue === 'function';
            case Array:
                return Array.isArray(propValue);
            default:
                return false;
        }
    };
    const validateProps = (props, propTypes) => {
        const p = props ?? {};
        if (propTypes === undefined) {
            return p;
        }
        for (const [prop, propType] of Object.entries(propTypes)) {
            if (!Object.prototype.hasOwnProperty.call(p, prop)) {
                if (Array.isArray(propType)) {
                    const [, mod, defaultValue] = propType;
                    if (mod === Mod.Required) {
                        throw new TypeError(`Property '${prop}' is required and does not exist`);
                    }
                    if (mod === Mod.Default) {
                        p[prop] = defaultValue;
                    }
                }
            }
            else {
                const type = Array.isArray(propType) ? propType[0] : propType;
                const propValue = p[prop];
                if (!isValidProp(propValue, type)) {
                    throw new TypeError(`Expected property '${prop}' to be of type ${type.name}, got ${typeof propValue}`);
                }
            }
        }
        return p;
    };

    const UidGenerator = (function* (id = 0, suffix = Math.random()) {
        while (++id)
            yield (id + suffix).toString(36);
    })();
    const uid = () => UidGenerator.next().value;

    const generateName = (component) => {
        return `${component.constructor.name}_${uid()}`;
    };
    const defineAlpineComponent = (name, component) => {
        if (!Object.prototype.hasOwnProperty.call(window, 'AlpineComponents')) {
            window.AlpineComponents = {};
        }
        window.AlpineComponents[name] = component;
    };
    const createFragment = (html) => {
        const template = document.createElement('template');
        template.innerHTML = html;
        return template.content;
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
        constructor(props) {
            this.name = generateName(this);
            defineAlpineComponent(this.name, this);
            this.props = validateProps(props, this.propTypes);
            this.state = createReactivity(this, { ...this.state });
        }
        __getTemplate() {
            let html;
            if (typeof this.template === 'function') {
                html = this.template({
                    props: this.props,
                    state: this.state,
                    self: this,
                });
            }
            else {
                html = this.template;
            }
            const fragment = createFragment(html);
            fragment.firstElementChild?.setAttribute('x-data', `AlpineComponents['${this.name}']`);
            return [...fragment.children].reduce((markup, child) => {
                return markup + child.outerHTML;
            }, '');
        }
    }

    const required = (type) => [type, Mod.Required];
    const withDefault = (type, defaultValue) => [type, Mod.Default, defaultValue];
    function Component(def) {
        return (target) => {
            Object.defineProperties(target.prototype, {
                template: { value: def.template },
                state: { value: def.state ?? {}, writable: true },
                propTypes: { value: def.propTypes ?? {} },
            });
        };
    }
    const html = (strings, ...substitutes) => {
        return (options) => {
            return [...strings].reduce((html, string, index) => {
                const substitute = substitutes[index];
                if (substitute instanceof AlpineComponent) {
                    string += substitute.__getTemplate();
                }
                else if (typeof substitute === 'function') {
                    const component = substitute(options);
                    string += component.__getTemplate();
                }
                else {
                    string += substitute;
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

    var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
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
    CardGame = __decorate$5([
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

    var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
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
    FlashMessage = __decorate$4([
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

    var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    let MemoryApp = class MemoryApp extends AlpineComponent {
    };
    MemoryApp = __decorate$3([
        Component({
            template: html `
    <div id="memory-app">
      ${new CardGame()}
      ${new FlashMessage()}
    </div>
  `,
        })
    ], MemoryApp);

    var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
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
            }, this.props.tickrate);
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
    Counter = __decorate$2([
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
            propTypes: {
                id: required(String),
                tickrate: withDefault(Number, 1000),
                onDone: Function,
            },
        })
    ], Counter);

    var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    let CounterApp = class CounterApp extends AlpineComponent {
        onDone(name) {
            return () => alert(`${name} -> done!`);
        }
    };
    CounterApp = __decorate$1([
        Component({
            template: html `
    <div id="counter-app" class="text-center p-8">
      <h1 class="text-3xl font-bold text-gray-900">Counters</h1>
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

    var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    const navButtonClass = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full';
    let App = class App extends AlpineComponent {
    };
    App = __decorate([
        Component({
            template: html `
    <div id="app" class="p-8">
      <nav id="app-nav" class="text-center">
        <button @click="state.route = ''" class="${navButtonClass}">Home</button>
        <button @click="state.route = 'counter'" class="${navButtonClass}">Counter Example</button>
        <button @click="state.route = 'memory'" class="${navButtonClass}">Memory Game Example</button>
      </nav>
      <p x-show="state.route === ''" class="text-center text-3xl font-bold text-gray-900 pt-16">
        Go ahead and click one of those examples above (:
      </p>
      <template x-if="state.route === 'counter'">
        ${new CounterApp()}
      </template>
      <template x-if="state.route === 'memory'">
        ${new MemoryApp()}
      </template>
    </div>
  `,
            state: {
                route: '',
            },
        })
    ], App);
    createApp(new App(), document.getElementById('root'));

}());
