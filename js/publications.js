const DATA_URL = "data/publications.json";
const FILTER_ALL = "__all";

const normalizeTag = (tag) => (tag || "").toString().trim().toLowerCase();

const formatAuthors = (authors) => {
  if (Array.isArray(authors)) {
    const cleaned = authors
      .map((a) => (a || "").toString().trim())
      .filter(Boolean);
    return cleaned.length ? cleaned.join(", ") : "To be added";
  }
  if (typeof authors === "string") {
    const trimmed = authors.trim();
    return trimmed ? trimmed : "To be added";
  }
  return "To be added";
};

const buildTagOptions = (data) => {
  if (Array.isArray(data.tagOptions) && data.tagOptions.length) {
    return data.tagOptions.map((label) => ({
      label,
      value: normalizeTag(label),
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

  return Array.from(tagSet.entries()).map(([value, label]) => ({
    label,
    value,
  }));
};

const getToggleLabel = (tagOptions, selectedTags) => {
  if (selectedTags.size === 0) return "All tags";
  if (selectedTags.size === 1) {
    const value = Array.from(selectedTags)[0];
    const match = tagOptions.find((tag) => tag.value === value);
    return match ? match.label : "1 tag selected";
  }
  return `${selectedTags.size} tags selected`;
};

const createFilterOption = (label, value, checked, onChange) => {
  const option = document.createElement("label");
  option.className = "pub-filter-option";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = value;
  checkbox.checked = checked;
  checkbox.addEventListener("change", () => onChange(value, checkbox.checked));

  const text = document.createElement("span");
  text.textContent = label;

  option.appendChild(checkbox);
  option.appendChild(text);

  return option;
};

const setupDropdown = (dropdown, toggle, menu) => {
  const closeMenu = () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    const isOpen = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
};

const renderFilters = (filterEl, tagOptions, selectedTags, onChange) => {
  filterEl.innerHTML = "";

  const dropdown = document.createElement("div");
  dropdown.className = "pub-filter-dropdown";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.id = "pub-filter-toggle";
  toggle.className = "pub-filter-toggle";
  toggle.setAttribute("aria-haspopup", "true");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "pub-filter-menu");
  toggle.textContent = getToggleLabel(tagOptions, selectedTags);

  const menu = document.createElement("div");
  menu.className = "pub-filter-menu";
  menu.id = "pub-filter-menu";

  menu.appendChild(
    createFilterOption(
      "Show all",
      FILTER_ALL,
      selectedTags.size === 0,
      onChange,
    ),
  );

  tagOptions.forEach(({ label, value }) => {
    menu.appendChild(
      createFilterOption(label, value, selectedTags.has(value), onChange),
    );
  });

  dropdown.appendChild(toggle);
  dropdown.appendChild(menu);
  filterEl.appendChild(dropdown);

  setupDropdown(dropdown, toggle, menu);
};

const updateFilterUI = (filterEl, tagOptions, selectedTags) => {
  const toggle = filterEl.querySelector(".pub-filter-toggle");
  if (toggle) toggle.textContent = getToggleLabel(tagOptions, selectedTags);

  filterEl
    .querySelectorAll('.pub-filter-option input[type="checkbox"]')
    .forEach((checkbox) => {
      const value = checkbox.value;
      if (value === FILTER_ALL) {
        checkbox.checked = selectedTags.size === 0;
      } else {
        checkbox.checked = selectedTags.has(value);
      }
    });
};

const renderPublications = (
  listEl,
  emptyEl,
  countEl,
  publications,
  selectedTags,
) => {
  const filtered = publications.filter((pub) => {
    if (selectedTags.size === 0) return true;
    return pub._tagsNormalized.some((tag) => selectedTags.has(tag));
  });

  listEl.innerHTML = "";

  const fragment = document.createDocumentFragment();
  filtered.forEach((pub) => {
    const card = document.createElement("article");
    card.className = "news-card pub-card";

    const hasImage = Boolean(pub.image);
    if (!hasImage) card.classList.add("no-image");

    if (hasImage) {
      const imageWrap = document.createElement("div");
      imageWrap.className = "pub-image";

      const img = document.createElement("img");
      img.src = pub.image;
      img.alt = pub.imageAlt || pub.title || "Publication image";
      img.loading = "lazy";

      imageWrap.appendChild(img);
      card.appendChild(imageWrap);
    }

    const content = document.createElement("div");
    content.className = "pub-content";

    const title = document.createElement("h3");
    title.className = "pub-title";
    title.textContent = pub.title || "Untitled publication";
    content.appendChild(title);

    const metaParts = [];
    if (pub.venue) metaParts.push(pub.venue);
    if (pub.date) metaParts.push(pub.date);
    if (metaParts.length) {
      const meta = document.createElement("div");
      meta.className = "pub-meta";
      meta.textContent = metaParts.join(" · ");
      content.appendChild(meta);
    }

    const authorsEl = document.createElement("div");
    authorsEl.className = "pub-authors";
    authorsEl.textContent = `Authors: ${formatAuthors(pub.authors)}`;
    content.appendChild(authorsEl);

    const tags = (pub.tags || []).filter(Boolean);
    if (tags.length) {
      const tagsWrap = document.createElement("div");
      tagsWrap.className = "pub-tags";

      tags.forEach((tag) => {
        const tagEl = document.createElement("span");
        tagEl.className = "pub-tag";
        tagEl.textContent = "#" + tag;
        tagsWrap.appendChild(tagEl);
      });

      content.appendChild(tagsWrap);
    }

    if (pub.url) {
      const actions = document.createElement("div");
      actions.className = "pub-actions";

      const link = document.createElement("a");
      link.className = "read-more pub-link";
      link.href = pub.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Read here";

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

document.addEventListener("DOMContentLoaded", async () => {
  const listEl = document.getElementById("pub-list");
  const filterEl = document.getElementById("pub-filters");
  const emptyEl = document.getElementById("pub-empty");
  const countEl = document.getElementById("pub-count");

  if (!listEl || !filterEl) return;

  if (countEl) countEl.textContent = "Loading publications…";

  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const publications = (data.publications || []).map((pub) => ({
      ...pub,
      _tagsNormalized: (pub.tags || []).map(normalizeTag).filter(Boolean),
    }));

    const tagOptions = buildTagOptions(data);
    const selectedTags = new Set();

    const handleFilterChange = (tagValue, checked) => {
      if (tagValue === FILTER_ALL) {
        if (checked) selectedTags.clear();
      } else if (checked) {
        selectedTags.add(tagValue);
      } else {
        selectedTags.delete(tagValue);
      }

      updateFilterUI(filterEl, tagOptions, selectedTags);
      renderPublications(listEl, emptyEl, countEl, publications, selectedTags);
    };

    renderFilters(filterEl, tagOptions, selectedTags, handleFilterChange);
    renderPublications(listEl, emptyEl, countEl, publications, selectedTags);
  } catch (err) {
    if (countEl) countEl.textContent = "";
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent = "Unable to load publications right now.";
    }
  }
});
