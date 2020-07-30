import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import '../component-css/sign-in.css'
import Footer from './Footer'
import Header from './Header'

export default function SignIn() {
  const [toggle, setToggle] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const history = useHistory()

  function signUp(e) {
    e.preventDefault()
    fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email })
    }).then(response => response.json())
      .then(result => localStorage.setItem('token', result.token))
      .then(history.push('/favorites'))
      .catch(err => {
        console.error(err.msg)
        alert(err.msg)
      })
  }

  function signIn(e) {
    e.preventDefault()
    fetch('http://localhost:5000/login', {
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }).then(response => response.json())
      .then(data => localStorage.setItem('token', data.token))
      .then(history.push('/favorites'))
  }

  return (
    <div className='form-page'>
      <Header />
      <div className='form-container' onSubmit={toggle ? signUp : signIn}>
        <h2>{toggle ? 'Sign Up' : 'Sign In'}</h2>
        <form className='sign-in'>
          {toggle
            ? <>
              <label>Email</label>
              <input type="text"
                name="Email"
                value={email}
                onChange={e => setEmail(e.target.value)} />
            </>
            : null}
          <label>Username</label>
          <input type="text"
            name="Username"
            value={username}
            onChange={e => setUsername(e.target.value)} />
          <label>Password</label>
          <input type="password"
            name="Password"
            value={password}
            onChange={e => setPassword(e.target.value)} />
          <input type='submit' value={toggle ? 'Sign Up' : 'Sign In'} />
        </form>
        <div className='toggler'>
          <p>{toggle ? 'Already have an account?' : 'Need to create an account?'}</p>
          <button onClick={() => setToggle(!toggle)}>{toggle ? 'Sign In' : 'Sign Up'}</button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
