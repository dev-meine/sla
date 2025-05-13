import React from 'react';
import { useForm } from 'react-hook-form';
import { Send } from 'lucide-react';
import { ContactFormData } from '../../types';

const ContactForm: React.FC = () => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    reset
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(data);
    reset();
    alert('Your message has been sent successfully!');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2 md:col-span-2">
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.subject ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register('subject', { required: 'Subject is required' })}
        />
        {errors.subject && (
          <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
        )}
      </div>

      <div className="space-y-2 md:col-span-2">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="message"
          rows={6}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.message ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register('message', { 
            required: 'Message is required',
            minLength: {
              value: 10,
              message: 'Message must be at least 10 characters'
            }
          })}
        ></textarea>
        {errors.message && (
          <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full md:w-auto flex items-center justify-center"
        >
          {isSubmitting ? 'Sending...' : (
            <>
              Send Message
              <Send size={16} className="ml-2" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;