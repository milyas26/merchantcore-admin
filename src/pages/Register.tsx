import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Schema validation dengan zod
const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      console.log("Register data:", data);
      // TODO: Implement registration API call
      // await registerUser(data)
      // Handle successful registration (redirect, show success message, etc.)
    } catch (error) {
      console.error("Registration failed:", error);
      // Handle registration error (show error message, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full">
        <Card className="border-0 shadow-2xl rounded-2xl w-full max-w-md mx-auto">
          <CardHeader className="space-y-1 text-center pb-8 pt-8">
            <CardTitle className="text-3xl font-bold bg-clip-text">
              Create Account
            </CardTitle>
            <CardDescription className="text-base">
              Join us today and get started
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  {...register("name")}
                  className={`h-12 rounded-lg ${
                    errors.name ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  {...register("email")}
                  className={`h-12 rounded-lg ${
                    errors.email ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  {...register("password")}
                  className={`h-12 rounded-lg ${
                    errors.password ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="default"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account? <Link to="/login">Sign in here</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
