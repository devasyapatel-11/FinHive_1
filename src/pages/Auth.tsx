
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast"; // Existing import
import { useNavigate, Link } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FinHiveLogo from '@/components/FinHiveLogo';
import { Eye, EyeOff } from 'lucide-react';

// Form validation schema
const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    form.reset(); // Clear form values when switching modes
    setShowPassword(false); // Reset password visibility
  };

  const onSubmit = async (values: z.infer<typeof authSchema>) => {
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password
        });

        if (error) throw error;
        
        // Use toast with variant for success
        toast({
          title: "Login Successful",
          description: "You have been logged in.",
          variant: "default",
          duration: 3000
        });
        
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              first_name: '',
              last_name: ''
            }
          }
        });

        if (error) throw error;
        
        // Use toast with variant for success
        toast({
          title: "Account Created",
          description: "Your account has been successfully created.",
          variant: "default",
          duration: 3000
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      // Use toast with destructive variant for errors (auto-dismiss after 5 seconds)
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <FinHiveLogo size="lg" className="mx-auto mb-6" />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-finhive-text">
            {isLogin ? "Sign in to FinHive" : "Create your FinHive account"}
          </h2>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-finhive-text">Email address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="you@example.com" 
                      {...field} 
                      className="bg-white border-finhive-border text-finhive-text placeholder:text-finhive-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-finhive-text">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        {...field}
                        className="bg-white border-finhive-border text-finhive-text placeholder:text-finhive-muted pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-finhive-muted hover:text-finhive-text"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-finhive-primary text-white hover:opacity-90">
              {isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>
        </Form>
        <div className="text-center">
          <p className="mt-2 text-sm text-finhive-muted">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={handleModeSwitch}
              className="font-medium text-finhive-primary hover:opacity-80"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
          <Link to="/" className="mt-4 inline-block text-sm text-finhive-muted hover:text-finhive-text">
            Return to home page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
