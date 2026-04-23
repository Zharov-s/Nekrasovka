const body = document.body;
const burgerButton = document.getElementById('burgerButton');
const siteMenu = document.getElementById('site-menu');
const menuCloseTriggers = document.querySelectorAll('[data-menu-close]');
const menuLinks = document.querySelectorAll('.menu-link');
const menuOpenButtons = document.querySelectorAll('[data-open-menu]');
const contactLink = document.getElementById('menu-contact-link');
const navigatorLinks = document.querySelectorAll('[data-navigator-link]');
const callbackOpenButtons = document.querySelectorAll('[data-open-callback]');
const callbackModal = document.querySelector('[data-callback-modal]');
const callbackBackdrop = document.querySelector('.callback-backdrop');
const callbackCloseTriggers = document.querySelectorAll('[data-callback-close]');
const callbackForm = document.querySelector('[data-callback-form]');
const callbackStatus = document.querySelector('[data-callback-status]');
const callbackPhoneInput = callbackForm?.querySelector('input[name="phone"]') || null;
let callbackActiveTrigger = null;

function openMenu(focusTarget) {
  body.classList.add('menu-open');
  burgerButton.setAttribute('aria-expanded', 'true');
  burgerButton.setAttribute('aria-label', 'Закрыть меню');
  siteMenu.setAttribute('aria-hidden', 'false');

  window.setTimeout(() => {
    if (focusTarget === 'contacts' && contactLink) {
      contactLink.focus();
      return;
    }

    if (menuLinks[0]) {
      menuLinks[0].focus();
    }
  }, 180);
}

function closeMenu() {
  body.classList.remove('menu-open');
  burgerButton.setAttribute('aria-expanded', 'false');
  burgerButton.setAttribute('aria-label', 'Открыть меню');
  siteMenu.setAttribute('aria-hidden', 'true');
  burgerButton.focus({ preventScroll: true });
}

function openCallbackModal(trigger) {
  if (!callbackModal || !callbackBackdrop) {
    return;
  }

  callbackActiveTrigger = trigger || null;
  callbackBackdrop.hidden = false;
  callbackModal.hidden = false;

  window.requestAnimationFrame(() => {
    body.classList.add('callback-open');
    callbackModal.setAttribute('aria-hidden', 'false');
    const firstInput = callbackForm?.querySelector('input[name="name"]');
    firstInput?.focus({ preventScroll: true });
  });
}

function closeCallbackModal() {
  if (!callbackModal || !callbackBackdrop) {
    return;
  }

  body.classList.remove('callback-open');
  callbackModal.setAttribute('aria-hidden', 'true');

  window.setTimeout(() => {
    callbackBackdrop.hidden = true;
    callbackModal.hidden = true;
  }, 320);

  callbackStatus?.classList.remove('is-success', 'is-error');
  if (callbackActiveTrigger instanceof HTMLElement) {
    callbackActiveTrigger.focus({ preventScroll: true });
  }
}

function formatPhoneInputValue(value) {
  const digits = value.replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  let normalized = digits;
  if (normalized.startsWith('8')) {
    normalized = `7${normalized.slice(1)}`;
  }
  if (!normalized.startsWith('7')) {
    normalized = `7${normalized}`;
  }

  const sliced = normalized.slice(0, 11);
  const country = sliced[0];
  const code = sliced.slice(1, 4);
  const first = sliced.slice(4, 7);
  const second = sliced.slice(7, 9);
  const third = sliced.slice(9, 11);

  let formatted = `+${country}`;
  if (code) {
    formatted += ` (${code}`;
  }
  if (code.length === 3) {
    formatted += ')';
  }
  if (first) {
    formatted += ` ${first}`;
  }
  if (second) {
    formatted += `-${second}`;
  }
  if (third) {
    formatted += `-${third}`;
  }

  return formatted;
}

function setCallbackStatus(message, state) {
  if (!callbackStatus) {
    return;
  }

  callbackStatus.textContent = message;
  callbackStatus.classList.remove('is-success', 'is-error');

  if (state) {
    callbackStatus.classList.add(state);
  }
}

function openCallbackMailFallback(formData) {
  const name = (formData.get('name') || '').toString().trim() || 'Без имени';
  const phone = (formData.get('phone') || '').toString().trim() || 'Не указан';
  const company = (formData.get('company') || '').toString().trim() || 'Не указана';
  const comment = (formData.get('comment') || '').toString().trim() || 'Без комментария';
  const bodyLines = [
    'Новая заявка на обратный звонок',
    '',
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    `Компания: ${company}`,
    `Комментарий: ${comment}`,
  ];
  const subject = encodeURIComponent('Новая заявка на обратный звонок — ABCentrum');
  const bodyText = encodeURIComponent(bodyLines.join('\n'));
  window.location.href = `mailto:s.zharov@abcentrum.ru?subject=${subject}&body=${bodyText}`;
}

burgerButton.addEventListener('click', () => {
  if (body.classList.contains('menu-open')) {
    closeMenu();
    return;
  }

  openMenu();
});

menuCloseTriggers.forEach((element) => {
  element.addEventListener('click', closeMenu);
});

menuLinks.forEach((link) => {
  link.addEventListener('click', () => {
    closeMenu();
  });
});

menuOpenButtons.forEach((button) => {
  button.addEventListener('click', () => {
    openMenu(button.dataset.openMenu || undefined);
  });
});

callbackOpenButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (body.classList.contains('menu-open')) {
      closeMenu();
    }

    // Закрываем панель избранного если открыта
    const _fp = document.getElementById('favPanel');
    const _fb = document.getElementById('favPanelBackdrop');
    if (_fp) { _fp.classList.remove('is-open'); _fp.setAttribute('aria-hidden','true'); }
    if (_fb) { _fb.classList.remove('is-open'); }
    openCallbackModal(button);
  });
});

callbackCloseTriggers.forEach((button) => {
  button.addEventListener('click', closeCallbackModal);
});

callbackPhoneInput?.addEventListener('input', () => {
  callbackPhoneInput.value = formatPhoneInputValue(callbackPhoneInput.value);
});

callbackForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(callbackForm);
  const phone = (formData.get('phone') || '').toString().trim();
  const submitButton = callbackForm.querySelector('button[type="submit"]');

  if (!phone || phone.replace(/\D/g, '').length < 11) {
    setCallbackStatus('Укажите корректный номер телефона, чтобы мы могли вам перезвонить.', 'is-error');
    callbackPhoneInput?.focus();
    return;
  }

  submitButton?.setAttribute('disabled', 'disabled');
  setCallbackStatus('Отправляем заявку...', null);

  try {
    const response = await fetch('https://formsubmit.co/ajax/s.zharov@abcentrum.ru', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.success === 'false') {
      throw new Error('send_failed');
    }

    callbackForm.reset();
    if (callbackPhoneInput) {
      callbackPhoneInput.value = '';
    }
    setCallbackStatus('Спасибо! Заявка отправлена, мы свяжемся с вами в ближайшее время.', 'is-success');

    window.setTimeout(() => {
      if (body.classList.contains('callback-open')) {
        closeCallbackModal();
      }
    }, 1800);
  } catch (error) {
    setCallbackStatus('Не удалось отправить автоматически. Откроем письмо, чтобы вы могли отправить заявку вручную.', 'is-error');
    window.setTimeout(() => {
      openCallbackMailFallback(formData);
    }, 240);
  } finally {
    submitButton?.removeAttribute('disabled');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && body.classList.contains('menu-open')) {
    closeMenu();
    return;
  }

  if (event.key === 'Escape' && body.classList.contains('callback-open')) {
    closeCallbackModal();
  }
});

const heroCounters = document.querySelectorAll('.hero [data-counter]');
const aboutCounters = document.querySelectorAll('.about .about-stat-value[data-counter]');
const aboutSection = document.querySelector('.about');
const aboutCarousel = document.querySelector('[data-about-carousel]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function formatCounterValue(counter, progress) {
  const counterType = counter.dataset.counterType || 'number';

  if (counterType === 'quarter-year') {
    const quarterTarget = Number(counter.dataset.counterQuarter || 0);
    const yearTarget = Number(counter.dataset.counterYear || 0);
    const quarterValue = Math.round(quarterTarget * progress);
    const yearValue = Math.round(yearTarget * progress);
    return `${quarterValue} кв ${yearValue}`;
  }

  const target = Number(counter.dataset.counterTarget || 0);
  const suffix = counter.dataset.counterSuffix || '';
  const value = Math.round(target * progress)
    .toLocaleString('ru-RU')
    .replace(/\u00A0/g, ' ');

  return `${value}${suffix}`;
}

function setCounterFinalValue(counter) {
  counter.textContent = formatCounterValue(counter, 1);
}

function animateCounters(counters) {
  if (!counters.length || counters[0].dataset.counterAnimated === 'true') {
    return;
  }

  if (prefersReducedMotion.matches) {
    counters.forEach((counter) => {
      setCounterFinalValue(counter);
      counter.dataset.counterAnimated = 'true';
    });
    return;
  }

  const duration = 1800;
  const startTime = performance.now();

  counters.forEach((counter) => {
    counter.dataset.counterAnimated = 'true';
    counter.textContent = formatCounterValue(counter, 0);
  });

  function tick(currentTime) {
    const elapsed = currentTime - startTime;
    const rawProgress = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - rawProgress, 3);

    counters.forEach((counter) => {
      counter.textContent = formatCounterValue(counter, easedProgress);
    });

    if (rawProgress < 1) {
      window.requestAnimationFrame(tick);
    }
  }

  window.requestAnimationFrame(tick);
}

function initAboutCounters() {
  if (!aboutSection || !aboutCounters.length) {
    return;
  }

  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    animateCounters(aboutCounters);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateCounters(aboutCounters);
        observer.disconnect();
      });
    },
    {
      threshold: 0.35,
    }
  );

  observer.observe(aboutSection);
}

function initAboutCarousel() {
  if (!aboutCarousel) {
    return;
  }

  const slides = (aboutCarousel.dataset.aboutCarouselImages || '')
    .split('|')
    .map((src) => src.trim())
    .filter(Boolean);
  const mediaButton = aboutCarousel.querySelector('.about-media');
  const arrowButton = aboutCarousel.querySelector('.about-carousel-arrow');
  const image = aboutCarousel.querySelector('img');
  const indexLabel = aboutCarousel.querySelector('.about-carousel-index');

  if (!mediaButton || !arrowButton || !image || !indexLabel || !slides.length) {
    return;
  }

  if (slides.length < 2) {
    arrowButton.hidden = true;
    indexLabel.hidden = true;
    return;
  }

  slides.forEach((src) => {
    const preload = new Image();
    preload.src = src;
  });

  let currentIndex = Math.max(slides.indexOf(image.getAttribute('src') || ''), 0);
  let switchTimeoutId = 0;

  function renderIndex() {
    const current = String(currentIndex + 1).padStart(2, '0');
    const total = String(slides.length).padStart(2, '0');
    indexLabel.textContent = `${current} / ${total}`;
  }

  function goToSlide(nextIndex) {
    currentIndex = (nextIndex + slides.length) % slides.length;

    window.clearTimeout(switchTimeoutId);
    image.classList.add('is-switching');

    switchTimeoutId = window.setTimeout(() => {
      image.src = slides[currentIndex];
      renderIndex();

      window.requestAnimationFrame(() => {
        image.classList.remove('is-switching');
      });
    }, prefersReducedMotion.matches ? 0 : 140);
  }

  function showNextSlide() {
    goToSlide(currentIndex + 1);
  }

  renderIndex();
  mediaButton.addEventListener('click', showNextSlide);
  arrowButton.addEventListener('click', showNextSlide);
}

function initNavigatorLinks() {
  if (!navigatorLinks.length) {
    return;
  }

  navigatorLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const naviUrl = link.dataset.naviUrl;
      const fallbackUrl = link.dataset.fallbackUrl || link.href;

      if (!naviUrl || !fallbackUrl) {
        return;
      }

      event.preventDefault();

      let didHidePage = false;
      const markHidden = () => {
        didHidePage = true;
      };

      document.addEventListener('visibilitychange', markHidden, { once: true });
      window.addEventListener('pagehide', markHidden, { once: true });
      window.location.href = naviUrl;

      window.setTimeout(() => {
        if (!didHidePage && document.visibilityState === 'visible') {
          window.location.assign(fallbackUrl);
        }
      }, 900);
    });
  });
}

window.addEventListener(
  'load',
  () => {
    animateCounters(heroCounters);
    initAboutCounters();
    initAboutCarousel();
    initNavigatorLinks();
  },
  { once: true }
);


(function initSpacesCatalogApp() {
  const catalogView = document.querySelector('[data-site-view="catalog"]');
  const detailView = document.querySelector('[data-site-view="detail"]');

  if (!catalogView || !detailView) {
    return;
  }

  const lots = [
    {
      id: 'nkr-whole-building',
      project: 'Некрасовка',
      format: 'ЦЕЛИКОМ ЗДАНИЕ',
      filterFormats: ['LIGHT INDUSTRIAL', 'АБК', 'Антресоль'],
      level: '1–2 этажи + антресоль',
      totalArea: 5507,
      ceilingHeight: '1 этаж 8,0 м · 2 этаж 6,2 м',
      secondarySpecLabel: 'Состав',
      secondarySpecValue: 'LIGHT INDUSTRIAL · АБК · Антресоль',
      characteristicSummary: '800 кВт / 6×9 м и 12×9 м',
      readiness: 'Q4 2027',
      image: 'assets/about-project.jpg',
      planImage: 'assets/exploded_view_transparent.webp',
      genplanImage: 'assets/exploded_view_transparent.webp',
      purchaseRate: 200000,
      purchaseDisplay: '200 000 ₽/м²',
      rentRate: 15500,
      rentDisplay: '15 500 ₽/м²/год',
    },
    {
      id: 'nkr-light-industrial-1',
      project: 'Некрасовка',
      format: 'LIGHT INDUSTRIAL',
      filterFormats: ['LIGHT INDUSTRIAL'],
      level: '1 этаж',
      totalArea: 2509.78,
      ceilingHeight: '8,0 м',
      secondarySpecLabel: 'Нагрузка на перекрытие',
      secondarySpecValue: '5,0 т/м²',
      characteristicSummary: '8,0 м / 5,0 т/м²',
      readiness: 'Q4 2027',
      image: 'assets/01.jpg',
      planImage: 'assets/layouts/1_floor_transparent.svg',
      genplanImage: 'assets/exploded_view_transparent.webp',
      purchaseRate: null,
      purchaseDisplay: '',
      rentRate: 18000,
      rentDisplay: '18 000 ₽/м²/год',
    },
    {
      id: 'nkr-light-industrial-2',
      project: 'Некрасовка',
      format: 'LIGHT INDUSTRIAL',
      filterFormats: ['LIGHT INDUSTRIAL'],
      level: '2 этаж',
      totalArea: 2571.35,
      ceilingHeight: '6,2 м',
      secondarySpecLabel: 'Нагрузка на перекрытие',
      secondarySpecValue: '1,5 т/м²',
      characteristicSummary: '6,2 м / 1,5 т/м²',
      readiness: 'Q4 2027',
      image: 'assets/03.jpg',
      planImage: 'assets/layouts/2_floor_transparent.svg',
      genplanImage: 'assets/exploded_view_transparent.webp',
      purchaseRate: null,
      purchaseDisplay: '',
      rentRate: 15000,
      rentDisplay: '15 000 ₽/м²/год',
    },
    {
      id: 'nkr-abk',
      project: 'Некрасовка',
      format: 'АБК',
      filterFormats: ['АБК'],
      level: '2 этаж / зона АБК',
      totalArea: 785.19,
      ceilingHeight: '6,2 м',
      secondarySpecLabel: 'Функция',
      secondarySpecValue: 'административно-бытовой комплекс',
      characteristicSummary: '785,19 м² / 6,2 м',
      readiness: 'Q4 2027',
      image: 'assets/03.jpg',
      planImage: 'assets/layouts/2_floor_transparent.svg',
      genplanImage: 'assets/exploded_view_transparent.webp',
      purchaseRate: null,
      purchaseDisplay: '',
      rentRate: 15000,
      rentDisplay: '15 000 ₽/м²/год',
    },
    {
      id: 'nkr-mezzanine',
      project: 'Некрасовка',
      format: 'Антресоль',
      filterFormats: ['Антресоль'],
      level: 'Антресоль',
      totalArea: 196.65,
      ceilingHeight: '4,0 м',
      secondarySpecLabel: 'Нагрузка на перекрытие',
      secondarySpecValue: '—',
      characteristicSummary: '4,0 м',
      readiness: 'Q4 2027',
      image: 'assets/04.jpg',
      planImage: 'assets/layouts/mezzanine_transparent.svg',
      genplanImage: 'assets/exploded_view_transparent.webp',
      purchaseRate: null,
      purchaseDisplay: '',
      rentRate: 16000,
      rentDisplay: '16 000 ₽/м²/год',
    },
  ];
  const FILTER_LIMITS = {
    min: Math.floor(Math.min(...lots.map((lot) => lot.totalArea))),
    max: Math.ceil(Math.max(...lots.map((lot) => lot.totalArea))),
  };
  const defaultFilters = {
    transaction: 'rent',
    areaMin: FILTER_LIMITS.min,
    areaMax: FILTER_LIMITS.max,
    format: '',
  };

  const state = {
    filters: { ...defaultFilters },
    currentLotId: lots[0].id,
    detailMedia: 'plan',
  };
  const availableFormats = ['LIGHT INDUSTRIAL', 'АБК', 'Антресоль'].filter((format) =>
    lots.some((lot) => lot.format === format)
  );
  const forms = Array.from(document.querySelectorAll('[data-search-form]'));
  const tableBody = document.querySelector('[data-lots-table]');
  const catalogResultsCopy = document.querySelector('[data-catalog-results-copy]');
  const catalogPriceHeading = document.querySelector('[data-catalog-price-heading]');
  const heroSubmitButton = document.querySelector('[data-search-form="hero"] [data-search-submit]');
  const catalogFiltersForm = document.querySelector('[data-search-form="catalog"]');
  const resetFiltersButton = document.querySelector('[data-catalog-reset]');
  const formatDropdowns = Array.from(document.querySelectorAll('[data-dropdown="format"]'));
  const detailPlanTabs = Array.from(document.querySelectorAll('[data-detail-media]'));
  const detailModeButtons = Array.from(document.querySelectorAll('[data-detail-transaction]'));
  const backToCatalogButtons = Array.from(document.querySelectorAll('[data-view-back-catalog]'));
  const favoriteButton = document.querySelector('.lot-detail__favorite');
  const headerFavoritesBtn = document.getElementById('headerFavoritesBtn');
  const headerFavoritesCount = document.getElementById('headerFavoritesCount');
  const favPanel = document.getElementById('favPanel');
  const favPanelBackdrop = document.getElementById('favPanelBackdrop');
  const favPanelClose = document.getElementById('favPanelClose');
  const favPanelBody = document.getElementById('favPanelBody');

  // ── Favorites (localStorage) ───────────────────────────────
  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('abcentrum_favorites') || '[]');
    } catch (_) {
      return [];
    }
  }

  function saveFavorites(ids) {
    try {
      localStorage.setItem('abcentrum_favorites', JSON.stringify(ids));
    } catch (_) {}
  }

  function isFavorite(lotId) {
    return getFavorites().includes(lotId);
  }

  function toggleFavorite(lotId) {
    const favs = getFavorites();
    const idx = favs.indexOf(lotId);
    if (idx === -1) {
      favs.push(lotId);
    } else {
      favs.splice(idx, 1);
    }
    saveFavorites(favs);
    syncFavoriteUI();
  }

  function openFavPanel() {
    favPanel?.classList.add('is-open');
    favPanelBackdrop?.classList.add('is-open');
    favPanel?.setAttribute('aria-hidden', 'false');
    renderFavPanel();
  }

  function closeFavPanel() {
    favPanel?.classList.remove('is-open');
    favPanelBackdrop?.classList.remove('is-open');
    favPanel?.setAttribute('aria-hidden', 'true');
  }

  function renderFavPanel() {
    if (!favPanelBody) return;
    const favIds = getFavorites();

    if (favIds.length === 0) {
      favPanelBody.innerHTML = `
        <div class="favpanel__empty">
          <div class="favpanel__empty-icon">♡</div>
          <p class="favpanel__empty-text">Нет избранных помещений</p>
        </div>`;
      return;
    }

    const favLots = favIds.map(id => lots.find(l => l.id === id)).filter(Boolean);
    const mode = state.filters.transaction;

    favPanelBody.innerHTML = `<ul class="favpanel__list">${favLots.map(lot => {
      const rawPrice = getDisplayPriceForMode(lot, mode);
      const price = rawPrice && rawPrice.trim() ? rawPrice : 'Цена по запросу';
      return `
        <li class="favpanel__item" data-favpanel-lot="${lot.id}">
          <div class="favpanel__item-info">
            <p class="favpanel__item-format">${lot.format}</p>
            <div class="favpanel__item-meta">
              <span class="favpanel__item-tag">${lot.project}</span>
              <span class="favpanel__item-tag">${formatArea(lot.totalArea)}</span>
              <span class="favpanel__item-tag">${lot.level}</span>
              <span class="favpanel__item-tag">Готовность: ${lot.readiness}</span>
            </div>
            <p class="favpanel__item-price">${price}</p>
          </div>
          <button class="favpanel__item-remove" type="button" data-favpanel-remove="${lot.id}" aria-label="Удалить из избранного">×</button>
        </li>`;
    }).join('')}</ul>`;

    // Row click → open lot detail
    favPanelBody.querySelectorAll('[data-favpanel-lot]').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('[data-favpanel-remove]')) return;
        const lotId = row.dataset.favpanelLot;
        closeFavPanel();
        state.currentLotId = lotId;
        window.location.hash = `lot/${lotId}`;
      });
    });

    // Remove button
    favPanelBody.querySelectorAll('[data-favpanel-remove]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(btn.dataset.favpanelRemove);
        renderFavPanel();
      });
    });
  }

  function syncFavoriteUI() {
    const favs = getFavorites();
    const count = favs.length;

    // Header count badge
    if (headerFavoritesCount) {
      headerFavoritesCount.textContent = String(count);
      headerFavoritesCount.hidden = count === 0;
    }
    if (headerFavoritesBtn) {
      headerFavoritesBtn.classList.toggle('has-favorites', count > 0);
    }

    // Detail heart button
    if (favoriteButton) {
      const currentFav = isFavorite(state.currentLotId);
      favoriteButton.setAttribute('aria-label', currentFav ? 'Убрать из избранного' : 'Добавить в избранное');
      const span = favoriteButton.querySelector('span[aria-hidden]');
      if (span) {
        span.textContent = currentFav ? '♥' : '♡';
      }
    }
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString('ru-RU').replace(/\u00A0/g, ' ');
  }

  function formatArea(value) {
    return `${formatNumber(value)} м²`;
  }

  function formatPrice(value, mode) {
    return `${formatNumber(value)} ₽${mode === 'rent' ? '/мес' : ''}`;
  }

  function getRateForMode(lot, mode) {
    return mode === 'rent' ? lot.rentRate : lot.purchaseRate;
  }

  function getDisplayPriceForMode(lot, mode) {
    return mode === 'rent' ? lot.rentDisplay : lot.purchaseDisplay;
  }

  function pluralizeLots(count) {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return 'помещение';
    }

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return 'помещения';
    }

    return 'помещений';
  }

  function clampRange(minValue, maxValue) {
    let nextMin = Number(minValue);
    let nextMax = Number(maxValue);

    if (!Number.isFinite(nextMin)) {
      nextMin = FILTER_LIMITS.min;
    }
    if (!Number.isFinite(nextMax)) {
      nextMax = FILTER_LIMITS.max;
    }

    nextMin = Math.max(FILTER_LIMITS.min, Math.min(nextMin, FILTER_LIMITS.max));
    nextMax = Math.max(FILTER_LIMITS.min, Math.min(nextMax, FILTER_LIMITS.max));

    if (nextMin > nextMax) {
      const previousMin = state.filters.areaMin;
      if (nextMin !== previousMin) {
        nextMax = nextMin;
      } else {
        nextMin = nextMax;
      }
    }

    return { areaMin: nextMin, areaMax: nextMax };
  }

  function isHeroFiltersDirty() {
    return (
      state.filters.transaction !== defaultFilters.transaction ||
      state.filters.areaMin !== defaultFilters.areaMin ||
      state.filters.areaMax !== defaultFilters.areaMax ||
      state.filters.format !== defaultFilters.format
    );
  }

  function isCatalogFiltersDirty() {
    return (
      state.filters.transaction !== defaultFilters.transaction ||
      state.filters.areaMin !== defaultFilters.areaMin ||
      state.filters.areaMax !== defaultFilters.areaMax ||
      state.filters.format !== defaultFilters.format
    );
  }

  function getFilteredLots() {
    const { transaction, areaMin, areaMax, format } = state.filters;

    return lots
      .filter((lot) => {
        if (lot.totalArea < areaMin || lot.totalArea > areaMax) {
          return false;
        }
        if (format && !(lot.filterFormats || []).includes(format)) {
          return false;
        }
        return true;
      })
      .sort((firstLot, secondLot) => {
        const firstRate = Number.isFinite(getRateForMode(firstLot, transaction))
          ? getRateForMode(firstLot, transaction)
          : Number.POSITIVE_INFINITY;
        const secondRate = Number.isFinite(getRateForMode(secondLot, transaction))
          ? getRateForMode(secondLot, transaction)
          : Number.POSITIVE_INFINITY;
        return firstRate - secondRate;
      });
  }

  function populateSelectOptions() {
    formatDropdowns.forEach((dropdown) => {
      const menu = dropdown.querySelector('[data-dropdown-menu]');
      const input = dropdown.querySelector('[data-filter-input="format"]');
      if (!menu || !input) {
        return;
      }

      menu.innerHTML = [
        `<button class="spaces-dropdown__option" type="button" role="option" data-dropdown-option="" aria-selected="false">Все форматы</button>`,
        ...availableFormats.map(
          (format) =>
            `<button class="spaces-dropdown__option" type="button" role="option" data-dropdown-option="${format}" aria-selected="false">${format}</button>`
        ),
      ].join('');
      input.value = state.filters.format;
    });
  }

  function closeDropdown(dropdown) {
    const trigger = dropdown?.querySelector('.spaces-dropdown__trigger');
    const menu = dropdown?.querySelector('[data-dropdown-menu]');
    if (!trigger || !menu) {
      return;
    }

    dropdown.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  }

  function closeAllDropdowns(exceptDropdown) {
    formatDropdowns.forEach((dropdown) => {
      if (dropdown !== exceptDropdown) {
        closeDropdown(dropdown);
      }
    });
  }

  function syncRangeBounds() {
    forms.forEach((form) => {
      form.querySelectorAll('[data-filter-input="areaMin"], [data-filter-input="areaMax"]').forEach((field) => {
        field.min = String(FILTER_LIMITS.min);
        field.max = String(FILTER_LIMITS.max);
      });

      form.querySelectorAll('[data-range-input="min"], [data-range-input="max"]').forEach((field) => {
        field.min = String(FILTER_LIMITS.min);
        field.max = String(FILTER_LIMITS.max);
      });
    });
  }

  function updateRangeVisual(control, minValue, maxValue) {
    const fill = control.querySelector('[data-range-fill]');
    const minRange = control.querySelector('[data-range-input="min"]');
    const maxRange = control.querySelector('[data-range-input="max"]');

    if (minRange) {
      minRange.value = String(minValue);
    }
    if (maxRange) {
      maxRange.value = String(maxValue);
    }

    if (!fill) {
      return;
    }

    const start = ((minValue - FILTER_LIMITS.min) / (FILTER_LIMITS.max - FILTER_LIMITS.min)) * 100;
    const end = ((maxValue - FILTER_LIMITS.min) / (FILTER_LIMITS.max - FILTER_LIMITS.min)) * 100;
    fill.style.left = `${start}%`;
    fill.style.width = `${Math.max(end - start, 0)}%`;
  }

  function syncForms() {
    forms.forEach((form) => {
      form.querySelectorAll('[data-transaction-button]').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.transaction === state.filters.transaction);
      });

      form.querySelectorAll('[data-filter-input="format"]').forEach((field) => {
        field.value = state.filters.format;
      });

      form.querySelectorAll('[data-filter-input="areaMin"]').forEach((field) => {
        field.value = String(state.filters.areaMin);
      });

      form.querySelectorAll('[data-filter-input="areaMax"]').forEach((field) => {
        field.value = String(state.filters.areaMax);
      });

      form.querySelectorAll('[data-range-control]').forEach((control) => {
        updateRangeVisual(control, state.filters.areaMin, state.filters.areaMax);
      });
    });

    formatDropdowns.forEach((dropdown) => {
      const input = dropdown.querySelector('[data-filter-input="format"]');
      const valueNode = dropdown.querySelector('[data-dropdown-value]');
      const options = dropdown.querySelectorAll('[data-dropdown-option]');
      const currentValue = input?.value || '';

      if (valueNode) {
        valueNode.textContent = currentValue || 'ФОРМАТ';
        valueNode.classList.toggle('is-placeholder', !currentValue);
      }

      options.forEach((option) => {
        const isSelected = option.dataset.dropdownOption === currentValue;
        option.classList.toggle('is-selected', isSelected);
        option.setAttribute('aria-selected', String(isSelected));
      });
    });

    detailModeButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.detailTransaction === state.filters.transaction);
    });

    detailPlanTabs.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.detailMedia === state.detailMedia);
    });

    const shouldShowReset = isCatalogFiltersDirty();
    if (catalogFiltersForm) {
      catalogFiltersForm.classList.toggle('has-reset', shouldShowReset);
    }
    if (resetFiltersButton) {
      resetFiltersButton.hidden = !shouldShowReset;
    }
  }

  function updateHeroSubmitLabel() {
    if (!heroSubmitButton) {
      return;
    }

    const filteredLots = getFilteredLots();
    const count = filteredLots.length;
    let label = 'ПОДОБРАТЬ ПОМЕЩЕНИЕ';

    if (isHeroFiltersDirty()) {
      if (count === 0) {
        label = 'НЕТ ПОМЕЩЕНИЙ';
      } else if (count === 1) {
        // Если фильтр даёт один лот — показываем его название
        label = filteredLots[0].format;
      } else {
        // Для режима покупки: показываем только лоты с ценой покупки
        const purchasable = filteredLots.filter((l) => l.purchaseRate);
        if (state.filters.transaction === 'purchase' && purchasable.length === 1) {
          label = purchasable[0].format;
        } else {
          label = `${count} ${pluralizeLots(count)}`;
        }
      }
    }

    heroSubmitButton.textContent = label;
    heroSubmitButton.classList.toggle('is-empty', count === 0 && isHeroFiltersDirty());
  }

  function renderCatalog() {
    const filteredLots = getFilteredLots();

    if (catalogPriceHeading) {
      catalogPriceHeading.textContent =
        state.filters.transaction === 'rent' ? 'СТАВКА АРЕНДЫ, ₽/М²/ГОД' : 'ЦЕНА ПРОДАЖИ, ₽/М²';
    }

    if (catalogResultsCopy) {
      const count = filteredLots.length;
      catalogResultsCopy.textContent =
        count > 0
          ? `НАЙДЕНО ${count} ${pluralizeLots(count)} ПО ВЫБРАННЫМ ПАРАМЕТРАМ`
          : 'ПО ВЫБРАННЫМ ПАРАМЕТРАМ ПОКА НЕТ ДОСТУПНЫХ ЛОТОВ';
    }

    if (!tableBody) {
      return;
    }

    if (!filteredLots.length) {
      tableBody.innerHTML = `
        <div class="lot-table__empty">
          <p class="lot-table__empty-title">Подходящих помещений не найдено</p>
          <p class="lot-table__empty-note">Измените диапазон площади или снимите часть фильтров — список сразу обновится.</p>
        </div>
      `;
      return;
    }

    tableBody.innerHTML = filteredLots
      .map((lot) => {
        const rawPrice = getDisplayPriceForMode(lot, state.filters.transaction);
        const price = rawPrice && rawPrice.trim() ? rawPrice : 'Цена по запросу';
        return `
          <button class="lot-table__row" type="button" data-lot-id="${lot.id}">
            <span class="lot-table__cell">
              <span class="lot-table__label">ПРЕДЛОЖЕНИЕ</span>
              <span class="lot-table__value">${lot.format}</span>
            </span>

            <span class="lot-table__cell">
              <span class="lot-table__label">УРОВЕНЬ</span>
              <span class="lot-table__value">${lot.level}</span>
            </span>

            <span class="lot-table__cell">
              <span class="lot-table__label">ОБЩАЯ ПЛОЩАДЬ</span>
              <span class="lot-table__value">${formatArea(lot.totalArea)}</span>
            </span>

            <span class="lot-table__cell">
              <span class="lot-table__label">ХАРАКТЕРИСТИКИ</span>
              <span class="lot-table__value">${lot.characteristicSummary}</span>
            </span>

            <span class="lot-table__cell lot-table__cell--status">
              <span class="lot-table__label">ГОТОВНОСТЬ</span>
              <span class="lot-badge">${lot.readiness}</span>
            </span>

            <span class="lot-table__cell">
              <span class="lot-table__label">${state.filters.transaction === 'rent' ? 'СТАВКА АРЕНДЫ' : 'ЦЕНА ПРОДАЖИ'}</span>
              <span class="lot-table__price">${price}</span>
            </span>
          </button>
        `;
      })
      .join('');
  }

  function renderDetail() {
    const lot = lots.find((item) => item.id === state.currentLotId) || lots[0];
    if (!lot) {
      return;
    }

    const detailFormat = document.querySelector('[data-lot-format]');
    const detailArea = document.querySelector('[data-lot-area]');
    const detailPrice = document.querySelector('[data-lot-price]');
    const detailPriceLabel = document.querySelector('[data-lot-price-label]');
    const detailPlanImage = document.querySelector('[data-lot-plan-image]');
    const detailMainImage = document.querySelector('[data-lot-main-image]');
    const detailProject = document.querySelector('[data-lot-project]');
    const detailLevel = document.querySelector('[data-lot-level]');
    const detailTotalArea = document.querySelector('[data-lot-total-area]');
    const detailCeilingHeight = document.querySelector('[data-lot-ceiling-height]');
    const detailSecondaryLabel = document.querySelector('[data-lot-secondary-label]');
    const detailSecondaryValue = document.querySelector('[data-lot-secondary-value]');
    const detailReadiness = document.querySelector('[data-lot-readiness]');

    if (detailFormat) {
      detailFormat.textContent = lot.format;
    }
    if (detailArea) {
      detailArea.textContent = formatArea(lot.totalArea);
    }
    if (detailPrice) {
      const rawDisplay = getDisplayPriceForMode(lot, state.filters.transaction);
      detailPrice.textContent = rawDisplay && rawDisplay.trim() ? rawDisplay : 'Цена по запросу';
    }
    if (detailPriceLabel) {
      detailPriceLabel.textContent =
        state.filters.transaction === 'rent' ? 'СТАВКА АРЕНДЫ БЕЗ НДС / М² / ГОД' : 'ЦЕНА ПРОДАЖИ БЕЗ НДС / М²';
    }
    if (detailPlanImage) {
      detailPlanImage.src = lot.planImage;
      detailPlanImage.alt = `Планировка уровня ${lot.level}`;
    }
    if (detailMainImage) {
      detailMainImage.src = lot.image;
      detailMainImage.alt = `Визуализация объекта ${lot.project}`;
    }
    if (detailProject) {
      detailProject.textContent = lot.project;
    }
    if (detailLevel) {
      detailLevel.textContent = lot.level;
    }
    if (detailTotalArea) {
      detailTotalArea.textContent = formatArea(lot.totalArea);
    }
    if (detailCeilingHeight) {
      detailCeilingHeight.textContent = lot.ceilingHeight;
    }
    if (detailSecondaryLabel) {
      detailSecondaryLabel.textContent = lot.secondarySpecLabel;
    }
    if (detailSecondaryValue) {
      detailSecondaryValue.textContent = lot.secondarySpecValue;
    }
    if (detailReadiness) {
      detailReadiness.textContent = lot.readiness;
    }

    // Sync favorite heart state for current lot
    syncFavoriteUI();
  }

  function showLandingView() {
    body.classList.remove('is-catalog-view', 'is-lot-view');
    catalogView.hidden = true;
    detailView.hidden = true;
  }

  function showCatalogView() {
    body.classList.add('is-catalog-view');
    body.classList.remove('is-lot-view');
    catalogView.hidden = false;
    detailView.hidden = true;
    syncForms();
    updateHeroSubmitLabel();
    renderCatalog();
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function showDetailView() {
    body.classList.add('is-lot-view');
    body.classList.remove('is-catalog-view');
    detailView.hidden = false;
    catalogView.hidden = true;
    syncForms();
    renderDetail();
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function applyRoute(isInitial) {
    const rawHash = window.location.hash.replace(/^#/, '');
    const decodedHash = decodeURIComponent(rawHash);

    if (decodedHash === 'catalog') {
      showCatalogView();
      return;
    }

    if (decodedHash.startsWith('lot/')) {
      const targetId = decodedHash.replace('lot/', '');
      if (lots.some((lot) => lot.id === targetId)) {
        state.currentLotId = targetId;
        showDetailView();
        return;
      }
      window.location.hash = 'catalog';
      return;
    }

    showLandingView();

    if (!decodedHash) {
      if (!isInitial) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const target = document.getElementById(decodedHash);
    if (target) {
      window.setTimeout(() => {
        target.scrollIntoView({ behavior: isInitial ? 'auto' : 'smooth', block: 'start' });
      }, 60);
    }
  }

  function updateFilters(patch) {
    state.filters = {
      ...state.filters,
      ...patch,
    };

    const { areaMin, areaMax } = clampRange(state.filters.areaMin, state.filters.areaMax);
    state.filters.areaMin = areaMin;
    state.filters.areaMax = areaMax;

    const filteredLots = getFilteredLots();
    if (!filteredLots.some((lot) => lot.id === state.currentLotId) && filteredLots[0]) {
      state.currentLotId = filteredLots[0].id;
    }

    syncForms();
    updateHeroSubmitLabel();

    if (body.classList.contains('is-catalog-view')) {
      renderCatalog();
    }

    if (body.classList.contains('is-lot-view')) {
      renderDetail();
    }
  }

  forms.forEach((form) => {
    form.querySelectorAll('[data-transaction-button]').forEach((button) => {
      button.addEventListener('click', () => {
        updateFilters({ transaction: button.dataset.transaction || defaultFilters.transaction });
      });
    });

    form.querySelectorAll('[data-filter-input="areaMin"]').forEach((field) => {
      const handler = () => {
        updateFilters({ areaMin: Number(field.value) });
      };
      field.addEventListener('input', handler);
      field.addEventListener('change', handler);
    });

    form.querySelectorAll('[data-filter-input="areaMax"]').forEach((field) => {
      const handler = () => {
        updateFilters({ areaMax: Number(field.value) });
      };
      field.addEventListener('input', handler);
      field.addEventListener('change', handler);
    });

    form.querySelectorAll('[data-range-input="min"]').forEach((field) => {
      field.addEventListener('input', () => {
        updateFilters({ areaMin: Number(field.value) });
      });
    });

    form.querySelectorAll('[data-range-input="max"]').forEach((field) => {
      field.addEventListener('input', () => {
        updateFilters({ areaMax: Number(field.value) });
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      window.location.hash = 'catalog';
    });
  });

  formatDropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.spaces-dropdown__trigger');
    const menu = dropdown.querySelector('[data-dropdown-menu]');
    const input = dropdown.querySelector('[data-filter-input="format"]');

    trigger?.addEventListener('click', () => {
      const isOpen = dropdown.classList.contains('is-open');
      closeAllDropdowns(dropdown);

      if (isOpen || !menu) {
        closeDropdown(dropdown);
        return;
      }

      dropdown.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      menu.hidden = false;
    });

    menu?.addEventListener('click', (event) => {
      const option = event.target.closest('[data-dropdown-option]');
      if (!option || !input) {
        return;
      }

      input.value = option.dataset.dropdownOption || '';
      updateFilters({ format: input.value });
      closeDropdown(dropdown);
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-dropdown="format"]')) {
      closeAllDropdowns();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
    }
  });

  detailModeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      updateFilters({ transaction: button.dataset.detailTransaction || defaultFilters.transaction });
    });
  });

  detailPlanTabs.forEach((button) => {
    button.addEventListener('click', () => {
      state.detailMedia = button.dataset.detailMedia || 'plan';
      syncForms();
      renderDetail();
    });
  });

  tableBody?.addEventListener('click', (event) => {
    const row = event.target.closest('[data-lot-id]');
    if (!row) {
      return;
    }

    state.currentLotId = row.dataset.lotId;
    window.location.hash = `lot/${state.currentLotId}`;
  });

  if (favoriteButton) {
    favoriteButton.addEventListener('click', () => {
      toggleFavorite(state.currentLotId);
    });
  }

  if (headerFavoritesBtn) {
    headerFavoritesBtn.addEventListener('click', () => {
      openFavPanel();
    });
  }

  favPanelClose?.addEventListener('click', closeFavPanel);
  favPanelBackdrop?.addEventListener('click', closeFavPanel);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && favPanel?.classList.contains('is-open')) {
      closeFavPanel();
    }
  });

  resetFiltersButton?.addEventListener('click', () => {
    state.filters = { ...defaultFilters };
    syncForms();
    updateHeroSubmitLabel();
    renderCatalog();
  });

  backToCatalogButtons.forEach((button) => {
    button.addEventListener('click', () => {
      window.location.hash = 'catalog';
    });
  });

  window.addEventListener('hashchange', () => applyRoute(false));

  populateSelectOptions();
  syncRangeBounds();
  syncForms();
  updateHeroSubmitLabel();
  renderCatalog();
  renderDetail();
  syncFavoriteUI();
  applyRoute(true);
})();
