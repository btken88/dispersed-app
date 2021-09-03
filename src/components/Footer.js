import React, { useState } from 'react'
import BugReport from './BugReport'

export default function Footer() {
  const [bugFormToggle, setBugFormToggle] = useState(false)

  return (
    <footer>
      {bugFormToggle
        ? <BugReport bugFormToggle={bugFormToggle} setBugFormToggle={setBugFormToggle} />
        : null}
      <a href="https://www.linkedin.com/in/bryce-kennedy">By Bryce Kennedy</a>
      <button onClick={() => setBugFormToggle(!bugFormToggle)}>Report a Bug</button>
    </footer>
  )
}
