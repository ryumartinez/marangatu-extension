import { html } from 'https://esm.sh/htm/preact/standalone';

export function SidebarItem({ item, isFavorite, baseUrl, currentUrl, onToggle, onNavigate }) {
    const fullUrl = baseUrl + item.url;
    const isSelected = fullUrl === currentUrl;

    return html`
    <li style="display:flex;justify-content:space-between;margin-bottom:8px;padding:4px 8px;border-radius:4px;background-color:${isSelected ? '#333' : 'transparent'};">
      <a
        href=${fullUrl}
        style="color:${isSelected ? '#fff' : '#9cf'};text-decoration:none;flex:1;font-weight:${isSelected ? 'bold' : 'normal'};cursor:${isSelected ? 'default' : 'pointer'};display:flex;align-items:center;"
        onClick=${e => {
            e.preventDefault();
            // Prevent navigation if the item is already selected
            if (!isSelected) {
                onNavigate(fullUrl);
            }
        }}
      >
        ${item.nombre}
      </a>
      <button
        /* Send the item.nombre to be saved, NOT the changing URL */
        onClick=${() => onToggle(item.nombre)}
        style="background:none;border:none;color:#ff0;cursor:pointer;font-size:16px;padding:0 0 0 8px;"
        title=${isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      >
        ${isFavorite ? '★' : '☆'}
      </button>
    </li>
  `;
}
