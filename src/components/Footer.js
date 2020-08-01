import React, { useState } from 'react'
import BugReport from './BugReport'

export default function Footer() {
  const [bugFormToggle, setBugFormToggle] = useState(false)

  return (
    <footer>
      {bugFormToggle
        ? <BugReport bugFormToggle={bugFormToggle} setBugFormToggle={setBugFormToggle} />
        : null}
      <a href="www.linkedin.com/in/bryce-kennedy">Created by Bryce Kennedy</a>
      <button onClick={() => setBugFormToggle(!bugFormToggle)}>Report a Bug</button>
    </footer>
  )
}
