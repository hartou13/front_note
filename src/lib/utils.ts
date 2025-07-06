import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convertit le HTML en texte brut en supprimant les balises HTML
 * @param html - Le contenu HTML à convertir
 * @returns Le texte brut sans balises HTML
 */
export function htmlToText(html: string): string {
  if (!html) return '';
  
  // Version côté serveur (SSR) - utiliser une regex simple
  if (typeof document === 'undefined') {
    return html
      .replace(/<[^>]*>/g, '') // Supprimer toutes les balises HTML
      .replace(/&nbsp;/g, ' ') // Remplacer &nbsp; par un espace
      .replace(/&amp;/g, '&') // Remplacer &amp; par &
      .replace(/&lt;/g, '<') // Remplacer &lt; par <
      .replace(/&gt;/g, '>') // Remplacer &gt; par >
      .replace(/&quot;/g, '"') // Remplacer &quot; par "
      .replace(/&#39;/g, "'") // Remplacer &#39; par '
      .trim();
  }
  
  // Version côté client - utiliser le DOM
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

/**
 * Tronque le texte en supprimant les balises HTML et en limitant la longueur
 * @param html - Le contenu HTML à tronquer
 * @param maxLength - Longueur maximale (défaut: 100)
 * @returns Le texte tronqué sans balises HTML
 */
export function truncateHtmlContent(html: string, maxLength: number = 100): string {
  const text = htmlToText(html);
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
