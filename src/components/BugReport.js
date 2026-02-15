import React, { useState } from 'react'

export default function BugReport({ bugFormToggle, setBugFormToggle }) {
  const [bugFormName, setBugFormName] = useState("")
  const [bugFormEmail, setBugFormEmail] = useState("")
  const [bugFormBug, setBugFormBug] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const bugForm = {
      name: bugFormName,
      email: bugFormEmail,
      bug: bugFormBug
    }

    try {
      const response = await fetch(`${API_URL}/api/bug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bugForm)
      })

      if (!response.ok) {
        throw new Error('Failed to submit bug report')
      }

      setSuccess(true)
      setTimeout(() => {
        setBugFormToggle(!bugFormToggle)
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <form className="bug-form" onSubmit={handleSubmit}>
        <h2>Report a Bug</h2>
        {success && <p className="success-message">Bug report submitted successfully!</p>}
        {error && <p className="error-message">{error}</p>}
        <label>Name</label>
        <input type="text" name="name"
          onChange={e => setBugFormName(e.target.value)}
          value={bugFormName}
          required />
        <label>Email</label>
        <input type="email" name="email"
          onChange={e => setBugFormEmail(e.target.value)}
          value={bugFormEmail}
          required />
        <label>Bug details</label>
        <textarea name="bug"
          onChange={e => setBugFormBug(e.target.value)}
          value={bugFormBug}
          required />
        <input type="submit" value={isLoading ? "Submitting..." : "Submit Bug"} disabled={isLoading} />
        <button type="button" onClick={() => setBugFormToggle(!bugFormToggle)}>Cancel</button>
      </form>
    </>
  )
}
