export const COLORS = [
  'blue',
  'turquoise',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'purple',
  'toolbar',
];

export const ICONS = [
  'fingerprint',
  'briefcase',
  'dollar',
  'cart',
  'circle',
  'gift',
  'vacation',
  'food',
  'fruit',
  'pet',
  'tree',
  'chill',
  'fence',
];

const $colorSelector = document.querySelector('.container-action.action-create-edit .color-selector');
for (let color of COLORS) {
  let $colorButton = document.createElement('button');
  $colorButton.style.backgroundColor = color;

  $colorSelector.appendChild($colorButton);
}

const $iconSelector = document.querySelector('.container-action.action-create-edit .icon-selector');
for (let icon of ICONS) {
  let $icon = document.createElement('img');
  $icon.src = `resource://usercontext-content/${icon}.svg`;

  $iconSelector.appendChild($icon);
}
