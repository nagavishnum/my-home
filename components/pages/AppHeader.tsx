'use client';

export default function AppHeader() {
    const username = localStorage.getItem('username') || 'User';

const handleLogout = () => {

  const confirmed = window.confirm(
    `Are you sure you want to logout, ${username}?`
  );

  if (!confirmed) {
    return;
  }

  localStorage.removeItem('token');
  localStorage.removeItem('username');

  window.location.href = '/login';
};
return (
    <div>
    <h4 style={{ marginBottom: 10 }}>{username}</h4>
    <a className="logout-link" onClick={handleLogout}>Logout</a>
    </div>
)
}
