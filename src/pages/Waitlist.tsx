import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {
    authenticate
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);

    // Simulate a brief loading state
    setTimeout(() => {
      if (authenticate(email)) {
        toast({
          title: "Access Granted!",
          description: "Welcome! Redirecting to ChatMode..."
        });
        setTimeout(() => {
          navigate('/chatmode');
        }, 1000);
      } else {
        toast({
          title: "Added to Waitlist",
          description: "Thank you for your interest! You have been added to our waitlist and will be notified when access is available."
        });
      }
      setIsLoading(false);
    }, 1000);
  };
  return <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1a1a] rounded-lg p-8 border border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Join Our Waitlist...</h1>
            <p className="text-gray-400">Enter your email to get early access</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input type="email" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} className="bg-[#0b0b0b] border-gray-600 text-white placeholder-gray-500 focus:border-white" required />
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full bg-white text-black hover:bg-gray-200 font-medium">
              {isLoading ? 'Processing...' : 'Join Waitlist'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              We'll notify you when access becomes available
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default Waitlist;