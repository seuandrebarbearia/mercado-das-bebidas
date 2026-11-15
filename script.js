"use strict";
/* CONFIGURAÇÃO CENTRAL: dados comerciais confirmados devem ser inseridos aqui.
 * WhatsApp: somente dígitos, com DDI + DDD + número real.
 * Logotipo e fotos reais: salve em assets/ e informe o caminho abaixo.
 * Identidade visual: variáveis no início de style.css. */
const SITE_CONFIG = Object.freeze({
  name: "Mercado das Bebidas",
  whatsapp: "5548992233863", // Telefone público confirmado no Google Maps em 15/11/2026.
  phoneDisplay: "(48) 99223-3863",
  address: "", // INSIRA O ENDEREÇO REAL CONFIRMADO.
  hours: "", // INSIRA OS HORÁRIOS REAIS. Use \n para separar linhas.
  mapsUrl: "https://maps.app.goo.gl/B8hvU9M4s6fxE9q47",
  whatsappMessage: "Olá! Gostaria de consultar as marcas e bebidas disponíveis.",
  logo: "", // Ex.: assets/logotipo.png; vazio mantém a assinatura provisória.
  photos: {
    facade: "assets/fachada-mercado.png", // Foto fornecida pelo usuário, com os controles do Maps removidos.
    interior: "" // Ex.: assets/interior.webp — foto REAL da loja.
  }
});
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const $ = (selector, root = document) => root.querySelector(selector);
$$('[data-company]').forEach(el => { el.textContent = SITE_CONFIG.name; });
if (SITE_CONFIG.name !== "Mercado das Bebidas") {
  $$('[data-brand]').forEach(el => { el.textContent = SITE_CONFIG.name; });
}
document.title = `${SITE_CONFIG.name} — Um mundo de possibilidades`;
$('#year').textContent = new Date().getFullYear();
$$('[data-maps]').forEach(link => { link.href = SITE_CONFIG.mapsUrl; });
if (SITE_CONFIG.address) $('[data-address]').textContent = SITE_CONFIG.address;
if (SITE_CONFIG.hours) $('[data-hours]').textContent = SITE_CONFIG.hours;
const phone = SITE_CONFIG.whatsapp.replace(/\D/g, '');
const hasWhatsApp = /^\d{10,15}$/.test(phone);
if (hasWhatsApp) {
  const phoneLink = document.createElement('a');
  phoneLink.href = `tel:+${phone}`;
  phoneLink.textContent = SITE_CONFIG.phoneDisplay || `+${phone}`;
  phoneLink.setAttribute('aria-label', `Ligar para ${phoneLink.textContent}`);
  $('[data-phone]').replaceChildren(phoneLink);
}
if (SITE_CONFIG.logo) {
  $$('[data-logo]').forEach(el => {
    const img = document.createElement('img');
    img.alt = SITE_CONFIG.name;
    img.width = 120; img.height = 48;
    img.addEventListener('load', () => { el.replaceChildren(img); el.classList.add('has-logo'); });
    img.src = SITE_CONFIG.logo;
  });
}
Object.entries(SITE_CONFIG.photos).forEach(([type, path]) => {
  if (!path) return;
  const img = document.createElement('img');
  img.alt = `${type === 'facade' ? 'Fachada' : 'Interior'} do ${SITE_CONFIG.name}`;
  img.decoding = 'async';
  // Pré-carrega somente ao se aproximar da seção, mantendo o espaço reservado em caso de erro.
  const figure = $(`[data-store="${type}"]`);
  img.addEventListener('load', () => figure.replaceChildren(img));
  if ('IntersectionObserver' in window) {
    const loader = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { img.src = path; loader.disconnect(); }
    }, { rootMargin: '250px' });
    loader.observe(figure);
  } else { img.src = path; }
});
if (SITE_CONFIG.photos.interior) $('.store-photos').classList.remove('facade-only');
const header = $('#cabecalho'), toggle = $('.menu-toggle'), nav = $('#main-nav');
function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  nav.classList.toggle('open', open);
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
$$('a', nav).forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', event => { if (!header.contains(event.target)) setMenu(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
});
header.addEventListener('focusout', event => { if (!header.contains(event.relatedTarget)) setMenu(false); });
window.matchMedia('(min-width: 801px)').addEventListener('change', () => setMenu(false));
function updateHeader() { header.classList.toggle('scrolled', window.scrollY > 20); }
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
const contactDialog = $('#contact-dialog');
$$('[data-whatsapp]').forEach(link => {
  if (hasWhatsApp) {
    link.href = `https://wa.me/${phone}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessage)}`;
    link.target = '_blank'; link.rel = 'noopener noreferrer';
  } else {
    link.title = 'WhatsApp ainda não configurado';
    link.addEventListener('click', event => {
      event.preventDefault(); contactDialog.showModal(); document.body.classList.add('modal-open');
    });
  }
});
$('.contact-close').addEventListener('click', () => contactDialog.close());
contactDialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
function insideDialog(event, dialog) {
  const r = dialog.getBoundingClientRect();
  return event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
}
contactDialog.addEventListener('click', e => { if (e.target === contactDialog && !insideDialog(e, contactDialog)) contactDialog.close(); });
const cards = $$('.gallery-card'), filters = $$('.filter'), grid = $('#gallery-grid');
function visibleCards() { return cards.filter(card => !card.hidden); }
filters.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  filters.forEach(filter => {
    filter.classList.toggle('active', filter === button);
    filter.setAttribute('aria-pressed', String(filter === button));
  });
  cards.forEach(card => {
    card.hidden = category !== 'todas' && card.dataset.category !== category;
    if (!card.hidden) card.classList.add('visible');
  });
  grid.classList.toggle('is-filtered', category !== 'todas');
  const count = visibleCards().length;
  $('#filter-status').textContent = `${count} ${count === 1 ? 'foto exibida' : 'fotos exibidas'}: ${button.textContent.trim()}.`;
}));
const lightbox = $('#lightbox'), lightboxImage = $('#lightbox-image');
let selectedIndex = 0, galleryItems = [], galleryOpener;
function showPhoto(index) {
  selectedIndex = (index + galleryItems.length) % galleryItems.length;
  const card = galleryItems[selectedIndex], image = $('img', card);
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  $('#lightbox-title').textContent = $('h3', card).textContent;
  $('#lightbox-caption').textContent = $('p, .inline-link', card).textContent;
  $('#lightbox-count').textContent = `${selectedIndex + 1} / ${galleryItems.length}`;
  $('.lightbox-prev').disabled = galleryItems.length < 2;
  $('.lightbox-next').disabled = galleryItems.length < 2;
}
$$('[data-gallery]').forEach(button => button.addEventListener('click', () => {
  galleryItems = visibleCards(); galleryOpener = button;
  showPhoto(galleryItems.indexOf(button.closest('.gallery-card')));
  lightbox.showModal(); document.body.classList.add('modal-open'); $('.lightbox-close').focus();
}));
$('.lightbox-prev').addEventListener('click', () => showPhoto(selectedIndex - 1));
$('.lightbox-next').addEventListener('click', () => showPhoto(selectedIndex + 1));
$('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(selectedIndex + (event.key === 'ArrowRight' ? 1 : -1)); }
});
lightbox.addEventListener('click', e => { if (e.target === lightbox && !insideDialog(e, lightbox)) lightbox.close(); });
lightbox.addEventListener('close', () => {
  document.body.classList.remove('modal-open'); lightboxImage.removeAttribute('src'); galleryOpener?.focus();
});
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !motion.matches) {
  document.body.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
  }, { threshold: 0.08 });
  $$('.reveal').forEach(element => observer.observe(element));
  motion.addEventListener('change', event => { if (event.matches) { document.body.classList.remove('motion-ready'); observer.disconnect(); } });
}
