import { AyceComponent, Component } from "ayce";

export type NavItemProps = {
  onClick: Function;
  caption: string;
};

@Component({
  template: `
    <button
      @click="props.onClick()"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mr-1"
      x-text="props.caption"
    ></button>
  `,
})
export class NavItem extends AyceComponent<{}, NavItemProps> { }
