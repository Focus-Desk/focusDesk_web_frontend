"use client";

import React, { useEffect } from "react";
import { Amplify } from "aws-amplify";
import {
  Authenticator,
  // Heading,
  Radio,
  RadioGroupField,
  useAuthenticator,
  View,
  ThemeProvider
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useRouter, usePathname } from "next/navigation";
// import { fetchAuthSession, getCurrentUser, signOut } from "aws-amplify/auth";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
      userPoolClientId:
        process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
    },
  },
});

const components = {
  Header() {
    return (
      <View className="mt-4 md:mt-7 mb-7">
        {/* <Heading level={3} className="text-secondary-500 font-light hover:!text-primary-300">
          Focus Desk
        </Heading> */}
        <p className="text-muted-foreground mt-2 sm:mt-4 md:mt-8 lg:mt-12 sm:mb-3 md:mb-6 lg:mb-9">
          <span className="font-bold">Welcome!</span> Please sign in to continue
        </p>
      </View>
    );
  },
  SignIn: {
    Footer() {
      const { toSignUp } = useAuthenticator();
      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a
              onClick={toSignUp}
              className="text-blue-600 hover:underline bg-transparent border-none p-0 hover:text-blue-700 cursor-pointer"
            >
              Sign up here
            </a>
          </p>
        </View>
      );
    },
  },
  SignUp: {
    FormFields() {
      const { validationErrors } = useAuthenticator();

      return (
        <>
        <div className="my-custom-container flex flex-col gap-y-2">
          <Authenticator.SignUp.FormFields />
          <RadioGroupField
            legend="Role"
            name="custom:role"
            errorMessage={validationErrors?.["custom:role"]}
            hasError={!!validationErrors?.["custom:role"]}
            isRequired
          >
            <Radio value="student">Student</Radio>
            <Radio value="librarian">Librarian</Radio>
            <Radio value="mentor">Mentor</Radio>
          </RadioGroupField>
        </div>
          
        </>
      );
    },

    Footer() {
      const { toSignIn } = useAuthenticator();
      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <a
              onClick={toSignIn}
              className="text-blue-600 hover:underline bg-transparent border-none p-0 hover:text-blue-700 cursor-pointer"
            >
              Sign in
            </a>
          </p>
        </View>
      );
    },
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: "Enter your email",
      label: "Email",
      isRequired: true,
    },
    password: {
      placeholder: "Enter your password",
      label: "Password",
      isRequired: true,
    },
  },
  signUp: {
    username: {
      order: 1,
      placeholder: "Choose a username",
      label: "Username",
      isRequired: true,
    },
    email: {
      order: 2,
      placeholder: "Enter your email address",
      label: "Email",
      isRequired: true,
    },
    password: {
      order: 3,
      placeholder: "Create a password",
      label: "Password",
      isRequired: true,
    },
    confirm_password: {
      order: 4,
      placeholder: "Confirm your password",
      label: "Confirm Password",
      isRequired: true,
    },
  },
};

const customTheme = {
  name: 'custom-theme',
  tokens: {
    colors: {
      brand: {
        primary: { value: '#000' },
      },
    },
    components: {
      button: {
        primary: {
          backgroundColor: { value: '#155dfc' },
          color: { value: '#fff' },
          borderRadius: { value: '20px'},
        },
        field: {
          borderColor: { value: '#fff' },
          borderRadius: { value: '0.5rem' },
          paddingBlock: { value: '1rem' },
        },
      },
    },
  },
};

const Auth = ({ children }: { children: React.ReactNode }) => {
  // return <>{children}</>;
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  const isDashboardPage =pathname.startsWith("/librarian") || pathname.startsWith("/mentor") || pathname.startsWith("/student");

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (user && isAuthPage) {
      // console.log("Redirecting authenticated user to dashboard", user);
      // async function fn(){
      //   const session = await fetchAuthSession();
      //   const { idToken } = session.tokens ?? {};
      //   console.log("ID Token:", idToken);    

      //   const user = await getCurrentUser();
      //   console.log("Current User:", user);
      //   router.push("/");
      // }
      // fn();
      router.push("/");
    
    }
  }, [user, isAuthPage, router]);

  // Allow access to public pages without authentication
  if (!isAuthPage && !isDashboardPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh h-full flex flex-col md:flex-row bg-blue-50">
      {/* <div className="block w-full md:w-2/5 bg-blue-100 py-3 md:py-5 px-2.5 md:text-center rounded-none">
        <h1 className="md:top-2/4 text-2xl md:text-4xl font-extrabold sticky">Focus Desk</h1>
      </div> */}
      <div className="w-full py-3 md:py-5 bg-blue-50 rounded-none">
        <ThemeProvider theme={customTheme}>
          <Authenticator
            initialState={pathname.includes("signup") ? "signUp" : "signIn"}
            components={components}
            formFields={formFields}
          >
            {() => <>{children}</>}
          </Authenticator>
        </ThemeProvider>
      </div>
      
    </div>
  );
};

export default Auth;
