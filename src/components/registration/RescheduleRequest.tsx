import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, Send } from 'lucide-react';

interface RescheduleRequestProps {
  registrationId: string;
  currentDate?: string;
  currentTime?: string;
  onRequestSent: () => void;
}

const RescheduleRequest: React.FC<RescheduleRequestProps> = ({
  registrationId,
  currentDate,
  currentTime,
  onRequestSent
}) => {
  const [requestedDate, setRequestedDate] = useState('');
  const [requestedTime, setRequestedTime] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('reschedule_requests')
        .insert({
          registration_id: registrationId,
          requested_date: requestedDate,
          requested_time: requestedTime,
          reason: reason,
          status: 'pending'
        });

      if (error) throw error;

      setMessage('Reschedule request submitted successfully!');
      setRequestedDate('');
      setRequestedTime('');
      setReason('');
      onRequestSent();
    } catch (error) {
      console.error('Error submitting reschedule request:', error);
      setMessage('Failed to submit reschedule request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Calendar className="mr-2" size={20} />
        Request Class Reschedule
      </h3>

      {currentDate && currentTime && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            <strong>Current Schedule:</strong> {new Date(currentDate).toLocaleDateString()} at {currentTime}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="requestedDate" className="block text-sm font-medium text-gray-700 mb-1">
            Preferred New Date
          </label>
          <input
            type="date"
            id="requestedDate"
            value={requestedDate}
            onChange={(e) => setRequestedDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="requestedTime" className="block text-sm font-medium text-gray-700 mb-1">
            Preferred New Time
          </label>
          <input
            type="time"
            id="requestedTime"
            value={requestedTime}
            onChange={(e) => setRequestedTime(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Reschedule
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={3}
            placeholder="Please explain why you need to reschedule your class..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
          ) : (
            <Send className="mr-2" size={16} />
          )}
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('successfully') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default RescheduleRequest;