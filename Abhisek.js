// Predefined admin credentials
const ADMIN_CREDENTIALS = {
    username: 'srn',
    password: 'srn',
};

let isAdminLoggedIn = false;

// Initialize candidates and votes
let candidates = JSON.parse(localStorage.getItem('candidates')) || [];
let votes = JSON.parse(localStorage.getItem('votes')) || {};

// Navigate between panels
function navigate(panel) {
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login-panel').classList.add('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('voter-panel').classList.add('hidden');

    if (panel === 'admin' && !isAdminLoggedIn) {
        alert('You must log in as an admin to access this panel.');
        navigate('login');
        return;
    }

    if (panel === 'admin') {
        // Open admin panel in a new tab
        const adminWindow = window.open('', '_blank');
        adminWindow.document.write(`
            <html>
                <head>
                    <title>Admin Panel</title>
                    <link rel="stylesheet" href="Abhisek.css">
                </head>
                <body>
                    <h2>Admin Panel</h2>
                    <input id="candidate-name" type="text" placeholder="Candidate Name">
                    <button onclick="addCandidate()">Add Candidate</button>
                    <button onclick="resetCandidates()">reset</button>
                    <h3>Registered Candidates</h3>
                    <ul id="candidates-list"></ul>
                    <button onclick="showResults()">View Results</button>
                    <button onclick="logoutAdmin()">Logout</button>
                    <script src="Abhisek.js"></script>
                </body>
            </html>
        `);
        adminWindow.document.close(); // Close the document to render the content
        return; // Prevents navigating to the admin panel in the current window
    }

    document.getElementById(`${panel}-panel`).classList.remove('hidden');
    if (panel === 'admin') updateCandidatesList();
    if (panel === 'voter') updateVoteList();
}

// Admin login
function adminLogin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isAdminLoggedIn = true;
        alert('Login successful!');
        navigate('admin');
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

// Admin logout
function logoutAdmin() {
    isAdminLoggedIn = false;
    alert('You have been logged out.');

    // Close the admin window (this will only work for the window opened via window.open)
    if (window.opener) {
        window.close(); // Close the admin window/tab
    }

    // Navigate to the main app and hide all other panels
    navigate('app'); // Go back to the main page (app panel)
}

// Add candidate
function addCandidate() {
    const name = document.getElementById('candidate-name').value;
    if (name) {
        candidates.push(name);
        votes[name] = 0; // Initialize vote count
        localStorage.setItem('candidates', JSON.stringify(candidates));
        localStorage.setItem('votes', JSON.stringify(votes));
        updateCandidatesList();
        document.getElementById('candidate-name').value = '';
    }
}

// Reset candidates and votes
function resetCandidates() {
    // Clear the candidates and votes from localStorage
    localStorage.removeItem('candidates');
    localStorage.removeItem('votes');
    
    // Reset the candidates and votes arrays
    candidates = [];
    votes = {};

    // Update the candidate list UI
    updateCandidatesList();

    // Update the vote list UI (if necessary)
    updateVoteList();

    alert('All candidates and votes have been reset!');
}

// Update candidate list in Admin Panel
function updateCandidatesList() {
    const list = document.getElementById('candidates-list');
    list.innerHTML = '';
    candidates.forEach(candidate => {
        const li = document.createElement('li');
        li.textContent = candidate;
        list.appendChild(li);
    });
}

// Update candidate list in Voter Panel
function updateVoteList() {
    const list = document.getElementById('vote-list');
    list.innerHTML = '';
    candidates.forEach(candidate => {
        const li = document.createElement('li');
        li.textContent = `${candidate} (${votes[candidate]} votes)`;
        const btn = document.createElement('button');
        btn.textContent = 'Vote';
        btn.onclick = () => castVote(candidate);
        li.appendChild(btn);
        list.appendChild(li);
    });
}

// Check if user is eligible to vote again
function canVoteAgain() {
    const lastVoteTime = localStorage.getItem('lastVoteTime');
    if (!lastVoteTime) return true;

    const currentTime = Date.now();
    const elapsedTime = currentTime - parseInt(lastVoteTime, 10);

    // 1 minute = 60,000 milliseconds
    return elapsedTime >= 60000; // Returns true if 1 minute has passed
}

// Cast a vote
function castVote(candidate) {
    if (!canVoteAgain()) {
        const lastVoteTime = parseInt(localStorage.getItem('lastVoteTime'), 10);
        const timeRemaining = 60000 - (Date.now() - lastVoteTime);
        const secondsRemaining = Math.ceil(timeRemaining / 1000);
        alert(`You can vote again in ${secondsRemaining} seconds.`);
        return;
    }

    votes[candidate]++;
    localStorage.setItem('votes', JSON.stringify(votes));
    localStorage.setItem('lastVoteTime', Date.now()); // Store current time as last vote time
    updateVoteList();
    alert('Vote cast successfully!');
}

// Show results in Admin Panel
function showResults() {
    const results = Object.entries(votes)
        .map(([candidate, count]) => `${candidate}: ${count} votes`)
        .join('\n');
    alert(`Results:\n${results}`);
}

// Reset votes
function resetVotes() {
    localStorage.clear();
    candidates = [];
    votes = {};
    alert('All data reset!');
    navigate('app');
}
