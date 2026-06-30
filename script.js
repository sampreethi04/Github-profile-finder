const input = document.getElementById("username");
const profileDiv = document.getElementById("profile");
const searchBtn = document.getElementById("searchBtn");
const themeToggle = document.getElementById("themeToggle");
const recentDiv = document.getElementById("recent");
const clearBtn = document.getElementById("clearHistory");

/* Search on Enter */
input.addEventListener("keypress", e => {
    if (e.key === "Enter") getProfile();
});

searchBtn.addEventListener("click", getProfile);

/* Theme Toggle */
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    document.body.classList.toggle("dark");
});

/* Load Recent Searches */
function loadRecent() {
    const users = JSON.parse(localStorage.getItem("recentUsers")) || [];
    recentDiv.innerHTML = users.map(user =>
        `<span onclick="searchRecent('${user}')">${user}</span>`
    ).join("");
}

/* Save Search */
function saveRecent(username) {
    let users = JSON.parse(localStorage.getItem("recentUsers")) || [];
    users = users.filter(u => u !== username);
    users.unshift(username);
    if (users.length > 5) users.pop();
    localStorage.setItem("recentUsers", JSON.stringify(users));
    loadRecent();
}

/* Click Recent */
function searchRecent(username) {
    input.value = username;
    getProfile();
}

/* Clear History */
clearBtn.addEventListener("click", () => {
    localStorage.removeItem("recentUsers");
    recentDiv.innerHTML = "";
});

/* Fetch Profile */
async function getProfile() {
    const username = input.value.trim();

    if (!username) {
        profileDiv.innerHTML = "<p>Please enter a username</p>";
        return;
    }

    profileDiv.innerHTML = `<div class="spinner"></div>`;

    try {
        const userRes = await fetch(`https://api.github.com/users/${username}`);
        const userData = await userRes.json();

        if (userData.message === "Not Found") {
            profileDiv.innerHTML = "<p>User not found</p>";
            return;
        }

        saveRecent(username);

        const repoRes = await fetch(
            `https://api.github.com/users/${username}/repos?sort=updated&per_page=5`
        );
        const repos = await repoRes.json();

        let repoHTML = repos.map(repo => `
            <div class="repo">
                <strong>${repo.name}</strong><br>
                ⭐ ${repo.stargazers_count} |
                🍴 ${repo.forks_count} |
                ${repo.language || "N/A"}
            </div>
        `).join("");

        profileDiv.innerHTML = `
            <img src="${userData.avatar_url}">
            <h2>${userData.name || userData.login}</h2>
            <p>${userData.bio || "No bio available"}</p>
            <p>
                Followers: ${userData.followers} |
                Following: ${userData.following} |
                Repos: ${userData.public_repos}
            </p>
            <h3>Latest Repositories</h3>
            ${repoHTML}
        `;
    } catch {
        profileDiv.innerHTML = "<p>Error fetching data</p>";
    }
}

loadRecent();