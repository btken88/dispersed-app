import React, { useState } from 'react'
import '../component-css/sign-in.css'
import Footer from './Footer'
import Header from './Header'

export default function SignIn() {
  const [toggle, setToggle] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  function signUp(e) {
    e.preventDefault()
    console.log('Sign up')
  }

  function signIn(e) {
    e.preventDefault()
    console.log('Sign in')
  }

  return (
    <div className='form-page'>
      <Header />
      <div className='form-container' onSubmit={toggle ? signUp : signIn}>
        <h2>{toggle ? 'Sign Up' : 'Sign In'}</h2>
        <form className='sign-in'>
          <label>Email</label>
          <input type="text"
            name="Email"
            value={email}
            onChange={e => setEmail(e.target.value)} />
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
