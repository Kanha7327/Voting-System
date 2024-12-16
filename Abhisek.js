var tl = gsap.timeline()
tl.from("#nav",{
    opacity:0,
    delay:0.3
})
tl.from("#nav1 h4,#nav h1,#nav h3",{
    y:-80,
    opacity:0,
    duration:1,
    delay:0.5,
    stagger:0.3
})
const ADMIN_CREDENTIALS = {
    username: 'srn',
    password: 'srn',
};

let isAdminLoggedIn = false;
let candidates = JSON.parse(localStorage.getItem('candidates')) || [];
let votes = JSON.parse(localStorage.getItem('votes')) || {};
let voters = JSON.parse(localStorage.getItem('voters')) || {};
let votersWhoVoted = JSON.parse(localStorage.getItem('votersWhoVoted')) || {};

function navigate(panel) {
    document.querySelectorAll('div').forEach(div => div.classList.add('hidden'));
    document.getElementById(`${panel}-panel`)?.classList.remove('hidden');
}

function adminLogin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isAdminLoggedIn = true;
        alert('Login successful!');
        navigate('admin');
        updateCandidatesList();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    alert('You have been logged out.');
    navigate('app');
}

function addCandidate() {
    const name = document.getElementById('candidate-name').value;
    if (name && !candidates.includes(name)) {
        candidates.push(name);
        votes[name] = 0;
        localStorage.setItem('candidates', JSON.stringify(candidates));
        localStorage.setItem('votes', JSON.stringify(votes));
        updateCandidatesList();
        document.getElementById('candidate-name').value = '';
    } else {
        alert('Candidate name is required or already exists!');
    }
}

function resetCandidates() {
    localStorage.removeItem('candidates');
    localStorage.removeItem('votes');
    candidates = [];
    votes = {};
    updateCandidatesList();
    alert('All candidates and votes have been reset!');
}

function voterLogin() {
    const username = document.getElementById('voter-username').value;
    const password = document.getElementById('voter-password').value;

    if (voters[username] && voters[username] === password) {
        // Check if the voter has already voted
        if (votersWhoVoted[username]) {
            alert("You have already voted.");
            navigate('app');
            return;
        }

        alert('Login successful!');
        navigate('voter');
        updateVoteList();
    } else {
        document.getElementById('voter-login-error').style.display = 'block';
    }
}

function voterSignUp() {
    const username = document.getElementById('voter-signup-username').value;
    const password = document.getElementById('voter-signup-password').value;
    const confirmPassword = document.getElementById('voter-signup-confirm-password').value;

    if (password === confirmPassword && username && !voters[username]) {
        voters[username] = password;
        localStorage.setItem('voters', JSON.stringify(voters));
        alert('Sign up successful!');
        navigate('voter-login');
    } else {
        document.getElementById('voter-signup-error').style.display = 'block';
    }
}

function updateCandidatesList() {
    const list = document.getElementById('candidates-list');
    list.innerHTML = '';
    candidates.forEach(candidate => {
        const li = document.createElement('li');
        li.textContent = candidate;
        list.appendChild(li);
    });
}

function updateVoteList() {
    const list = document.getElementById('vote-list');
    list.innerHTML = '';
    candidates.forEach(candidate => {
        const li = document.createElement('li');
        li.innerHTML = `${candidate} (${votes[candidate] || 0} votes)`;
        const btn = document.createElement('button');
        btn.textContent = 'Vote';
        btn.onclick = () => castVote(candidate);
        li.appendChild(btn);
        list.appendChild(li);
    });
}

function castVote(candidate) {
    const voterName = document.getElementById('voter-name').value.trim();

    if (!voterName) {
        alert("Please enter your name before voting.");
        return;
    }

    // Check if the voter has already voted
    if (votersWhoVoted[voterName]) {
        alert("You have already voted. Your vote cannot be changed.");
        return;
    }

    votes[candidate] = (votes[candidate] || 0) + 1;
    votersWhoVoted[voterName] = true;  // Mark that the voter has voted

    localStorage.setItem('votes', JSON.stringify(votes));
    localStorage.setItem('votersWhoVoted', JSON.stringify(votersWhoVoted));

    alert("Vote cast successfully!");
    updateVoteList();
}

function resetVotes() {
    if (confirm("Are you sure you want to reset all votes?")) {
        localStorage.removeItem('votes');
        votes = {};
        updateVoteList();
        alert("All votes have been reset.");
    }
}

function showResults() {
    const results = candidates.map(candidate => `${candidate}: ${votes[candidate] || 0} votes`).join('\n');
    alert(`Voting Results:\n${results}`);
}
