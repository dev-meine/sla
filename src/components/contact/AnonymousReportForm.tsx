import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AnonymousReportFormData {
  category: string;
  content: string;
}

interface AnonymousReportFormProps {
  onClose: () => void;
}

const AnonymousReportForm: React.FC<AnonymousReportFormProps> = ({ onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<AnonymousReportFormData>();

  const onSubmit = async (data: AnonymousReportFormData) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('anonymous_reports')
        .insert([{
          category: data.category,
          report_content: data.content
        }]);

      if (error) throw error;
      
      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
        <div className="flex items-center mb-6">
          <AlertTriangle className="text-yellow-500 mr-2" size={24} />
          <h2 className="text-xl font-semibold">Submit Anonymous Report</h2>
        </div>

        {submitSuccess ? (
          <div className="text-center py-8">
            <p className="text-green-600 font-medium mb-2">Report submitted successfully!</p>
            <p className="text-gray-600">Thank you for bringing this to our attention. We will investigate and make sure to resolve this issue</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                {...register('category', { required: 'Please select a category' })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select a category</option>
                <option value="harassment">Harassment</option>
                <option value="discrimination">Discrimination</option>
                <option value="misconduct">Misconduct</option>
                <option value="safety">Safety Concern</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Details
              </label>
              <textarea
                {...register('content', {
                  required: 'Please provide report details',
                  minLength: {
                    value: 10,
                    message: 'Please provide more details'
                  }
                })}
                rows={6}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Please provide detailed information about the incident..."
              ></textarea>
              {errors.content && (
                <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
              )}
            </div>

            <div className="text-sm text-gray-500">
              <p>Your report will be submitted anonymously and handled with strict confidentiality.</p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AnonymousReportForm;