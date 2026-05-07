const DATA_URL = "data/subtypes.json";
const FILTER_ALL = "__all";

const normalizeTag = (tag) => (tag || "").toString().trim().toLowerCase();

const resolveDataPath = (value) => {
  const trimmed = (value || "").toString().trim();
  if (!trimmed) return "";
  if (/^(?:[a-z]+:)?\/\//i.test(trimmed) || trimmed.startsWith("/")) {
    return trimmed;
  }
  if (trimmed.startsWith("data/")) return trimmed;
  return `data/${trimmed}`;
};

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const ensureUniqueId = (base, usedIds) => {
  let id = base || "subtype";
  let unique = id;
  let counter = 2;
  while (usedIds.has(unique)) {
    unique = `${id}-${counter}`;
    counter += 1;
  }
  usedIds.add(unique);
  return unique;
};

const buildTagOptions = (data) => {
  if (Array.isArray(data.tagOptions) && data.tagOptions.length) {
    return data.tagOptions
      .map((label) => (label || "").toString().trim())
      .filter(Boolean)
      .map((label) => ({
        label,
        value: normalizeTag(label),
      }));
  }

  const tagSet = new Map();
  (data.subtypes || []).forEach((subtype) => {
    (subtype.tags || []).forEach((tag) => {
      const cleaned = (tag || "").toString().trim();
      const value = normalizeTag(cleaned);
      if (!value) return;
      if (!tagSet.has(value)) tagSet.set(value, cleaned || value);
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

const renderFilters = (
  filterEl,
  tagOptions,
  selectedTags,
  onChange,
  idPrefix,
) => {
  filterEl.innerHTML = "";

  const dropdown = document.createElement("div");
  dropdown.className = "pub-filter-dropdown";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.id = `${idPrefix}-filter-toggle`;
  toggle.className = "pub-filter-toggle";
  toggle.setAttribute("aria-haspopup", "true");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", `${idPrefix}-filter-menu`);
  toggle.textContent = getToggleLabel(tagOptions, selectedTags);

  const menu = document.createElement("div");
  menu.className = "pub-filter-menu";
  menu.id = `${idPrefix}-filter-menu`;

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

const humanFileError = (err) => {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  return String(err);
};

const setupFastaDetails = (rootEl) => {
  if (!rootEl) return;
  rootEl.querySelectorAll("details.fasta-details").forEach((details) => {
    if (details.dataset.fastaBound === "true") return;
    details.dataset.fastaBound = "true";

    let loaded = false;

    details.addEventListener("toggle", async () => {
      if (!details.open || loaded) return;

      const src = details.getAttribute("data-fasta-src");
      const pre = details.querySelector("pre.fasta-pre");

      if (!src || !pre) return;

      pre.textContent = "Loading…";

      try {
        const res = await fetch(src, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${src}`);
        const text = await res.text();
        pre.textContent = text.trim() ? text : "(Empty FASTA file)";
        loaded = true;
      } catch (err) {
        pre.textContent = `Failed to load FASTA from ${src}\n${humanFileError(err)}`;
      }
    });
  });
};

const createTagList = (tags) => {
  const tagsWrap = document.createElement("div");
  tagsWrap.className = "pub-tags";

  tags.forEach((tag) => {
    const tagEl = document.createElement("span");
    tagEl.className = "pub-tag";
    tagEl.textContent = "#" + tag;
    tagsWrap.appendChild(tagEl);
  });

  return tagsWrap;
};

const createActionLink = (
  label,
  href,
  {
    variant = "outline",
    download = false,
    disabled = false,
    newTab = false,
  } = {},
) => {
  const link = document.createElement("a");
  link.className = ["btn", "btn-sm"]
    .concat(variant === "outline" ? ["btn-outline"] : [])
    .join(" ");
  link.textContent = label;

  if (disabled || !href) {
    link.classList.add("btn-disabled");
    link.href = "#";
    link.setAttribute("aria-disabled", "true");
    link.addEventListener("click", (event) => event.preventDefault());
    return link;
  }

  link.href = href;
  if (download) link.setAttribute("download", "");
  if (newTab) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  return link;
};

const createSubtypeCard = (subtype, index, usedIds) => {
  const titleText =
    (subtype.title || "").toString().trim() || `Subtype ${index + 1}`;
  const baseId = slugify(subtype.id || titleText) || `subtype-${index + 1}`;
  const cardId = ensureUniqueId(baseId, usedIds);
  const description = (subtype.description || "").toString().trim();
  const tags = Array.isArray(subtype.tags)
    ? subtype.tags.map((tag) => (tag || "").toString().trim()).filter(Boolean)
    : [];
  const imageSrc = (subtype.image || "").toString().trim();
  const imageAlt = (subtype.imageAlt || "").toString().trim();
  const imageCredit = (subtype.imageCredit || subtype.image_credit || "")
    .toString()
    .trim();
  const fastaHref = resolveDataPath(subtype.fasta);
  const cultureMicrobiomeHref = resolveDataPath(subtype.culture_microbiome);
  const cultureMetabolomeHref = resolveDataPath(subtype.culture_metabolome);

  const card = document.createElement("article");
  card.className = "subtype-card";
  card.id = cardId;

  const headder = document.createElement("div"); //displaying the title, tag, and download links
  headder.className = "subtype-card-headder"; //TODO: create styling that matches here!
  headder.setAttribute("role", "button");
  headder.setAttribute("tabindex", "0");
  headder.setAttribute("aria-expanded", "false");

  const title = document.createElement("h2");
  title.textContent = titleText;
  headder.appendChild(title);

  if (tags.length) {
    headder.appendChild(createTagList(tags));
  }

  const actions = document.createElement("div");
  actions.className = "subtype-actions";

  if (fastaHref) {
    actions.appendChild(
      createActionLink("Download FASTA", fastaHref, {
        variant: "solid",
        download: true,
      }),
    );
  }

  if (cultureMicrobiomeHref) {
    actions.appendChild(
      createActionLink("Download Culture microbiome", cultureMicrobiomeHref, {
        variant: "solid",
        download: true,
      }),
    );
  }

  if (cultureMicrobiomeHref) {
    actions.appendChild(
      createActionLink("Download Culture metabolome", cultureMetabolomeHref, {
        variant: "solid",
        download: true,
      }),
    );
  }

  headder.appendChild(actions);
  card.appendChild(headder);

  const body = document.createElement("div");
  body.className = "subtype-body";
  body.id = `${cardId}-body`;
  headder.setAttribute("aria-controls", body.id);

  if (imageSrc) {
    if (imageCredit) {
      const figure = document.createElement("figure");
      figure.className = "subtype-figure";
      figure.tabIndex = 0;

      const img = document.createElement("img");
      img.className = "subtype-img";
      img.src = imageSrc;
      img.alt = imageAlt || titleText || "Subtype image";
      img.loading = "lazy";

      const caption = document.createElement("figcaption");
      caption.className = "subtype-caption";
      caption.textContent = `Image credit: ${imageCredit}`;

      figure.appendChild(img);
      figure.appendChild(caption);
      body.appendChild(figure);
    } else {
      const img = document.createElement("img");
      img.className = "subtype-img";
      img.src = imageSrc;
      img.alt = imageAlt || titleText || "Subtype image";
      img.loading = "lazy";
      body.appendChild(img);
    }
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "subtype-img";
    placeholder.setAttribute("aria-hidden", "true");
    placeholder.style.minHeight = "140px";
    body.appendChild(placeholder);
  }

  const content = document.createElement("div");

  const descriptionEl = document.createElement("p");
  descriptionEl.textContent = description || "Description to be added.";
  content.appendChild(descriptionEl);

  body.appendChild(content);
  card.appendChild(body);

  const toggleCard = (nextState) => {
    const isOpen =
      typeof nextState === "boolean"
        ? nextState
        : !card.classList.contains("is-open");
    card.classList.toggle("is-open", isOpen);
    headder.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };

  headder.addEventListener("click", (event) => {
    if (event.target.closest(".subtype-actions a")) return;
    toggleCard();
  });

  headder.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleCard();
    }
  });

  return card;
};

const renderSubtypes = (listEl, emptyEl, countEl, subtypes, selectedTags) => {
  if (!listEl) return;

  const filtered = subtypes.filter((subtype) => {
    if (selectedTags.size === 0) return true;
    return subtype._tagsNormalized.some((tag) => selectedTags.has(tag));
  });

  listEl.innerHTML = "";

  const fragment = document.createDocumentFragment();
  const usedIds = new Set();

  filtered.forEach((subtype, index) => {
    const card = createSubtypeCard(subtype, index, usedIds);
    fragment.appendChild(card);
  });

  listEl.appendChild(fragment);

  if (emptyEl) {
    emptyEl.hidden = filtered.length > 0;
  }
  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${subtypes.length} subtypes`;
  }

  setupFastaDetails(listEl);
};

document.addEventListener("DOMContentLoaded", async () => {
  const listEl = document.getElementById("subtype-grid");
  const filterEl = document.getElementById("subtype-filters");
  const emptyEl = document.getElementById("subtype-empty");
  const countEl = document.getElementById("subtype-count");

  if (!listEl || !filterEl) return;

  if (countEl) countEl.textContent = "Loading subtypes…";

  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const subtypes = (data.subtypes || []).map((subtype) => ({
      ...subtype,
      _tagsNormalized: (subtype.tags || []).map(normalizeTag).filter(Boolean),
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
      renderSubtypes(listEl, emptyEl, countEl, subtypes, selectedTags);
    };

    renderFilters(
      filterEl,
      tagOptions,
      selectedTags,
      handleFilterChange,
      "subtype",
    );
    renderSubtypes(listEl, emptyEl, countEl, subtypes, selectedTags);
  } catch (err) {
    if (countEl) countEl.textContent = "";
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent = "Unable to load subtypes right now.";
    }
  }
});
