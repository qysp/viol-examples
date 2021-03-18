import { ViolComponent, Component, html } from '@viol/core';
import { NavItem } from './NavItem';

const nav = [
  { path: '', caption: 'Home' },
  { path: 'counter', caption: 'Counter' },
  { path: 'scopedCss', caption: 'Scoped CSS' },
  { path: 'memory', caption: 'Memory Game' },
  { path: 'tags', caption: 'Tags' },
];


@Component({
  template: html`
    <nav class="text-center">
      ${nav.map(({ path, caption }) => (
        new NavItem({ path, caption })
      ))}
    </nav>
  `,
})
export class Nav extends ViolComponent { }
