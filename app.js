(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    const UidGenerator = (function* (id = 0) {
        while (++id)
            yield (id + Math.random()).toString(36);
    })();
    const uid = () => UidGenerator.next().value;
    const createElement = (tagName, innerHTML) => {
        const element = document.createElement(tagName);
        element.innerHTML = innerHTML;
        return element;
    };
    const createFragment = (html) => {
        const template = createElement('template', html);
        return template.content;
    };

    const generateName = (component) => {
        return `${component.constructor.name}_${uid()}`;
    };
    const defineViolComponent = (name, component) => {
        if (window.ViolComponents.has(name)) {
            throw new Error(`[Viol] Error: component with name '${name}' already exists!`);
        }
        window.ViolComponents.set(name, component);
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
                if (Reflect.get(target, prop, receiver) === value) {
                    return true;
                }
                const success = Reflect.set(target, prop, value, receiver);
                if (success && component.$el instanceof HTMLElement && component.$el.__x !== undefined) {
                    component.$el.__x.updateElements(component.$el);
                }
                return success;
            },
        });
    };
    class ViolComponent {
        constructor(props, name) {
            this.name = name !== null && name !== void 0 ? name : generateName(this);
            this.selector = `[x-name="${this.name}"]`;
            defineViolComponent(this.name, this);
            this.props = props !== null && props !== void 0 ? props : {};
            this.state = createReactivity(this, Object.assign({}, this.state));
        }
    }

    class Processor {
    }

    class CSSProcessor extends Processor {
        constructor(strings, substitutes) {
            super();
            this.strings = strings;
            this.substitutes = substitutes;
        }
        process(args) {
            return this.strings.reduce((css, string, index) => {
                const sub = this.processSubstitute(this.substitutes[index - 1], args);
                return css + sub + string;
            });
        }
        processSubstitute(substitute, args) {
            if (typeof substitute === 'function') {
                substitute = substitute(args);
            }
            return substitute instanceof ViolComponent
                ? substitute.selector
                : String(substitute);
        }
    }

    const process = (subject, args) => {
        if (typeof subject === 'function') {
            subject = subject(args);
        }
        if (typeof subject === 'string') {
            return subject;
        }
        return subject.process(args);
    };
    const processTemplate = (template, args) => {
        const html = process(template, args);
        const fragment = createFragment(html);
        const root = fragment.firstElementChild;
        if (root !== null) {
            root.setAttribute('x-name', args.self.name);
            root.setAttribute('x-data', `ViolComponents.get('${args.self.name}')`);
        }
        return Array.from(fragment.children).reduce((markup, child) => {
            return markup + child.outerHTML;
        }, '');
    };
    const processStyles = (styles, args) => {
        if (styles === undefined) {
            return '';
        }
        return process(styles, args);
    };
    const processComponent = (component) => {
        const args = {
            props: component.props,
            state: component.state,
            self: component,
        };
        const html = processTemplate(component.template, args);
        const css = processStyles(component.styles, args);
        window.ViolStyles.push(css);
        return html;
    };

    class HTMLProcessor extends Processor {
        constructor(strings, substitutes) {
            super();
            this.strings = strings;
            this.substitutes = substitutes;
        }
        process(args) {
            return this.strings.reduce((html, string, index) => {
                const sub = this.processSubstitute(this.substitutes[index - 1], args);
                return html + sub + string;
            });
        }
        processSubstitute(substitute, args) {
            if (typeof substitute === 'function') {
                substitute = substitute(args);
            }
            return this.ensureArray(substitute).reduce((template, item) => {
                if (item instanceof ViolComponent) {
                    if (item === args.self) {
                        throw new Error('[Viol] Error: cannot reference component in its own template');
                    }
                    item.parent = args.self;
                    template += processComponent(item);
                }
                else if (item instanceof Processor) {
                    template += item.process(args);
                }
                else if (typeof item === 'function') {
                    template += this.processSubstitute(item, args);
                }
                else {
                    template += String(item);
                }
                return template;
            }, '');
        }
        ensureArray(substitute) {
            return Array.isArray(substitute) ? substitute : [substitute];
        }
    }

    function Component(def) {
        return (target) => {
            var _a;
            Object.defineProperties(target.prototype, {
                template: { value: def.template },
                styles: { value: def.styles },
                state: {
                    value: (_a = def.state) !== null && _a !== void 0 ? _a : {},
                    writable: true,
                },
            });
        };
    }
    const html = (strings, ...substitutes) => {
        return new HTMLProcessor([...strings], substitutes);
    };
    const css = (strings, ...substitutes) => {
        return new CSSProcessor([...strings], substitutes);
    };
    const getComponent = (name) => {
        var _a;
        return (_a = window.ViolComponents.get(name)) !== null && _a !== void 0 ? _a : null;
    };
    const createApp = (component, root, options) => {
        var _a;
        const alpine = (_a = window.deferLoadingAlpine) !== null && _a !== void 0 ? _a : ((cb) => cb());
        window.deferLoadingAlpine = (callback) => {
            alpine(callback);
            root.innerHTML = processComponent(component);
            const styleSheet = createElement('style', window.ViolStyles.join(''));
            document.head.appendChild(styleSheet);
            window.Alpine.onBeforeComponentInitialized((component) => {
                if (typeof component.$data.onInit === 'function') {
                    component.$data.onInit();
                }
            });
            window.Alpine.onComponentInitialized((component) => {
                if (typeof component.$data.onAfterInit === 'function') {
                    component.$data.onAfterInit();
                }
            });
        };
        if (Array.isArray(options === null || options === void 0 ? void 0 : options.with)) {
            for (const initializer of options.with) {
                initializer();
            }
        }
    };

    if (!('ViolComponents' in window)) {
        window.ViolComponents = new Map();
    }
    if (!('ViolStyles' in window)) {
        window.ViolStyles = [];
    }

    var Component_1 = Component;
    var ViolComponent_1 = ViolComponent;
    var createApp_1 = createApp;
    var css_1 = css;
    var getComponent_1 = getComponent;
    var html_1 = html;

    var lib$1 = /*#__PURE__*/Object.defineProperty({
    	Component: Component_1,
    	ViolComponent: ViolComponent_1,
    	createApp: createApp_1,
    	css: css_1,
    	getComponent: getComponent_1,
    	html: html_1
    }, '__esModule', {value: true});

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var lib = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, '__esModule', { value: true });



    var __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    exports.RouterOutlet = class RouterOutlet extends lib$1.ViolComponent {
        onInit() {
            this.props.router.onRouteChange((route) => {
                this.route = route;
            });
        }
        matchesRoute(route) {
            return this.route === route;
        }
        get route() {
            return this.state.currentRoute;
        }
        set route(route) {
            var _a, _b;
            (_b = (_a = this.props).onRouteChange) === null || _b === void 0 ? void 0 : _b.call(_a, route);
            this.state.currentRoute = route;
        }
    };
    exports.RouterOutlet = __decorate([
        lib$1.Component({
            template: ({ props }) => lib$1.html `
    <div>
      ${props.routes.map((route) => {
            var _a;
            return lib$1.html `
        <template x-if="matchesRoute('${route.path}')">
          ${(_a = route.component) !== null && _a !== void 0 ? _a : route.template}
        </template>
      `;
        })}
    <div>
  `,
            state: {
                currentRoute: '',
            },
        })
    ], exports.RouterOutlet);

    class Router {
    }

    const listeners = new Set();
    class SyntheticRouter extends Router {
        constructor() {
            super(...arguments);
            this.currentRoute = '';
        }
        onRouteChange(callback) {
            listeners.add(callback);
            return () => {
                listeners.delete(callback);
            };
        }
        changeRoute(route) {
            this.currentRoute = route;
            for (const listener of listeners) {
                listener(route);
            }
        }
    }
    const syntheticRouter = new SyntheticRouter();
    const useSyntheticRouter = () => {
        var _a;
        const alpine = (_a = window.deferLoadingAlpine) !== null && _a !== void 0 ? _a : ((cb) => cb());
        window.deferLoadingAlpine = (callback) => {
            alpine(callback);
            window.Alpine.onBeforeComponentInitialized((component) => {
                var _a, _b;
                const routerLink = (_a = component.$data.routerLink) !== null && _a !== void 0 ? _a : (_b = component.$el) === null || _b === void 0 ? void 0 : _b.getAttribute('x-router-link');
                if (routerLink !== null && component.$el !== undefined) {
                    component.$el.addEventListener('click', () => syntheticRouter.changeRoute(routerLink));
                }
            });
        };
    };

    exports.Router = Router;
    exports.syntheticRouter = syntheticRouter;
    exports.useSyntheticRouter = useSyntheticRouter;
    });

    let NavItem = class NavItem extends ViolComponent_1 {
        get routerLink() {
            return this.props.path;
        }
    };
    NavItem = __decorate([
        Component_1({
            template: `
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mr-1"
      x-text="props.caption"
    ></button>
  `,
        })
    ], NavItem);

    const nav = [
        { path: '', caption: 'Home' },
        { path: 'counter', caption: 'Counter' },
        { path: 'scopedCss', caption: 'Scoped CSS' },
        { path: 'memory', caption: 'Memory Game' },
        { path: 'tags', caption: 'Tags' },
    ];
    let Nav = class Nav extends ViolComponent_1 {
    };
    Nav = __decorate([
        Component_1({
            template: html_1 `
    <nav class="text-center">
      ${nav.map(({ path, caption }) => (new NavItem({ path, caption })))}
    </nav>
  `,
        })
    ], Nav);

    let SourceLink = class SourceLink extends ViolComponent_1 {
    };
    SourceLink = __decorate([
        Component_1({
            template: `
    <a
      :href="props.url"
      target="_blank"
      rel="noopener noreferrer"
      class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full"
    >
      Source
    </a>
  `,
            styles: ({ self }) => css_1 `
    ${self} {
      top: 5px;
      left: 5px;
      position: fixed;
    }
  `,
        })
    ], SourceLink);

    let CardGame = class CardGame extends ViolComponent_1 {
        pause(milliseconds = 1000) {
            return new Promise((resolve) => setTimeout(resolve, milliseconds));
        }
        flash(message) {
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
        flipCard(card) {
            return __awaiter(this, void 0, void 0, function* () {
                card.flipped = !card.flipped;
                if (this.flippedCards.length !== 2)
                    return;
                if (this.hasMatch()) {
                    this.flash('You found a match!');
                    yield this.pause();
                    this.flippedCards.forEach((card) => card.cleared = true);
                    if (!this.remainingCards.length) {
                        alert('You Won!');
                    }
                }
                else {
                    yield this.pause();
                }
                this.flippedCards.forEach((card) => card.flipped = false);
            });
        }
        hasMatch() {
            const [cardA, cardB] = this.flippedCards;
            return cardA.color === cardB.color;
        }
    };
    CardGame = __decorate([
        Component_1({
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
    ], CardGame);

    let FlashMessage = class FlashMessage extends ViolComponent_1 {
        onFlash($event) {
            this.state.message = $event.detail.message;
            this.state.show = true;
            setTimeout(() => this.state.show = false, 1000);
        }
    };
    FlashMessage = __decorate([
        Component_1({
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

    var MemoryApp_1;
    let MemoryApp = MemoryApp_1 = class MemoryApp extends ViolComponent_1 {
        onInit() {
            console.log('Init: Memory App');
        }
    };
    MemoryApp.SourceUrl = 'https://github.com/alpinejs/alpine/blob/master/examples/card-game.html';
    MemoryApp = MemoryApp_1 = __decorate([
        Component_1({
            template: html_1 `
    <div class="text-center py-16">
      ${new SourceLink({ url: MemoryApp_1.SourceUrl })}
      ${new CardGame()}
      ${new FlashMessage()}
    </div>
  `,
        })
    ], MemoryApp);

    let RenderedIn = class RenderedIn extends ViolComponent_1 {
    };
    RenderedIn = __decorate([
        Component_1({
            template: `
    <p class="text-sm text-gray-900 py-4">
      Rendered in: <strong x-text="props.name"></strong>
    </p>
  `,
        })
    ], RenderedIn);

    let Counter = class Counter extends ViolComponent_1 {
        onClick() {
            if (this.state.intervalId !== null) {
                this.stop();
                return;
            }
            else if (this.state.time === 0) {
                this.reset();
            }
            this.start();
        }
        start() {
            var _a;
            --this.state.time;
            this.state.intervalId = setInterval(() => {
                --this.state.time;
                if (this.state.time === 0) {
                    if (this.props.onDone !== undefined) {
                        this.props.onDone();
                    }
                    this.stop();
                }
            }, (_a = this.props.tickrate) !== null && _a !== void 0 ? _a : 1000);
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
    };
    Counter = __decorate([
        Component_1({
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
    ], Counter);

    let CounterApp = class CounterApp extends ViolComponent_1 {
        onInit() {
            console.log('Init: Counter App');
        }
        onAfterInit() {
            console.log('After Init: Counter App');
        }
        onDone(name) {
            return () => alert(`${name} -> done!`);
        }
    };
    CounterApp = __decorate([
        Component_1({
            template: ({ self }) => html_1 `
    <div class="text-center">
      ${new RenderedIn({ name: self.parent.name })}
      <div class="pb-4">
        <p class="text-lg font-bold text-gray-900 my-4">
          Counter (1s interval)
        </p>
        ${new Counter({ onDone: self.onDone('Counter 1') })}
      </div>
      <div>
        <p class="text-lg font-bold text-gray-900 my-4">
          Counter (.5s interval)
        </p>
        ${new Counter({ onDone: self.onDone('Counter 2'), tickrate: 500 })}
      </div>
    </div>
  `,
        })
    ], CounterApp);

    let ScopedCss = class ScopedCss extends ViolComponent_1 {
    };
    ScopedCss = __decorate([
        Component_1({
            template: ({ props }) => `
    <p class="text-lg font-bold">Look at me, I am ${props.color}!<p>
  `,
            styles: ({ self, props }) => css_1 `
    ${self} {
      color: ${props.color};
    }
  `,
        })
    ], ScopedCss);

    let ScopedCssApp = class ScopedCssApp extends ViolComponent_1 {
    };
    ScopedCssApp = __decorate([
        Component_1({
            template: html_1 `
    <div class="text-center">
      <p class="text-2xl font-bold text-gray-900 my-4">
        Inspect one of the paragraph's styles below! :)
      </p>
      ${new ScopedCss({ color: 'red' })}
      ${new ScopedCss({ color: 'blue' })}
    </div>
  `,
        })
    ], ScopedCssApp);

    var TagsApp_1;
    let TagsApp = TagsApp_1 = class TagsApp extends ViolComponent_1 {
        onInit() {
            console.log('Init: Tags App');
        }
        addTag() {
            if (this.newTag !== '') {
                this.state.tags.push(this.newTag);
                this.state.newTag = '';
            }
        }
        removeTag(tag) {
            this.state.tags = this.state.tags.filter((t) => t !== tag);
        }
        onBackspace() {
            if (this.newTag === '') {
                this.state.tags.pop();
            }
        }
        get newTag() {
            return this.state.newTag.trim();
        }
    };
    TagsApp.SourceUrl = 'https://github.com/alpinejs/alpine/blob/master/examples/tags.html';
    TagsApp = TagsApp_1 = __decorate([
        Component_1({
            template: html_1 `
    <div class="bg-grey-lighter px-8 py-16">
      ${new SourceLink({ url: TagsApp_1.SourceUrl })}
      <template x-for="tag in state.tags">
        <input type="hidden" :value="tag">
      </template>

      <div class="max-w-sm w-full mx-auto">
        <div class="tags-input">
          <template x-for="tag in state.tags" :key="tag">
            <span class="tags-input-tag">
              <span x-text="tag"></span>
              <button
                type="button"
                class="tags-input-remove"
                @click="removeTag(tag)"
              >
                &times;
              </button>
            </span>
          </template>

          <input
            class="tags-input-text"
            placeholder="Add tag..."
            @keydown.enter.prevent="addTag()"
            @keydown.backspace="onBackspace()"
            x-model="state.newTag"
          >
        </div>
      </div>
    </div>
  `,
            styles: `
    .tags-input {
      display: flex;
      flex-wrap: wrap;
      background-color: #fff;
      border-width: 1px;
      border-radius: .25rem;
      padding-left: .5rem;
      padding-right: 1rem;
      padding-top: .5rem;
      padding-bottom: .25rem;
    }

    .tags-input-tag {
      display: inline-flex;
      line-height: 1;
      align-items: center;
      font-size: .875rem;
      background-color: #bcdefa;
      color: #1c3d5a;
      border-radius: .25rem;
      user-select: none;
      padding: .25rem;
      margin-right: .5rem;
      margin-bottom: .25rem;
    }

    .tags-input-tag:last-of-type {
      margin-right: 0;
    }

    .tags-input-remove {
      color: #2779bd;
      font-size: 1.125rem;
      line-height: 1;
    }

    .tags-input-remove:first-child {
      margin-right: .25rem;
    }

    .tags-input-remove:last-child {
      margin-left: .25rem;
    }

    .tags-input-remove:focus {
      outline: 0;
    }

    .tags-input-text {
      flex: 1;
      outline: 0;
      padding-top: .25rem;
      padding-bottom: .25rem;
      margin-left: .5rem;
      margin-bottom: .25rem;
      min-width: 10rem;
    }
  `,
            state: {
                tags: ['hey'],
                newTag: '',
            },
        })
    ], TagsApp);

    const routes = [
        {
            path: '',
            template: `
      <p class="text-center text-3xl font-bold text-gray-900">
        Go ahead and click one of those examples above (:
      </p>
    `,
        },
        { path: 'counter', component: new CounterApp({}, 'CounterApp') },
        { path: 'scopedCss', component: new ScopedCssApp({}, 'ScopedCssApp') },
        { path: 'memory', component: new MemoryApp({}, 'MemoryApp') },
        { path: 'tags', component: new TagsApp({}, 'TagsApp') },
    ];
    let Router = class Router extends ViolComponent_1 {
        onRouteChange(route) {
            console.log('Route changed to:', route);
        }
    };
    Router = __decorate([
        Component_1({
            template: ({ self }) => html_1 `
    <main class="py-8">
      ${new lib.RouterOutlet({
            router: lib.syntheticRouter,
            routes,
            onRouteChange: self.onRouteChange,
        })}
    </main>
  `,
        })
    ], Router);

    let App = class App extends ViolComponent_1 {
    };
    App = __decorate([
        Component_1({
            template: html_1 `
    <div class="p-8">
      ${new Nav()}
      ${new Router()}
    </div>
  `,
            state: {
                route: '',
            },
        })
    ], App);
    createApp_1(new App({}, 'DemoApp'), document.getElementById('root'), {
        with: [lib.useSyntheticRouter],
    });

}());
