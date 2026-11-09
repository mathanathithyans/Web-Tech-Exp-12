import { useCallback, useEffect, useState } from 'react'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/articles'
const emptyForm = { title: '', category: '', description: '', author: '' }

async function readResponse(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'The request could not be completed.')
  }
  return data
}

function App() {
  const [articles, setArticles] = useState([])
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [loading, setLoading] = useState(true)

  const loadArticles = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(API)
      const data = await readResponse(response)
      setArticles(data)
      setMessage('')
      setMessageType('')
      return true
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load articles.')
      setMessageType('error')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setMessageType('')

    try {
      const response = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      await readResponse(response)

      resetForm()
      if (await loadArticles()) {
        setMessage(editingId ? 'Article updated successfully!' : 'Article added successfully!')
        setMessageType('success')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save article.')
      setMessageType('error')
    }
  }

  function editArticle(article) {
    setEditingId(article._id)
    setForm({
      title: article.title,
      category: article.category,
      description: article.description,
      author: article.author,
    })
    document.getElementById('add')?.scrollIntoView({ behavior: 'smooth' })
  }

  async function deleteArticle(id) {
    if (!window.confirm('Are you sure you want to delete this article?')) return

    setMessage('')
    setMessageType('')
    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' })
      await readResponse(response)
      if (await loadArticles()) {
        setMessage('Article deleted successfully!')
        setMessageType('success')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to delete article.')
      setMessageType('error')
    }
  }

  const filteredArticles = articles.filter((article) =>
    `${article.title} ${article.category} ${article.description}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  return (
    <div className="app">
      <header className="navbar">
        <a className="wordmark" href="#home">Eco<span>Life.</span></a>
        <nav aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#articles">Articles</a>
          <a href="#add">Add Article</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="tagline">LIVE GREEN. LIVE BETTER.</p>
            <h1>Small Steps.<br /><span>Big Changes.</span></h1>
            <p>
              Discover simple ways to live sustainably, protect nature and create a greener future.
            </p>
            <a href="#articles" className="hero-btn">Explore Articles</a>
          </div>
          <span className="hero-leaf" aria-hidden="true">❋</span>
        </section>

        <section className="articles-section" id="articles">
          <p className="tagline">OUR BLOG</p>
          <h2>Explore Sustainable Living</h2>
          <p className="section-desc">Ideas and inspiration for an eco-friendly lifestyle.</p>

          <label className="visually-hidden" htmlFor="article-search">Search articles</label>
          <input
            id="article-search"
            className="search"
            type="search"
            placeholder="Search articles..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {message && <p className={`message ${messageType}`} role={messageType === 'error' ? 'alert' : 'status'}>{message}</p>}

          <div className="article-grid">
            {filteredArticles.map((article) => (
              <article className="article-card" key={article._id}>
                <div className="card-icon" aria-hidden="true">🌱</div>
                <div className="article-info">
                  <span className="category">{article.category}</span>
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <small>By {article.author}</small>
                  <div className="card-buttons">
                    <button className="edit-btn" type="button" onClick={() => editArticle(article)}>Edit</button>
                    <button className="delete-btn" type="button" onClick={() => deleteArticle(article._id)}>Delete</button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {!loading && filteredArticles.length === 0 && (
            <p className="empty">{search ? 'No articles match your search.' : 'No articles found.'}</p>
          )}
          {loading && <p className="empty" role="status">Loading articles...</p>}
        </section>

        <section className="add-section" id="add">
          <p className="tagline">SHARE YOUR IDEAS</p>
          <h2>{editingId ? 'Edit Article' : 'Add a New Article'}</h2>
          <form onSubmit={handleSubmit} className="article-form">
            <label className="visually-hidden" htmlFor="title">Article title</label>
            <input id="title" type="text" name="title" placeholder="Article Title" value={form.title} onChange={handleChange} required maxLength="120" />
            <label className="visually-hidden" htmlFor="category">Category</label>
            <input id="category" type="text" name="category" placeholder="Category (Eco Tips, Lifestyle...)" value={form.category} onChange={handleChange} required maxLength="50" />
            <label className="visually-hidden" htmlFor="description">Article description</label>
            <textarea id="description" name="description" placeholder="Write your article description..." value={form.description} onChange={handleChange} required maxLength="500" />
            <label className="visually-hidden" htmlFor="author">Author name</label>
            <input id="author" type="text" name="author" placeholder="Author Name" value={form.author} onChange={handleChange} required maxLength="80" />
            <button type="submit">{editingId ? 'Update Article' : 'Publish Article'}</button>
            {editingId && <button type="button" className="cancel-btn" onClick={resetForm}>Cancel Editing</button>}
          </form>
        </section>

        <section className="about" id="about">
          <p className="tagline">ABOUT ECOLIFE</p>
          <h2>A Greener Planet Starts With Us.</h2>
          <p>
            EcoLife is a sustainable living blog designed to encourage eco-friendly habits,
            reduce waste and inspire people to protect our environment.
          </p>
        </section>
      </main>

      <footer>
        <h3>EcoLife.</h3>
        <p>Small Steps. Big Changes.</p>
        <p>© 2026 EcoLife. All Rights Reserved.</p>
      </footer>
    </div>
  )
}

export default App
