import React from 'react'
import '../component-css/aboutPage.css'

export default function AboutPage() {
  return (
    <div className='about-page'>
      <img src='https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/camping-ideas-1561136670.jpg?crop=0.669xw:1.00xh;0.166xw,0&resize=300:*' alt='tent looking out' />
      <div className='dispersed-ps'>
        <p className='narrow'>Dispersed is a web app designed to help camping enthusiasts find new locations to go dispersed camping. Dispersed camping is allowed on most forest service roads open to public use, but mapping options are less than ideal. Generally the only way to explore dispersed camping locations is on a large paper map from the forest service, which is difficult to later locate with gps mapping.</p>
        <p className='narrow'>With Dispersed, you can now find available areas on an interactive map, with color-coded road information. You can also get current weather information along with a 5 day forecast, and can save spots you'd like to visit later.</p>
      </div>
      <p>Dispersed was created as a project for the FLatiron School's 4th learning module in which we learned the React framework for frontend development. The backend was created using Node.js, Express, and MongoDB, which I taught myself for this project.</p>
      <p>I am a full-stack web developer with experience working in Ruby on Rails, Javascript, Python, React, Node.js, and both SQL and NoSQL databases. After a decade as a teacher in public schools in Colorado, I decided to use my skills of communication, user engagement, design, and problem solving in a new career in software development. If you would like to collaborate or have ideas on how to improve the app, feel free to <a href="mailto: bryce@brycekennedy.net">send me an email</a>.</p>
    </div>
  )
}
