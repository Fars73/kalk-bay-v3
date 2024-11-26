import React, { useState } from 'react';
import { Mail, Phone, Facebook, Instagram } from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const getRandomMessage = (name: string, churchName: string) => {
    const messages = [
      `Dear ${name} \n\nthank you for reaching out to us! We're delighted to hear from you and will respond to your message soon. In the meantime, we invite you to join us for our weekly services. \n\nBlessings \n${churchName }`,
      `Hello ${name}! \n\nWe've received your message and appreciate you contacting us. Our team will get back to you shortly. Feel free to explore our upcoming events on our website. \n\nWarm regards, \n${churchName}`,
      `Greetings ${name}! \n\nThank you for connecting with us. We've received your message and will respond as soon as possible. We look forward to getting to know you better! \n\nBest wishes, \n${churchName}`,
      `Dear ${name}, \n\nwe're grateful you've reached out to us. Your message is important to us, and we'll be in touch soon. May God bless you! \n\nSincerely \n${churchName}`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const sendAutoReply = async (recipientEmail: string, recipientName: string) => {
    try {
      const autoReplyParams = {
        welcome_subject: 'Welcome to KBCC Church!',
        from_name: 'KBCC Church',
        to_name: recipientName,
        message: getRandomMessage(recipientName, 'KBCC Church'),
        to_email: recipientEmail,
        reply_to: 'grantallen3546@gmail.com'
      };

      await emailjs.send(
        'service_554tvoz',
        'template_eiilf8l',
        autoReplyParams,
        'BrQz9euAMxQx_MFJb'
      );
    } catch (error) {
      console.error('Error sending auto-reply:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      // First send the message to the church
      const templateParams = {
        to_email: 'grantallen3546@gmail.com',
        to_name: 'KBCC Church',
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        reply_to: formData.email
      };

      // Send main email to church
      const mainEmailResult = await emailjs.send(
        'service_554tvoz',
        'template_8wfq1rh',
        templateParams,
        'BrQz9euAMxQx_MFJb'
      );

      // Only send auto-reply if main email was successful
      if (mainEmailResult.status === 200) {
        await sendAutoReply(formData.email, formData.name);
      }

      toast.success('Message sent successfully!');
      setShowForm(false);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="join-us" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Join Our Community</h2>
          <p className="text-xl text-gray-600">We'd love to hear from you and welcome you to our church family.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Call Us</h3>
                <p className="text-gray-600">+27 21 788 1234</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Email Us</h3>
                <p className="text-gray-600">grantallen3546@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <a
                 href="https://www.facebook.com/KalkBayCC/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-100 p-3 rounded-full hover:bg-blue-200 transition-colors"
              >
                <Facebook className="h-6 w-6 text-blue-600" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-100 p-3 rounded-full hover:bg-blue-200 transition-colors"
              >
                <Instagram className="h-6 w-6 text-blue-600" />
              </a>
            </div>
          </div>

          <div>
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Send us a message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Contact;