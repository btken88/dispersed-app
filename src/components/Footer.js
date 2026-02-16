import React, { useState } from 'react'
import BugReport from './BugReport'

export default function Footer() {
  const [bugFormToggle, setBugFormToggle] = useState(false)

  return (
    <footer>
      {bugFormToggle
        ? <BugReport bugFormToggle={bugFormToggle} setBugFormToggle={setBugFormToggle} />
        : null}
      <span>Dispersed Camping Finder</span>
      <button onClick={() => setBugFormToggle(!bugFormToggle)}>Report a Bug</button>
    </footer>
  )
}
