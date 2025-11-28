const API_KEY = "0ac3eac3710b5ecfe5e4b2ca8ae7db28";
const SEARCH_URL = "https://gnews.io/api/v4/search";
const TOP_HEADLINES_URL = "https://gnews.io/api/v4/top-headlines";

let currentPage = 1;
let currentQuery = "latest"; // default
let currentCategory = null;  // track category filter
let isLoading = false;

const newsContainer = document.getElementById("news-container");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const loader = document.getElementById("loader");

// Helper: Format Date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper: Show/Hide Loader
function toggleLoader(show) {
  loader.style.display = show ? "flex" : "none";
  loadMoreBtn.style.display = show ? "none" : "block";
}

// Helper: Show Error
function showError(message) {
  newsContainer.innerHTML = `<div class="error-message">${message}</div>`;
  loadMoreBtn.style.display = "none";
}

// Fetch and display news
async function fetchNews(query, page = 1, category = null) {
  if (isLoading) return;
  isLoading = true;
  toggleLoader(true);

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
    
    if (!res.ok) {
      throw new Error(`Failed to fetch news. Status: ${res.status}`);
    }

    const data = await res.json();

    if (page === 1) newsContainer.innerHTML = ""; // reset on new query

    if (data.articles && data.articles.length > 0) {
      data.articles.forEach((article) => {
        const card = document.createElement("div");
        card.classList.add("news-card");
        
        const imageSrc = article.image || 'https://via.placeholder.com/300?text=No+Image';
        const date = article.publishedAt ? formatDate(article.publishedAt) : '';
        const sourceName = article.source ? article.source.name : 'Unknown Source';

        card.innerHTML = `
          <div class="img-container">
            <img src="${imageSrc}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/300?text=Image+Error'">
          </div>
          <div class="news-card-content">
            <div class="news-meta">
              <span class="news-source">${sourceName}</span>
              <span class="news-date">${date}</span>
            </div>
            <h3>${article.title}</h3>
            <p>${article.description || "No description available."}</p>
            <a href="${article.url}" target="_blank" class="read-more-btn">Read More &rarr;</a>
          </div>
        `;
        newsContainer.appendChild(card);
      });
      
      // Hide load more if no more results (approximate check)
      if (data.articles.length < 9) {
        loadMoreBtn.style.display = "none";
      } else {
        loadMoreBtn.style.display = "block";
      }

    } else {
      if (page === 1) {
        showError(`No news found for "${query}".`);
      } else {
        loadMoreBtn.style.display = "none"; // No more pages
      }
    }
  } catch (error) {
    console.error("Error fetching news:", error);
    if (page === 1) {
      showError("Something went wrong. Please try again later.");
    }
  } finally {
    isLoading = false;
    loader.style.display = "none";
    // If we have content and not end of list, show button
    if (newsContainer.children.length > 0 && loadMoreBtn.style.display !== "none") {
       loadMoreBtn.style.display = "inline-block";
    }
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
    
    // Update active state in nav
    document.querySelectorAll("nav ul li a").forEach(a => a.classList.remove('active'));
    
    fetchNews(currentQuery, currentPage);
  }
});

// Allow Enter key for search
document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === 'Enter') {
    document.getElementById("searchBtn").click();
  }
});

// Event: Filter Buttons
document.querySelectorAll("nav ul li a").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    
    // Update active state
    document.querySelectorAll("nav ul li a").forEach(a => a.classList.remove('active'));
    btn.classList.add('active');

    currentCategory = btn.dataset.category;
    currentQuery = btn.textContent; // just for display or internal tracking
    currentPage = 1;
    fetchNews("", currentPage, currentCategory);
  });
});

// Initial load
fetchNews(currentQuery, currentPage);
