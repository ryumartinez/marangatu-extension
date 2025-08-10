// sidebar-item.js
import { html } from 'https://esm.sh/htm/preact/standalone';

export function SidebarItem({ item, isFavorite, baseUrl, onToggle, onNavigate }) {
    return html`
    <li style="display:flex;justify-content:space-between;margin-bottom:8px;">
      <a
        href=${baseUrl + item.url}
        style="color:#9cf;text-decoration:none;flex:1"
        onClick=${e => {
        e.preventDefault();
        onNavigate(baseUrl + item.url);
    }}
      >
        ${item.nombre}
      </a>
      <button
        onClick=${() => onToggle(baseUrl + item.url)}
        style="background:none;border:none;color:#ff0;cursor:pointer;font-size:16px;"
      >
        ${isFavorite ? '★' : '☆'}
      </button>
    </li>
  `;
}
