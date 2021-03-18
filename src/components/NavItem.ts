import { ViolComponent, Component } from '@viol/core';
import { RouterLink } from '@viol/router';

type NavItemProps = {
  path: string;
  caption: string;
};

@Component({
  template: `
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mr-1"
      x-text="props.caption"
    ></button>
  `,
})
export class NavItem extends ViolComponent<{}, NavItemProps> implements RouterLink {
  get routerLink() {
    return this.props.path;
  }
}
