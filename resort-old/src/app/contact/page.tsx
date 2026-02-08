"use client";

import { useState } from "react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Thank you for your message. We will get back to you soon!",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "An error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqItems = [
    {
      question: "What are your check-in and check-out times?",
      answer: "Check-in time is 3:00 PM and check-out time is 11:00 AM.",
    },
    {
      question: "How can I make a reservation?",
      answer:
        "You can make a reservation through our online booking system or by contacting our reservations team.",
    },
    {
      question: "Is there a ferry service between the islands?",
      answer:
        "Yes, we operate regular ferry services between the Main Resort Island and Theme Park Island.",
    },
    {
      question: "What activities are available at the resort?",
      answer:
        "We offer various activities including water sports, island tours, spa services, and access to our theme park.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8 pt-28">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
          Contact Us
        </h1>

        {/* Contact Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-5 h-full">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-xl h-full border border-white/20">
              <h2 className="text-2xl font-semibold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-white/20 bg-white/10 shadow-sm focus:border-blue-400 focus:ring-blue-400 transition-colors py-3 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-white/20 bg-white/10 shadow-sm focus:border-blue-400 focus:ring-blue-400 transition-colors py-3 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-white/20 bg-white/10 shadow-sm focus:border-blue-400 focus:ring-blue-400 transition-colors py-3 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="mt-1 block w-full rounded-lg border border-white/20 bg-white/10 shadow-sm focus:border-blue-400 focus:ring-blue-400 transition-colors text-white placeholder-gray-400"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-400 to-purple-500 text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity font-medium hover:scale-105 duration-300 border border-white/10"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-7 h-full">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-xl h-full border border-white/20">
              <h2 className="text-2xl font-semibold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                Location & Contact Info
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Address
                  </h3>
                  <p className="text-gray-300">
                    Villa College
                    <br />
                    Boduthakurufaanu Magu
                    <br />
                    Male, Maldives
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Contact Details
                  </h3>
                  <p className="text-gray-300 mb-2">Phone: +960 7654321</p>
                  <p className="text-gray-300">Email: info@islandresort.com</p>
                </div>
              </div>
              <div className="w-full h-[300px] rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.2583832012874!2d73.50648651163421!3d4.169534495786782!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b3f7e570b96395b%3A0xa0d4298f1f0a8031!2sVilla%20College!5e0!3m2!1sen!2smv!4v1741482151284!5m2!1sen!2smv"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="lg:col-span-12">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-white/20">
              <h2 className="text-2xl font-semibold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <div
                    key={index}
                    className="border border-white/20 rounded-lg bg-white/5 backdrop-blur-sm"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/10 transition-colors"
                    >
                      <h3 className="text-lg font-medium text-white">
                        {item.question}
                      </h3>
                      <svg
                        className={`w-5 h-5 text-blue-400 transform transition-transform duration-200 ${expandedFaq === index ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <div
                      className={`px-6 py-4 transition-all duration-200 ease-in-out ${expandedFaq === index ? "block" : "hidden"}`}
                    >
                      <p className="text-gray-300">{item.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
