"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetAuthUserQuery, useGetLibrariesByLibrarianQuery } from "@/state/api";

export default function LibrariesPage() {
    const router = useRouter();
    const { data: authData } = useGetAuthUserQuery();
    const librarian = authData?.userRole === "librarian" ? authData.userInfo : null;

    const { data: libraries, isLoading } = useGetLibrariesByLibrarianQuery(librarian?.id ?? "", {
        skip: !librarian?.id,
    });

    useEffect(() => {
        if (!isLoading && libraries) {
            if (libraries.length === 1) {
                router.replace(`/librarian/libraries/${libraries[0].id}`);
            } else {
                router.replace("/librarian/dashboard");
            }
        }
    }, [libraries, isLoading, router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-pulse text-blue-600 font-black uppercase tracking-widest">
                Redirecting...
            </div>
        </div>
    );
}
