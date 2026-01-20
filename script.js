// Collapsible course sections
document.addEventListener('DOMContentLoaded', function () {
  // Toggle collapsible sections
  document.querySelectorAll('.collapsible-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = btn.getAttribute('aria-controls');
      const target = document.getElementById(targetId);

      // If the target doesn't exist, fall back to the old behaviour (parent section)
      const section = target || btn.parentElement;

      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
      btn.textContent = expanded ? '▶' : '▼';

      // If target exists, toggle its display; otherwise toggle a class on the parent
      if (target) {
        target.style.display = expanded ? 'none' : '';
      } else {
        section.classList.toggle('collapsed', expanded);
      }
    });
  });

  // Site search (filters topics and resources)
  const searchInput = document.getElementById("siteSearch");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();

      document.querySelectorAll("section.topic").forEach((section) => {
        const title = (section.getAttribute("data-topic-name") || section.querySelector("h3")?.textContent || "").toLowerCase();
        const resourcesText = Array.from(section.querySelectorAll("a")).map(a => a.textContent.toLowerCase()).join(" ");

        const match = query === "" || title.includes(query) || resourcesText.includes(query);

        section.style.display = match ? "" : "none";
      });
    });
  }

  // Smooth scrolling for TOC links
  document.querySelectorAll('.toc a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.focus && target.focus();
        }
      }
    });
  });

  // Featured resource (random)
  const resources = document.querySelectorAll('.resources li a');
  if (resources.length > 0) {
    const randomIndex = Math.floor(Math.random() * resources.length);
    const featured = document.createElement('div');

    featured.className = 'featured-resource';
    featured.innerHTML = `Featured Resource: <a href="${resources[randomIndex].href}" target="_blank">${resources[randomIndex].textContent}</a>`;

    const container = document.querySelector('#coursesContainer');
    container.prepend(featured);
  }

  // Back-to-top button
  const backBtn = document.getElementById('backToTop');
  if (backBtn) {
    backBtn.style.display = 'none';
    window.addEventListener('scroll', () => {
      backBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
});

const themeToggle = document.getElementById("themeToggle");
const themeToggleLabel = document.getElementById("themeToggleLabel");
const savedTheme = localStorage.getItem("bemoresmart-theme");
const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("bemoresmart-theme", theme);

  // Update button label
  if (themeToggleLabel) {
    themeToggleLabel.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  } else if (themeToggle) {
    themeToggle.textContent = theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode";
  }
}

// apply saved theme, otherwise system preference
if (savedTheme) {
  applyTheme(savedTheme);
} else {
  applyTheme(prefersDark ? "dark" : "light");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });
}

// ---------------------------
// Random article button
// ---------------------------
const randomArticleBtn = document.getElementById("randomArticle");

function getAllTopics() {
  return Array.from(document.querySelectorAll("section.topic"));
}

function scrollToTopic(topicEl) {
  topicEl.scrollIntoView({ behavior: "smooth", block: "start" });
  topicEl.classList.add("highlight");
  setTimeout(() => topicEl.classList.remove("highlight"), 1500);
}

randomArticleBtn.addEventListener("click", () => {
  const topics = getAllTopics();
  const random = topics[Math.floor(Math.random() * topics.length)];
  if (random) scrollToTopic(random);
});

// ---------------------------
// Search + filters (works together)
// ---------------------------

const searchInput = document.getElementById("siteSearch") || document.getElementById("search");
const filterCourse = document.getElementById("filterCourse");
const filterType = document.getElementById("filterType");

function populateCourseFilter() {
  if (!filterCourse) return;

  // avoid duplicates if this runs twice
  filterCourse.innerHTML = `<option value="all">All Courses</option>`;

  document.querySelectorAll("article.course").forEach(course => {
    const name = course.getAttribute("data-course-name");
    if (!name) return;
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    filterCourse.appendChild(option);
  });
}

function applySearchAndFilters() {
  const query = (searchInput?.value || "").trim().toLowerCase();
  const courseFilter = filterCourse?.value || "all";
  const typeFilter = filterType?.value || "all";

  document.querySelectorAll("article.course").forEach(course => {
    const courseName = course.getAttribute("data-course-name") || "";
    const courseMatches = courseFilter === "all" || courseName === courseFilter;

    let courseHasVisibleTopic = false;

    course.querySelectorAll("section.topic").forEach(topic => {
      const title = (topic.getAttribute("data-topic-name") || topic.querySelector("h3")?.textContent || "").toLowerCase();
      const resourcesText = Array.from(topic.querySelectorAll("a")).map(a => a.textContent.toLowerCase()).join(" ");
      const topicMatchesQuery = query === "" || title.includes(query) || resourcesText.includes(query);

      // filter by type
      let hasVisibleResource = false;
      topic.querySelectorAll("li").forEach(li => {
        const badge = li.querySelector(".resource-badge");
        const type = badge?.textContent?.trim() || "";
        const matchesType = typeFilter === "all" || type === typeFilter;

        li.style.display = matchesType ? "" : "none";
        if (matchesType) hasVisibleResource = true;
      });

      const topicVisible = courseMatches && topicMatchesQuery && hasVisibleResource;
      topic.style.display = topicVisible ? "" : "none";

      if (topicVisible) courseHasVisibleTopic = true;
    });

    course.style.display = courseHasVisibleTopic ? "" : "none";
  });
}

if (searchInput) searchInput.addEventListener("input", applySearchAndFilters);
if (filterCourse) filterCourse.addEventListener("change", applySearchAndFilters);
if (filterType) filterType.addEventListener("change", applySearchAndFilters);

populateCourseFilter();
applySearchAndFilters();

// ---------------------------
// Bookmarks (Save Your Progress)
// ---------------------------

const BOOKMARK_KEY = "bemoresmart-bookmarks";
const RESOURCE_KEY = "bemoresmart-resource-bookmarks";

function getBookmarks() {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveBookmarks(list) {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
}

function getResourceBookmarks() {
  try {
    const raw = localStorage.getItem(RESOURCE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveResourceBookmarks(list) {
  localStorage.setItem(RESOURCE_KEY, JSON.stringify(list));
}

function isBookmarked(topicId) {
  return getBookmarks().includes(topicId);
}

function isResourceBookmarked(resourceId) {
  return getResourceBookmarks().includes(resourceId);
}

function toggleBookmark(topicEl) {
  const topicId = topicEl.getAttribute("data-topic-id");
  if (!topicId) return;

  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(topicId);

  if (idx === -1) bookmarks.push(topicId);
  else bookmarks.splice(idx, 1);

  saveBookmarks(bookmarks);
  renderBookmarks();
  updateBookmarkButton(topicEl);
}

function toggleResourceBookmark(resourceEl) {
  const resourceId = resourceEl.getAttribute("data-resource-id");
  if (!resourceId) return;

  const bookmarks = getResourceBookmarks();
  const idx = bookmarks.indexOf(resourceId);

  if (idx === -1) bookmarks.push(resourceId);
  else bookmarks.splice(idx, 1);

  saveResourceBookmarks(bookmarks);
  renderBookmarks();
  updateResourceBookmarkButton(resourceEl);
}

function updateBookmarkButton(topicEl) {
  const topicId = topicEl.getAttribute("data-topic-id");
  const btn = topicEl.querySelector(".bookmark-btn");
  if (!btn || !topicId) return;

  const bookmarked = isBookmarked(topicId);
  btn.textContent = bookmarked ? "★ Bookmarked" : "☆ Bookmark";
  btn.setAttribute("aria-pressed", bookmarked ? "true" : "false");
}

function updateResourceBookmarkButton(resourceEl) {
  const resourceId = resourceEl.getAttribute("data-resource-id");
  const btn = resourceEl.querySelector(".resource-bookmark-btn");
  if (!btn || !resourceId) return;

  const bookmarked = isResourceBookmarked(resourceId);
  btn.textContent = bookmarked ? "★ Saved" : "☆ Save";
  btn.setAttribute("aria-pressed", bookmarked ? "true" : "false");
}

function renderBookmarks() {
  const container = document.getElementById("bookmarkPanel");
  if (!container) return;

  container.innerHTML = "";

  const heading = document.createElement("h3");
  heading.textContent = "Bookmarks";
  container.appendChild(heading);

  const topicBookmarks = getBookmarks();
  const resourceBookmarks = getResourceBookmarks();

  if (topicBookmarks.length === 0 && resourceBookmarks.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No bookmarks yet. Click ☆ Bookmark or ☆ Save to save something.";
    container.appendChild(empty);
    return;
  }

  if (topicBookmarks.length > 0) {
    const tHeading = document.createElement("h4");
    tHeading.textContent = "Saved Topics";
    container.appendChild(tHeading);

    const tList = document.createElement("ul");
    tList.className = "bookmark-list";

    topicBookmarks.forEach((topicId) => {
      const topicEl = document.querySelector(`section.topic[data-topic-id="${topicId}"]`);
      if (!topicEl) return;

      const title = topicEl.getAttribute("data-topic-name") || topicEl.querySelector("h3")?.textContent || "Topic";

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${topicEl.id}`;
      a.textContent = title;

      a.addEventListener("click", (e) => {
        e.preventDefault();
        topicEl.scrollIntoView({ behavior: "smooth", block: "start" });
        topicEl.classList.add("highlight");
        setTimeout(() => topicEl.classList.remove("highlight"), 1500);
      });

      const removeBtn = document.createElement("button");
      removeBtn.className = "bookmark-remove";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        const updated = getBookmarks().filter(id => id !== topicId);
        saveBookmarks(updated);
        renderBookmarks();
        updateBookmarkButton(topicEl);
      });

      li.appendChild(a);
      li.appendChild(removeBtn);
      tList.appendChild(li);
    });

    container.appendChild(tList);
  }

  if (resourceBookmarks.length > 0) {
    const rHeading = document.createElement("h4");
    rHeading.textContent = "Saved Resources";
    container.appendChild(rHeading);

    const rList = document.createElement("ul");
    rList.className = "bookmark-list";

    resourceBookmarks.forEach((resourceId) => {
      const resEl = document.querySelector(`li[data-resource-id="${resourceId}"]`);
      if (!resEl) return;

      const link = resEl.querySelector("a");
      const title = link?.textContent || "Resource";

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = link?.href || "#";
      a.textContent = title;
      a.target = "_blank";

      const removeBtn = document.createElement("button");
      removeBtn.className = "bookmark-remove";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        const updated = getResourceBookmarks().filter(id => id !== resourceId);
        saveResourceBookmarks(updated);
        renderBookmarks();
        updateResourceBookmarkButton(resEl);
      });

      li.appendChild(a);
      li.appendChild(removeBtn);
      rList.appendChild(li);
    });

    container.appendChild(rList);
  }
}

function ensureTopicIds() {
  document.querySelectorAll("section.topic").forEach((topic, idx) => {
    if (!topic.id) topic.id = `topic-${idx + 1}`;
    if (!topic.getAttribute("data-topic-id")) topic.setAttribute("data-topic-id", topic.id);
  });
}

function addBookmarkButtons() {
  document.querySelectorAll("section.topic").forEach((topic) => {
    if (topic.querySelector(".bookmark-btn")) return;

    const header = topic.querySelector("h3");
    if (!header) return;

    const btn = document.createElement("button");
    btn.className = "bookmark-btn";
    btn.type = "button";
    btn.setAttribute("aria-pressed", "false");
    btn.style.marginLeft = "12px";

    btn.addEventListener("click", () => toggleBookmark(topic));

    header.insertAdjacentElement("afterend", btn);
    updateBookmarkButton(topic);
  });
}

function addResourceBookmarkButtons() {
  document.querySelectorAll("section.topic li").forEach((li, idx) => {
    const link = li.querySelector("a");
    if (!link) return;

    // avoid duplicates
    if (li.querySelector(".resource-bookmark-btn")) return;

    // ensure stable ID
    if (!li.getAttribute("data-resource-id")) {
      li.setAttribute("data-resource-id", `resource-${idx + 1}`);
    }

    const btn = document.createElement("button");
    btn.className = "resource-bookmark-btn";
    btn.type = "button";
    btn.setAttribute("aria-pressed", "false");

    btn.addEventListener("click", () => toggleResourceBookmark(li));

    li.appendChild(btn);
    updateResourceBookmarkButton(li);
  });
}

// Init bookmarks
ensureTopicIds();
addBookmarkButtons();
addResourceBookmarkButtons();
renderBookmarks();

function dailyRecommendation() {
  const resources = document.querySelectorAll("ul.resources li a");
  const index = new Date().getDate() % resources.length;
  const item = resources[index];
  document.getElementById("dailyRec").textContent = item.textContent;
}

