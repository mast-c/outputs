(() => {
  const posts = window.BLOG_POSTS || [];
  const categories = ["全部", ...new Set(posts.map((post) => post.category))];
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  function icon(name) { return `<i data-lucide="${name}" aria-hidden="true"></i>`; }
  function articleUrl(slug) { return `post.html?post=${encodeURIComponent(slug)}`; }
  function formatTags(tags) { return tags.map((tag) => `<span>#${tag}</span>`).join(""); }

  function renderShell() {
    const header = $(".site-header");
    const footer = $(".site-footer");
    if (header) {
      header.innerHTML = `<div class="page-shell header-inner"><a class="wordmark" href="index.html" aria-label="林墨首页">林墨<span>.</span></a><nav class="main-nav" aria-label="主导航"><a href="index.html#writing">文章</a><a href="index.html#about">关于</a><a href="mailto:hello@example.com">联系</a></nav><button class="icon-button theme-toggle" type="button" title="切换色彩主题" aria-label="切换色彩主题">${icon("sun")}</button></div>`;
    }
    if (footer) {
      footer.innerHTML = `<div><a class="wordmark" href="index.html">林墨<span>.</span></a><p>记录尚未完成的思考。</p></div><div class="footer-links"><a href="#top">回到顶部 ${icon("arrow-up")}</a><span>© 2026 LIN MO</span></div>`;
    }
    setupTheme();
  }

  function setupTheme() {
    const stored = localStorage.getItem("linmo-theme");
    if (stored) document.documentElement.dataset.theme = stored;
    const button = $(".theme-toggle");
    if (!button) return;
    const update = () => {
      const dark = document.documentElement.dataset.theme === "dark";
      button.innerHTML = icon(dark ? "sun" : "moon");
      button.setAttribute("title", dark ? "使用浅色主题" : "使用深色主题");
    };
    update();
    button.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("linmo-theme", next);
      update();
      drawIcons();
    });
  }

  function drawIcons() { if (window.lucide) window.lucide.createIcons(); }

  function renderPostCard(post) {
    return `<article class="post-card"><a class="post-card-main" href="${articleUrl(post.slug)}"><div class="post-index ${post.accent}" aria-hidden="true">${post.date.slice(5).replace(".", "/")}</div><div class="post-card-content"><div class="post-meta"><span>${post.category}</span><span>${post.readTime}</span></div><h3>${post.title}</h3><p>${post.excerpt}</p><div class="tag-row">${formatTags(post.tags)}</div></div><span class="card-arrow">${icon("arrow-up-right")}</span></a></article>`;
  }

  function renderHome() {
    const featured = posts.find((post) => post.featured) || posts[0];
    $("#featured-story").innerHTML = `<div class="feature-mark ${featured.accent}">${icon("sparkles")}</div><div class="feature-copy"><div class="post-meta"><span>${featured.category}</span><span>${featured.date} · ${featured.readTime}</span></div><h3>${featured.title}</h3><p>${featured.excerpt}</p><a class="text-link" href="${articleUrl(featured.slug)}">阅读文章 ${icon("arrow-right")}</a></div><a class="feature-side-link" href="${articleUrl(featured.slug)}" aria-label="阅读 ${featured.title}">${icon("arrow-up-right")}</a>`;
    $("#tag-filters").innerHTML = categories.map((category, index) => `<button class="filter-chip${index === 0 ? " active" : ""}" data-category="${category}" type="button">${category}</button>`).join("");
    let selectedCategory = "全部";
    let searchTerm = "";
    const list = $("#post-list");
    const count = $("#article-count");
    const empty = $("#empty-state");
    function renderList() {
      const matching = posts.filter((post) => (selectedCategory === "全部" || post.category === selectedCategory) && `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase().includes(searchTerm.toLowerCase()));
      list.innerHTML = matching.map(renderPostCard).join("");
      count.textContent = `共 ${matching.length} 篇`;
      empty.hidden = matching.length !== 0;
      drawIcons();
    }
    $$(".filter-chip").forEach((button) => button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;
      $$(".filter-chip").forEach((chip) => chip.classList.toggle("active", chip === button));
      renderList();
    }));
    $("#post-search").addEventListener("input", (event) => { searchTerm = event.target.value.trim(); renderList(); });
    renderList();
  }

  function renderNotFound() {
    $("#article").innerHTML = `<section class="not-found page-shell"><p class="eyebrow">404 / NOT FOUND</p><h1>这篇文章还没有被写下。</h1><p>也许链接有误，或者它仍在等待一个更好的开头。</p><a class="button button-primary" href="index.html">回到首页 ${icon("arrow-right")}</a></section>`;
  }

  function renderPost() {
    const slug = new URLSearchParams(location.search).get("post");
    const post = posts.find((item) => item.slug === slug);
    if (!post) { renderNotFound(); return; }
    document.title = `${post.title} | 林墨`;
    const headings = [...post.body.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)].map((match) => ({ id: match[1], text: match[2] }));
    const related = posts.filter((item) => item.slug !== post.slug && (item.category === post.category || item.tags.some((tag) => post.tags.includes(tag)))).slice(0, 2);
    $("#article").innerHTML = `<article class="article-page page-shell"><header class="article-header"><a class="back-link" href="index.html#writing">${icon("arrow-left")} 所有文章</a><div class="post-meta"><span>${post.category}</span><span>${post.date} · ${post.readTime}</span></div><h1>${post.title}</h1><p class="article-deck">${post.excerpt}</p><div class="article-actions"><div class="tag-row">${formatTags(post.tags)}</div><button class="share-button" id="share-button" type="button">${icon("link")} <span>复制链接</span></button></div></header><div class="article-layout"><aside class="article-aside"><p>目录</p><nav class="toc" aria-label="文章目录">${headings.map((heading) => `<a href="#${heading.id}">${heading.text}</a>`).join("")}</nav></aside><div class="article-body" id="article-body">${post.body}</div></div>${related.length ? `<section class="related"><p class="eyebrow">CONTINUE READING</p><h2>继续阅读</h2><div class="related-grid">${related.map(renderPostCard).join("")}</div></section>` : ""}</article>`;
    $("#share-button").addEventListener("click", async () => {
      const button = $("#share-button");
      try { await navigator.clipboard.writeText(location.href); button.querySelector("span").textContent = "已复制"; }
      catch { button.querySelector("span").textContent = "复制失败"; }
      setTimeout(() => { button.querySelector("span").textContent = "复制链接"; }, 1600);
    });
    setupReadingProgress();
    drawIcons();
  }

  function setupReadingProgress() {
    const bar = $("#reading-progress-bar");
    const body = $("#article-body");
    if (!bar || !body) return;
    const update = () => {
      const start = body.offsetTop - window.innerHeight * 0.35;
      const distance = body.offsetHeight - window.innerHeight * 0.55;
      const progress = Math.max(0, Math.min(1, (window.scrollY - start) / distance));
      bar.style.transform = `scaleX(${progress})`;
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  renderShell();
  if (document.body.dataset.page === "home") renderHome();
  if (document.body.dataset.page === "post") renderPost();
  window.addEventListener("load", drawIcons);
})();
