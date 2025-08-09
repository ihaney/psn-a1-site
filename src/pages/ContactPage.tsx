import React, { useState } from 'react';
import { Mail, Globe, Instagram } from 'lucide-react';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mailto link with form data
    const subject = encodeURIComponent(`Contact Form Submission from ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    const mailtoLink = `mailto:paisanpublishing@gmail.com?subject=${subject}&body=${body}`;
    
    // Open default email client
    window.location.href = mailtoLink;
    
    // Show success message
    toast.success('Opening email client...');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <SEO 
        title="Contact Us"
        description="Get in touch with Paisán. Contact our team for support, partnerships, or general inquiries."
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-6xl font-bold italic text-[#F4A024] mb-12 paisan-text text-center">Contact Us</h1>
    
          <div className="bg-gray-800/50 rounded-lg p-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-[#F4A024] mb-6">Get in Touch</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#F4A024]" />
                    <a 
                      href="mailto:paisanpublishing@gmail.com"
                      className="text-gray-300 hover:text-[#F4A024]"
                    >
                      paisanpublishing@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[#F4A024]" />
                    <a 
                      href="https://paisan.net"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-[#F4A024]"
                    >
                      paisan.net
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-[#F4A024]" />
                    <a 
                      href="https://www.instagram.com/paisan.app?igsh=MWF2b2Jkb3VxbXNpbg%3D%3D"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-[#F4A024]"
                    >
                      paisan.app
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[#F4A024] mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F4A024]"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F4A024]"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F4A024]"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full btn-primary py-2"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}