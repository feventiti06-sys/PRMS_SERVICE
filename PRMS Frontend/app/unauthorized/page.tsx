"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShieldX, 
  ArrowLeft, 
  Home,
  Building
} from "lucide-react";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { getRoleDisplayName } from "@/features/auth/types/roles";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, role, logout } = useAuth();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
            <ShieldX className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-400">
            You don't have permission to access this page
          </p>
        </div>

        {/* Error Card */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">
                  Insufficient Permissions
                </h3>
                <p className="text-gray-400 text-sm">
                  The page you're trying to access requires higher privileges than your current role allows.
                </p>
                
                {user && (
                  <div className="bg-gray-800 rounded-lg p-3 mt-4">
                    <div className="text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Current User:</span>
                        <span className="font-medium text-white">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.username
                          }
                        </span>
                      </div>
                      {role && (
                        <div className="flex justify-between mt-1">
                          <span>Role:</span>
                          <span className="font-medium text-prms-primary">
                            {getRoleDisplayName(role)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleGoHome}
                  className="w-full bg-prms-primary hover:bg-prms-primary/90 text-white"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleGoBack}
                  className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full text-red-400 hover:text-red-300 hover:bg-red-950"
                >
                  Switch Account
                </Button>
              </div>
              
              <div className="pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-500">
                  If you believe you should have access to this page, please contact your system administrator.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Building className="h-3 w-3" />
            <span>Ethiopian Institute of Science and Technology</span>
          </div>
          <p>Procurement Resource Management System</p>
        </div>
      </div>
    </div>
  );
}