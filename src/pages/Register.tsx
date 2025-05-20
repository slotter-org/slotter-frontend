import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { registerWithInvitation } from "@/api/AuthService";
import { validateInvitationToken } from "@/api/InvitationService";
import { AuthContext } from "@/contexts/AuthProvider";

// Email validation schema
const emailSchema = z.string().email("Please enter a valid email address");

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated } = useContext(AuthContext);
  
  // Parse search params
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [step, setStep] = useState(token ? 2 : 1);
  const [activeTab, setActiveTab] = useState("wms");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [validatingToken, setValidatingToken] = useState(!!token);
  const [tokenError, setTokenError] = useState("");
  
  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  // Form data with shared fields and tab-specific fields
  const [formData, setFormData] = useState({
    // Shared fields
    firstName: "",
    lastName: "",
    password: "",
    // Tab-specific fields
    wmsName: "",
    companyName: "",
  });
  
  // Validate invitation token if present
  useEffect(() => {
    if (token) {
      const validateToken = async () => {
        try {
          setValidatingToken(true);
          const response = await validateInvitationToken({ token });
          setInvitation(response.invitation);
          // Set email from invitation
          if (response.invitation.email) {
            setEmail(response.invitation.email);
          }
          setValidatingToken(false);
        } catch (error) {
          console.error("Invalid token:", error);
          setTokenError("Invalid or expired invitation token");
          setValidatingToken(false);
          setStep(1); // Go back to email step if token is invalid
        }
      };
      validateToken();
    }
  }, [token]);
  
  // Handle email validation and proceed to next step
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
      setEmailError("");
      setStep(2);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
      }
    }
  };
  
  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };
  
  // Handle sign up button click
  const handleSignUp = async () => {
    try {
      setIsLoading(true);
      
      // Determine which email to use for login redirect and registration
      const emailToUse = invitation?.email || email;
      
      if (invitation && token) {
        // Register with invitation
        const registerData = {
          token,
          first_name: formData.firstName,
          last_name: formData.lastName,
          password: formData.password,
          // Always include the email in the payload, whether from invitation or user input
          email: emailToUse
        };
        
        // Add company name if invitation type is join_wms_with_new_company
        if (invitation.invitationType === "join_wms_with_new_company") {
          registerData.new_company_name = formData.companyName;
        }
        
        await registerWithInvitation(registerData);
        console.log("Registration with invitation successful");
      } else {
        // Regular registration using AuthContext
        await register(
          email,
          formData.password,
          formData.firstName,
          formData.lastName,
          activeTab === "company" ? formData.companyName : undefined,
          activeTab === "wms" ? formData.wmsName : undefined
        );
        console.log("Registration successful");
      }
      
      // Redirect to login with email and autoSubmit params
      navigate(`/login?email=${encodeURIComponent(emailToUse)}&autoSubmit=true`);
    } catch (error) {
      console.error("Registration failed:", error);
      // Handle error (show error message)
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render invitation form based on invitation type
  const renderInvitationForm = () => {
    if (!invitation) return null;
    const avatarUrl = invitation.Wms?.avatarURL || invitation.Company?.avatarURL || "";
    const entityName = invitation.Wms?.name || invitation.Company?.name || "";
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={entityName} />
            <AvatarFallback>{entityName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">You've been invited to join</p>
            <p className="font-medium">{entityName}</p>
            {invitation.email && (
              <p className="text-sm text-muted-foreground mt-1">
                Email: {invitation.email}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input
              id="first-name"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
            />
          </div>
          {invitation.invitationType === "join_wms_with_new_company" && (
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render regular registration form
  const renderRegularForm = () => {
    return (
      <Tabs defaultValue="wms" value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wms">WMS</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
        </TabsList>
        <TabsContent value="wms" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="wms-name">WMS Name</Label>
            <Input
              id="wms-name"
              value={formData.wmsName}
              onChange={(e) => handleInputChange("wmsName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input
              id="first-name"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="company" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={formData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="first-name-company">First Name</Label>
            <Input
              id="first-name-company"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name-company">Last Name</Label>
            <Input
              id="last-name-company"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-company">Password</Label>
            <div className="relative">
              <Input
                id="password-company"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    );
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="email-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Create your account</CardTitle>
                <CardDescription>Enter your email to get started</CardDescription>
                {tokenError && <p className="mt-2 text-sm text-red-500">{tokenError}</p>}
              </CardHeader>
              <form onSubmit={handleEmailSubmit}>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={emailError ? "border-red-500" : ""}
                      />
                      {emailError && <p className="text-sm text-red-500">{emailError}</p>}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">
                    Continue
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="details-step"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Complete your profile</CardTitle>
                <CardDescription>
                  {invitation ? "Complete your information to join" : "Choose your account type and provide details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {validatingToken ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-4 text-sm text-muted-foreground">Validating invitation...</p>
                  </div>
                ) : invitation ? (
                  renderInvitationForm()
                ) : (
                  renderRegularForm()
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button onClick={handleSignUp} className="w-full" disabled={isLoading || validatingToken}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing Up...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
                {!invitation && (
                  <Button variant="outline" onClick={() => setStep(1)} className="w-full" disabled={isLoading}>
                    Back to Email
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
