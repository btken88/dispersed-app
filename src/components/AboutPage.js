import React, { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import SEO from './SEO'
import '../component-css/about-page.css'

export default function AboutPage() {
  useEffect(() => {
    document.title = "Dispersed - About";
  }, []);
  
  return (
    <div className='about-page'>
      <SEO 
        title="About Dispersed - Interactive Camping Map"
        description="Learn about Dispersed, a web app designed to help camping enthusiasts find dispersed camping locations in National Forests with interactive maps and weather forecasts."
      />
      <Header />
      <div className='about-content'>
        <div className='intro-with-image'>
          <img src='https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/camping-ideas-1561136670.jpg?crop=0.669xw:1.00xh;0.166xw,0&resize=300:*' alt='Tent overlooking mountain vista at dispersed camping site' />
          <div className='intro-text'>
            <h2>What is Dispersed Camping?</h2>
            <p>Dispersed camping, also known as boondocking or primitive camping, allows you to camp for free on most National Forest roads open to public use. Unlike developed campgrounds, dispersed sites offer solitude, natural beauty, and the freedom to choose your perfect spot.</p>
          </div>
        </div>

        <section className='problem-solution'>
          <h2>The Challenge</h2>
          <p>Finding dispersed camping locations has traditionally been difficult. Forest Service Motor Vehicle Use Maps (MVUMs) are typically large paper maps that are hard to navigate and nearly impossible to locate later using GPS. Many campers miss out on incredible spots simply because they can't find them.</p>
          
          <h2>Our Solution</h2>
          <p>Dispersed makes finding and sharing camping spots simple and accessible. Our interactive mapping platform integrates USFS Motor Vehicle Use Maps with modern GPS technology, real-time weather data, and a community-driven database of camping locations.</p>
        </section>

        <section className='features-section'>
          <h2>Features</h2>
          <ul>
            <li><strong>Interactive Maps:</strong> Browse National Forest roads with color-coded access information</li>
            <li><strong>Real-Time Weather:</strong> Get current conditions and 5-day forecasts for any location</li>
            <li><strong>Community Reviews:</strong> Read and share experiences at different campsites</li>
            <li><strong>Photo Galleries:</strong> See real photos from campers before you go</li>
            <li><strong>Smart Search:</strong> Find campsites by location, amenities, and proximity</li>
            <li><strong>Personal Collections:</strong> Save and organize your favorite spots</li>
            <li><strong>Share Locations:</strong> Easily share coordinates with friends and family</li>
          </ul>
        </section>

        <section className='responsible-camping'>
          <h2>Leave No Trace</h2>
          <p>We encourage all users to follow Leave No Trace principles. Pack out everything you pack in, use existing fire rings, and camp at least 200 feet from water sources. Check local fire restrictions and forest closures before your trip.</p>
        </section>
      </div>
      <Footer />
    </div>
  )
}
