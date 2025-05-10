const API_BASE_URL = 'http://localhost:5000/api';

// Show message with fallback to alert
function showMessage(msg, isSuccess = true) {
  const box = document.getElementById('message');
  if (box) {
    box.textContent = msg;
    box.style.color = isSuccess ? 'green' : 'red';
    box.style.display = 'block';
    setTimeout(() => {
      box.style.display = 'none';
      box.textContent = '';
    }, 3000);
  } else {
    alert(msg);
  }
}

// Get stored token
function getToken() {
  return localStorage.getItem('token');
}

// Logout user
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// Auth guard for protected pages
function checkAuth(role) {
  const token = getToken();
  const userRole = localStorage.getItem('userRole');
  if (!token || userRole !== role) {
    alert('Access denied. Please login.');
    window.location.href = 'index.html';
  }
}

// Register a new user
async function registerUser(event) {
  event.preventDefault();
  const fullName = document.getElementById('regFullName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const role = document.getElementById('regRole').value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, role })
    });

    const data = await response.json();
    if (response.ok) {
      showMessage('✅ Registration successful! Please login.');
      document.getElementById('registerForm').reset();
      setTimeout(() => window.location.href = 'index.html', 2000);
    } else {
      showMessage(data.message || '❌ Registration failed.', false);
    }
  } catch (error) {
    console.error('Registration error:', error);
    showMessage('❌ An error occurred during registration.', false);
  }
}

// Login an existing user
async function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
      showMessage('✅ Login successful!');
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userId', data.user._id);

      // Redirect based on role
      setTimeout(() => {
        switch (data.user.role) {
          case 'borrower': window.location.href = 'borrower.html'; break;
          case 'lender': window.location.href = 'lender.html'; break;
          case 'admin': window.location.href = 'admin.html'; break;
          default: showMessage('❌ Unknown role. Access denied.', false);
        }
      }, 1500);
    } else {
      showMessage(data.message || '❌ Login failed.', false);
    }
  } catch (error) {
    console.error('Login error:', error);
    showMessage('❌ An error occurred during login.', false);
  }
}

// Submit loan application (for borrowers)
async function submitLoanApplication(event) {
  event.preventDefault();
  const amount = document.getElementById('loanAmount').value;
  const reason = document.getElementById('loanReason').value;
  const token = getToken();

  try {
    const response = await fetch(`${API_BASE_URL}/loans/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount, reason })
    });

    const data = await response.json();
    if (response.ok) {
      showMessage('✅ Loan application submitted.');
      document.getElementById('loanForm').reset();
    } else {
      showMessage(data.message || '❌ Loan application failed.', false);
    }
  } catch (error) {
    console.error('Loan application error:', error);
    showMessage('❌ An error occurred while applying for the loan.', false);
  }
}

// Fetch borrower's own loans
async function fetchBorrowerLoans() {
  const token = getToken();

  try {
    const response = await fetch(`${API_BASE_URL}/loans/my`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const loans = await response.json();
    const container = document.getElementById('borrowerLoans');
    if (container) {
      container.innerHTML = loans.map(loan => `
        <div>
          <p><strong>Amount:</strong> ${loan.amount}</p>
          <p><strong>Status:</strong> ${loan.status}</p>
          <p><strong>Reason:</strong> ${loan.reason}</p>
          <hr>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Fetch borrower loans error:', error);
    showMessage('❌ Could not load your loans.', false);
  }
}

// Fetch all loans (for lenders)
async function fetchLenderLoans() {
  const token = getToken();

  try {
    const response = await fetch(`${API_BASE_URL}/loans`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const loans = await response.json();
    const container = document.getElementById('lenderLoans');
    if (container) {
      container.innerHTML = loans.map(loan => `
        <div>
          <p><strong>Amount:</strong> ${loan.amount}</p>
          <p><strong>Status:</strong> ${loan.status}</p>
          <p><strong>Borrower:</strong> ${loan.borrowerName}</p>
          <button onclick="updateLoanStatus('${loan._id}', 'approved')">✅ Approve</button>
          <button onclick="updateLoanStatus('${loan._id}', 'rejected')">❌ Reject</button>
          <hr>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Fetch lender loans error:', error);
    showMessage('❌ Could not load loans.', false);
  }
}

// Update loan status (approve/reject)
async function updateLoanStatus(loanId, status) {
  const token = getToken();

  try {
    const response = await fetch(`${API_BASE_URL}/loans/${loanId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    const data = await response.json();
    if (response.ok) {
      showMessage(`✅ Loan ${status}.`);
      fetchLenderLoans(); // Refresh after update
    } else {
      showMessage(data.message || '❌ Failed to update loan.', false);
    }
  } catch (error) {
    console.error('Update loan error:', error);
    showMessage('❌ An error occurred while updating the loan.', false);
  }
}

// Attach form handlers on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loanForm = document.getElementById('loanForm');

  if (loginForm) loginForm.addEventListener('submit', loginUser);
  if (registerForm) registerForm.addEventListener('submit', registerUser);
  if (loanForm) loanForm.addEventListener('submit', submitLoanApplication);
});
