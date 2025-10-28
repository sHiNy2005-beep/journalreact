import React, { useState } from 'react';
import '../styles/contact.css';


export default function Contact(){
  const [status, setStatus] = useState('');

  async function handleSubmit(e){
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const reason = fd.get('reason') || '';
    const message = fd.get('message') || '';
    fd.set('message', `Reason for contact: ${reason}\n\n${message}`);

    try{
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
      if (res.ok){
        form.reset();
        setStatus('Message sent successfully!');
      } else {
        setStatus('Submission failed.');
      }
    }catch(err){ setStatus('Something went wrong. Please try again.'); }
  }

  return (
    <section id="contact" className="contact">
      <div className="contact-section">
        <h2>Contact Us</h2>
        <p>If you have any questions, suggestions, or concerns, reach out here!</p>
        <form className="contact-form" id="contactForm" onSubmit={handleSubmit}>
          <input type="hidden" name="access_key" value="e98ecc32-9603-42b2-9a5e-5f873a3d9711" />
          <div className="contactbox">
            <label htmlFor="name">Your Name</label>
            <input type="text" id="name" name="name" placeholder="Enter your name" required />
          </div>
          <div className="contactbox">
            <label htmlFor="email">Your Email</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" required />
          </div>
          <div className="contactbox">
            <label htmlFor="reason">Reason for Contact</label>
            <select id="reason" name="reason" required>
              <option value="">Select an option</option>
              <option value="feedback">Feedback</option>
              <option value="support">Support</option>
              <option value="collaboration">Collaboration</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="contactbox">
            <label htmlFor="message">Your Message</label>
            <textarea id="message" name="message" placeholder="Type your message here..." required />
          </div>
          <button type="submit" className="btn-contact">Send Message</button>
          <div id="form-status" className="form-status">{status}</div>
        </form>
      </div>
    </section>
  );
}
