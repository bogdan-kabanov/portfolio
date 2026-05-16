// API base — set via Vite env (VITE_API_URL). When empty/undefined the client
// falls back to bundled static defaults so the site keeps working stand-alone.
export const API_URL = import.meta.env.VITE_API_URL || ''

const TOKEN_KEY = 'pf_user_token'

export function getUserToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setUserToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, auth = false, headers = {} } = {}) {
  const opts = { method, headers: { ...headers } }
  if (body !== undefined) {
    if (body instanceof FormData) {
      opts.body = body
    } else {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(body)
    }
  }
  const token = getUserToken()
  if ((auth || token) && token) {
    opts.headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`${API_URL}${path}`, opts)
  if (res.status === 401 && auth) {
    setUserToken(null)
  }
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const data = await res.json()
      msg = data.error || msg
    } catch { /* ignore */ }
    throw new Error(msg)
  }
  if (res.status === 204) return null
  return res.json()
}

export async function fetchPortfolio({ signal } = {}) {
  if (!API_URL) return null
  const token = getUserToken()
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await fetch(`${API_URL}/api/portfolio`, { signal, headers })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// Resolve image URLs so /uploads/... paths returned by the API become absolute.
export function resolveAsset(url) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/uploads/') && API_URL) return API_URL + url
  return url
}

export const api = {
  // auth (regular site users)
  register: (username, password, displayName) =>
    request('/api/users/register', { method: 'POST', body: { username, password, displayName } }),
  login: (username, password) =>
    request('/api/users/login', { method: 'POST', body: { username, password } }),
  me: () => request('/api/users/me', { auth: true }),

  // posts
  listPosts: () => request('/api/posts'),
  getPost: (slug) => request(`/api/posts/by-slug/${encodeURIComponent(slug)}`),
  toggleLike: (postId) => request(`/api/posts/${postId}/like`, { method: 'POST', auth: true }),
  registerView: (postId) => request(`/api/posts/${postId}/view`, { method: 'POST' }),

  // comments
  listComments: (postId) => request(`/api/comments/by-post/${postId}`),
  createComment: (postId, text) =>
    request(`/api/comments/by-post/${postId}`, { method: 'POST', body: { text }, auth: true }),
  deleteComment: (id) => request(`/api/comments/${id}`, { method: 'DELETE', auth: true }),
}
