import React, { useState } from 'react';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatusMsg('Please fill all fields.');
      return;
    }

    setSending(true);
    setStatusMsg('');

    try {
      const res = await fetch('http://localhost:5000/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const msg = await res.text();
      setStatusMsg(msg);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to send message. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contact"
      className="page-intro-section section mx-auto"
      data-aos="fade-up"
      data-aos-delay="200"
    >
      <div
        className="contact-form-wrapper"
        data-aos="fade-left"
        data-aos-delay="300"
      >
        <form
          id="contact-form"
          className="contact-form p-md-4 px-lg-5"
          onSubmit={handleSubmit}
        >
          <h4
            className="text-center mb-4"
            data-aos="fade-down"
            data-aos-delay="100"
          >
            Contact Form
          </h4>

          <div className="row g-3">
            <div className="col-md-6" data-aos="fade-right" data-aos-delay="200">
              <label className="sr-only" htmlFor="cname">Name</label>
              <input
                type="text"
                className="form-control"
                id="cname"
                name="name"
                placeholder="Name"
                minLength="2"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6" data-aos="fade-left" data-aos-delay="250">
              <label className="sr-only" htmlFor="cemail">Email</label>
              <input
                type="email"
                className="form-control"
                id="cemail"
                name="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="col-12" data-aos="fade-up" data-aos-delay="300">
              <label className="sr-only" htmlFor="cmessage">Your message</label>
              <textarea
                className="form-control"
                id="cmessage"
                name="message"
                placeholder="Enter your message"
                rows="10"
                required
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="col-12" data-aos="zoom-in" data-aos-delay="350">
              <button
                type="submit"
                className="btn w-100 btn-secondary py-2"
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Submit'}
              </button>
            </div>

            {statusMsg && (
              <div className="col-12 text-center mt-3">
                <p>{statusMsg}</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

export default Contact;
