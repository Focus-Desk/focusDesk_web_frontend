"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { BookOpen, Menu } from "lucide-react";

// import { toast } from "sonner";
import { useGetAuthUserQuery } from "@/state/api";
import { signOut } from "aws-amplify/auth";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function Header() {

  const { data: authUser } = useGetAuthUserQuery();
  // const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  // Navigation items (static)
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/#about", label: "About Us" },
    { href: "/#library", label: "Libraries" },
    // { href: "/contact", label: "Contact Us" }, // Uncomment if needed
    { href: "/#mentorship", label: "Mentors" }
  ];

  // Role-based desktop actions
  const renderRoleActions = () => {
    const role = authUser?.userRole?.toLowerCase();
    if (!authUser) return null;

    if (role === "student") {
      return (
        <>
          <Link
            href="/student/dashboard"
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors mr-6"
          >
            Dashboard
          </Link>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all hover:shadow-md"
            onClick={handleSignOut}
          >
            Log Out
          </Button>
        </>
      );
    }
    if (role === "librarian") {
      return (
        <>
          <Link
            href="/librarian/add-library"
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors mr-6"
          >
            Add Library
          </Link>
          <Link
            href="/librarian/dashboard"
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors mr-6"
          >
            Dashboard
          </Link>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all hover:shadow-md"
            onClick={handleSignOut}
          >
            Log Out
          </Button>
        </>
      );
    }
    if (role === "mentor") {
      return (
        <>
          <Link
            href="/mentor/dashboard"
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors mr-6"
          >
            Dashboard
          </Link>
          <Link
            href="/mentor/upload"
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors mr-6"
          >
            Upload
          </Link>
          <Link
            href="/mentor/create-group"
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors mr-6"
          >
            Create Group
          </Link>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all hover:shadow-md"
            onClick={handleSignOut}
          >
            Log Out
          </Button>
        </>
      );
    }
    // fallback for other roles
    return (
      <Button
        className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all hover:shadow-md"
        onClick={handleSignOut}
      >
        Log Out
      </Button>
    );
  };

  // Role-based mobile actions
  const renderMobileRoleActions = () => {
    const role = authUser?.userRole?.toLowerCase();
    if (!authUser) return null;
    if (role === "student") {
      return (
        <>
          <Link
            href="/student/dashboard"
            className="text-lg font-medium text-slate-700 hover:text-blue-600 transition-colors"
          >
            Dashboard
          </Link>
          <Button
            variant="outline"
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 mt-2"
            onClick={handleSignOut}
          >
            Log Out
          </Button>
        </>
      );
    }
    if (role === "librarian") {
      return (
        <>
          <Link
            href="/librarian/add-library"
            className="text-lg font-medium text-slate-700 hover:text-blue-600 transition-colors"
          >
            Add Library
          </Link>
          <Link
            href="/librarian/dashboard"
            className="text-lg font-medium text-slate-700 hover:text-blue-600 transition-colors"
          >
            Dashboard
          </Link>
          <Button
            variant="outline"
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 mt-2"
            onClick={handleSignOut}
          >
            Log Out
          </Button>
        </>
      );
    }
    if (role === "mentor") {
      return (
        <>
          <Link
            href="/mentor/dashboard"
            className="text-lg font-medium text-slate-700 hover:text-blue-600 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/mentor/upload"
            className="text-lg font-medium text-slate-700 hover:text-blue-600 transition-colors"
          >
            Upload
          </Link>
          <Link
            href="/mentor/create-group"
            className="text-lg font-medium text-slate-700 hover:text-blue-600 transition-colors"
          >
            Create Group
          </Link>
          <Button
            variant="outline"
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 mt-2"
            onClick={handleSignOut}
          >
            Log Out
          </Button>
        </>
      );
    }
    // fallback
    return (
      <Button
        variant="outline"
        className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 mt-2"
        onClick={handleSignOut}
      >
        Log Out
      </Button>
    );
  };

  const pathname = usePathname();
  const isLibrarianPath = pathname?.startsWith("/librarian");

  if (isLibrarianPath) return null;

  return (
    <>
      <div className="h-16" />
      <header className={cn(
        "border-b border-slate-200/50 fixed top-0 w-full backdrop-blur-xl bg-white/70 z-50 px-4 py-2 transition-all duration-500"
      )}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Focus Desk Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-2xl font-bold text-slate-800 tracking-tighter" style={{ fontFamily: 'var(--font-inter)' }}>
                Focus Desk
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">



            {authUser ? renderRoleActions() : (
              <>
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400 transition-colors"
                  asChild
                >
                  <Link href="/signin" className="hidden sm:block">
                    Sign In
                  </Link>
                </Button>
                <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all hover:shadow-md" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-slate-700 hover:bg-slate-100 rounded-full">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white/95 backdrop-blur-md">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-8 pt-2">
                  <Link href="/" className="flex items-center">
                    <div className="relative h-12 w-12">
                      <Image
                        src="/logo.png"
                        alt="Focus Desk Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="ml-3 text-xl font-bold text-slate-800 tracking-tighter">Focus Desk</span>
                  </Link>
                </div>
                <nav className="flex flex-col px-3 space-y-5">
                  {navItems.map((item) => (
                    <Link
                      key={`mobile-${item.href}`}
                      href={item.href}
                      className="text-lg font-medium text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  {authUser ? renderMobileRoleActions() : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400"
                        asChild
                      >
                        <Link href="/signin">Sign In</Link>
                      </Button>
                      <Button
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        asChild
                      >
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
