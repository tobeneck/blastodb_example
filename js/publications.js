const DATA_URL = 'data/publications.json';
const FILTER_ALL = '__all';

const normalizeTag = (tag) => (tag || '').toString().trim().toLowerCase();

const formatAuthors = (authors) => {
  if (Array.isArray(authors)) {
    const cleaned = authors.map(a => (a || '').toString().trim()).filter(Boolean);
    return cleaned.length ? cleaned.join(', ') : 'To be added';
  }
  if (typeof authors === 'string') {
    const trimmed = authors.trim();
    return trimmed ? trimmed : 'To be added';
  }
  return 'To be added';
};

const buildTagOptions = (data) => {
  if (Array.isArray(data.tagOptions) && data.tagOptions.length) {
    return data.tagOptions.map(label => ({
      label,
      value: normalizeTag(label)
    }));
  }

  const tagSet = new Map();
  (data.publications || []).forEach((pub) => {
    (pub.tags || []).forEach((tag) => {
      const value = normalizeTag(tag);
      if (!value) return;
      if (!tagSet.has(value)) tagSet.set(value, tag);
    });
  });

  return Array.from(tagSet.entries()).map(([value, label]) => ({ label, value }));
};

const renderFilters = (filterEl, tagOptions, selectedTags, onToggle) => {
  filterEl.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = 'pub-filter-btn';
  allBtn.dataset.tag = FILTER_ALL;
  allBtn.textContent = 'All';
  allBtn.setAttribute('aria-pressed', selectedTags.size === 0 ? 'true' : 'false');
  allBtn.addEventListener('click', () => onToggle(FILTER_ALL));
  filterEl.appendChild(allBtn);

  tagOptions.forEach(({ label, value }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pub-filter-btn';
    btn.dataset.tag = value;
    btn.textContent = label;
    btn.setAttribute('aria-pressed', selectedTags.has(value) ? 'true' : 'false');
    if (selectedTags.has(value)) btn.classList.add('active');
    btn.addEventListener('click', () => onToggle(value));
    filterEl.appendChild(btn);
  });
};

const updateFilterButtonStates = (filterEl, selectedTags) => {
  filterEl.querySelectorAll('.pub-filter-btn').forEach((btn) => {
    const tag = btn.dataset.tag;
    const isAll = tag === FILTER_ALL;
    const isActive = isAll ? selectedTags.size === 0 : selectedTags.has(tag);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    btn.classList.toggle('active', isActive && !isAll);
  });
};

const renderPublications = (listEl, emptyEl, countEl, publications, selectedTags) => {
  const filtered = publications.filter((pub) => {
    if (selectedTags.size === 0) return true;
    return pub._tagsNormalized.some(tag => selectedTags.has(tag));
  });

  listEl.innerHTML = '';

  const fragment = document.createDocumentFragment();
  filtered.forEach((pub) => {
    const card = document.createElement('article');
    card.className = 'pub-card';

    const hasImage = Boolean(pub.image);
    if (!hasImage) card.classList.add('no-image');

    if (hasImage) {
      const imageWrap = document.createElement('div');
      imageWrap.className = 'pub-image';

      const img = document.createElement('img');
      img.src = pub.image;
      img.alt = pub.imageAlt || pub.title || 'Publication image';
      img.loading = 'lazy';

      imageWrap.appendChild(img);
      card.appendChild(imageWrap);
    }

    const content = document.createElement('div');
    content.className = 'pub-content';

    const title = document.createElement('h3');
    title.className = 'pub-title';
    title.textContent = pub.title || 'Untitled publication';
    content.appendChild(title);

    const metaParts = [];
    if (pub.venue) metaParts.push(pub.venue);
    if (pub.date) metaParts.push(pub.date);
    if (metaParts.length) {
      const meta = document.createElement('div');
      meta.className = 'pub-meta';
      meta.textContent = metaParts.join(' · ');
      content.appendChild(meta);
    }

    const authorsEl = document.createElement('div');
    authorsEl.className = 'pub-authors';
    authorsEl.textContent = `Authors: ${formatAuthors(pub.authors)}`;
    content.appendChild(authorsEl);

    const tags = (pub.tags || []).filter(Boolean);
    if (tags.length) {
      const tagsWrap = document.createElement('div');
      tagsWrap.className = 'pub-tags';

      tags.forEach((tag) => {
        const tagEl = document.createElement('span');
        tagEl.className = 'pub-tag';
        tagEl.textContent = tag;
        tagsWrap.appendChild(tagEl);
      });

      content.appendChild(tagsWrap);
    }

    if (pub.url) {
      const actions = document.createElement('div');
      actions.className = 'pub-actions';

      const link = document.createElement('a');
      link.className = 'pub-link';
      link.href = pub.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Read here';

      actions.appendChild(link);
      content.appendChild(actions);
    }

    card.appendChild(content);
    fragment.appendChild(card);
  });

  listEl.appendChild(fragment);

  if (emptyEl) {
    emptyEl.hidden = filtered.length > 0;
  }
  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${publications.length} publications`;
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('pub-list');
  const filterEl = document.getElementById('pub-filters');
  const emptyEl = document.getElementById('pub-empty');
  const countEl = document.getElementById('pub-count');

  if (!listEl || !filterEl) return;

  if (countEl) countEl.textContent = 'Loading publications…';

  try {
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const publications = (data.publications || []).map((pub) => ({
      ...pub,
      _tagsNormalized: (pub.tags || []).map(normalizeTag).filter(Boolean)
    }));

    const tagOptions = buildTagOptions(data);
    const selectedTags = new Set();

    const toggleTag = (tagValue) => {
      if (tagValue === FILTER_ALL) {
        selectedTags.clear();
      } else if (selectedTags.has(tagValue)) {
        selectedTags.delete(tagValue);
      } else {
        selectedTags.add(tagValue);
      }

      updateFilterButtonStates(filterEl, selectedTags);
      renderPublications(listEl, emptyEl, countEl, publications, selectedTags);
    };

    renderFilters(filterEl, tagOptions, selectedTags, toggleTag);
    renderPublications(listEl, emptyEl, countEl, publications, selectedTags);
  } catch (err) {
    if (countEl) countEl.textContent = '';
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent = 'Unable to load publications right now.';
    }
  }
});
