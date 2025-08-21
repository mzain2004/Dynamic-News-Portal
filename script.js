const API_KEY = "0ac3eac3710b5ecfe5e4b2ca8ae7db28";
const SEARCH_URL = "https://gnews.io/api/v4/search";
const TOP_HEADLINES_URL = "https://gnews.io/api/v4/top-headlines";

let currentPage = 1;
let currentQuery = "latest"; // default
let currentCategory = null;  // track category filter
const newsContainer = document.getElementById("news-container");
const loadMoreBtn = document.getElementById("loadMoreBtn");

// Fetch and display news
async function fetchNews(query, page = 1, category = null) {
  try {
    let url;
    if (category) {
      // For filters (categories)
      url = `${TOP_HEADLINES_URL}?topic=${category}&lang=en&country=pk&max=9&page=${page}&apikey=${API_KEY}`;
    } else {
      // For search
      url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&lang=en&country=pk&max=9&page=${page}&apikey=${API_KEY}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (page === 1) newsContainer.innerHTML = ""; // reset on new query

    if (data.articles && data.articles.length > 0) {
      data.articles.forEach((article) => {
        const card = document.createElement("div");
        card.classList.add("news-card");
        card.innerHTML = `
          <img src="${article.image || 'https://via.placeholder.com/300'}" alt="news image">
          <h3>${article.title}</h3>
          <p>${article.description || ""}</p>
          <a href="${article.url}" target="_blank">Read More</a>
        `;
        newsContainer.appendChild(card);
      });
    } else {
      if (page === 1) {
        newsContainer.innerHTML = `<p>No news found for "${query}".</p>`;
      }
    }
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}

// Event: Load More
loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  fetchNews(currentQuery, currentPage, currentCategory);
});

// Event: Search
document.getElementById("searchBtn").addEventListener("click", () => {
  const query = document.getElementById("searchInput").value.trim();
  if (query) {
    currentQuery = query;
    currentCategory = null; // reset category
    currentPage = 1;
    fetchNews(currentQuery, currentPage);
  }
});

// Event: Filter Buttons
document.querySelectorAll("nav ul li a").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    currentCategory = btn.dataset.category;
    currentQuery = btn.textContent; // just for display
    currentPage = 1;
    fetchNews("", currentPage, currentCategory);
  });
});

// Initial load
fetchNews(currentQuery, currentPage);
