import React, { useState } from 'react'

export default function BugReport({ bugFormToggle, setBugFormToggle }) {
  const [bugFormName, setBugFormName] = useState("")
  const [bugFormEmail, setBugFormEmail] = useState("")
  const [bugFormBug, setBugFormBug] = useState("")

  function handleSubmit(e) {
    e.preventDefault()

    const bugForm = {
      name: bugFormName,
      email: bugFormEmail,
      bug: bugFormBug
    }

    fetch('http://localhost:5000/bug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bugForm)
    }).then(response => response.json())
      .then(setBugFormToggle(!bugFormToggle))
  }

  return (
    <>
      <form className="bug-form" onSubmit={handleSubmit}>
        <h2>Report a Bug</h2>
        <label>Name</label>
        <input type="text" name="name"
          onChange={e => setBugFormName(e.target.value)}
          value={bugFormName} />
        <label>Email</label>
        <input type="text" name="email"
          onChange={e => setBugFormEmail(e.target.value)}
          value={bugFormEmail} />
        <label>Bug details</label>
        <input type="text" name="bug"
          onChange={e => setBugFormBug(e.target.value)}
          value={bugFormBug} />
        <input type="submit" value="Submit Bug" />
        <button onClick={() => setBugFormToggle(!bugFormToggle)}>Cancel</button>
      </form>
    </>
  )
}
