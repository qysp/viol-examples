import { AyceComponent, Component, html } from "ayce";
import { SourceLink } from "../components/SourceLink";

type TagsAppState = {
  tags: string[];
  newTag: string;
};

@Component<TagsApp>({
  template: html`
    <div class="bg-grey-lighter px-8 py-16">
      ${new SourceLink({ url: TagsApp.SourceUrl })}
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
export class TagsApp extends AyceComponent<TagsAppState> {
  static readonly SourceUrl = 'https://github.com/alpinejs/alpine/blob/master/examples/tags.html';

  onInit() {
    console.log('Init: Tags App');
  }

  addTag() {
    if (this.newTag !== '') {
      this.state.tags.push(this.newTag);
      this.state.newTag = '';
    }
  }

  removeTag(tag: string) {
    this.state.tags = this.state.tags.filter((t) => t !== tag)
  }

  onBackspace() {
    if (this.newTag === '') {
      this.state.tags.pop();
    }
  }

  get newTag() {
    return this.state.newTag.trim();
  }
}