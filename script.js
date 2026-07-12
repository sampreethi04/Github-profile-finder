const input = document.getElementById("username");
const profileDiv = document.getElementById("profile");
const searchBtn = document.getElementById("searchBtn");
const themeToggle = document.getElementById("themeToggle");
const recentDiv = document.getElementById("recent");
const clearBtn = document.getElementById("clearHistory");
const searchType = document.getElementById("searchType");

/* Search on Enter */
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        getProfile();
    }
});

searchBtn.addEventListener("click", getProfile);

/* Theme Toggle */
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    document.body.classList.toggle("dark");
});

/* Load Recent Searches */
function loadRecent() {
    const searches =
        JSON.parse(localStorage.getItem("recentSearches")) || [];

    recentDiv.innerHTML = searches
        .map(
            (item) =>
                `<span onclick="searchRecent('${item.value}','${item.type}')">
                    ${item.value}
                </span>`
        )
        .join("");
}

/* Save Recent Search */
function saveRecent(value, type) {
    let searches =
        JSON.parse(localStorage.getItem("recentSearches")) || [];

    searches = searches.filter(
        (item) => item.value !== value
    );

    searches.unshift({ value, type });

    if (searches.length > 5) {
        searches.pop();
    }

    localStorage.setItem(
        "recentSearches",
        JSON.stringify(searches)
    );

    loadRecent();
}

/* Click Recent Search */
function searchRecent(value, type) {
    input.value = value;
    searchType.value = type;
    getProfile();
}

window.searchRecent = searchRecent;

/* Clear History */
clearBtn.addEventListener("click", () => {
    localStorage.removeItem("recentSearches");
    recentDiv.innerHTML = "";
});

/* Main Search Function */
async function getProfile() {
    const query = input.value.trim();
    const type = searchType.value;

    if (!query) {
        profileDiv.innerHTML =
            "<p>Please enter a username or repository name.</p>";
        return;
    }

    profileDiv.innerHTML =
        `<div class="spinner"></div>`;

    try {
        if (type === "user") {
            await searchUser(query);
        } else {
            await searchRepository(query);
        }

        saveRecent(query, type);
    } catch (error) {
        profileDiv.innerHTML =
            "<p>Error fetching data.</p>";
    }
}

/* Search GitHub User */
async function searchUser(username) {
    const userRes = await fetch(
        `https://api.github.com/users/${username}`
    );

    const userData = await userRes.json();

    if (userData.message === "Not Found") {
        profileDiv.innerHTML =
            "<p>User not found.</p>";
        return;
    }

    const repoRes = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=5`
    );

    const repos = await repoRes.json();

    const repoHTML = repos
        .map(
            (repo) => `
            <div class="repo">
                <a href="${repo.html_url}" target="_blank">
                    <strong>${repo.name}</strong>
                </a>

                <p>
                    ${repo.description || "No description"}
                </p>

                ⭐ ${repo.stargazers_count}
                |
                🍴 ${repo.forks_count}
                |
                ${repo.language || "N/A"}
            </div>
        `
        )
        .join("");

    profileDiv.innerHTML = `
        <img src="${userData.avatar_url}" alt="avatar">

        <h2>
            ${userData.name || userData.login}
        </h2>

        <p>
            ${userData.bio || "No bio available"}
        </p>

        <p>
            📍 ${userData.location || "Not Available"}
        </p>

        <p>
            🏢 ${userData.company || "Not Available"}
        </p>

        <p>
            Followers: ${userData.followers}
            |
            Following: ${userData.following}
            |
            Repos: ${userData.public_repos}
        </p>

        <p>
            <a href="${userData.html_url}" target="_blank">
                View GitHub Profile
            </a>
        </p>

        <h3>Latest Repositories</h3>

        ${repoHTML}
    `;
}

/* Search Repository */
async function searchRepository(repoName) {
    const repoRes = await fetch(
        `https://api.github.com/search/repositories?q=${repoName}`
    );

    const data = await repoRes.json();

    if (!data.items || data.items.length === 0) {
        profileDiv.innerHTML =
            "<p>No repositories found.</p>";
        return;
    }

    const reposHTML = data.items
        .slice(0, 10)
        .map(
            (repo) => `
            <div class="repo">

                <a href="${repo.html_url}" target="_blank">
                    <strong>${repo.full_name}</strong>
                </a>

                <p>
                    ${repo.description || "No description"}
                </p>

                ⭐ ${repo.stargazers_count}
                |
                🍴 ${repo.forks_count}
                |
                ${repo.language || "N/A"}

            </div>
        `
        )
        .join("");

    profileDiv.innerHTML = `
        <h2>Repository Results</h2>
        ${reposHTML}
    `;
}

loadRecent();