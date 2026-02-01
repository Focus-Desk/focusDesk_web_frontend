"use client"
import React from 'react';
import LibraryCard from '@/components/library/LibraryCard';
import HeroSectionComponent from "@/components/LandingPage/HeroSectionComponent"
import WhosUsingSectionComponent from "@/components/LandingPage/WhosUsingSection"
import MentorsShowcaseComponent from "@/components/LandingPage/MentorsShowcaseComponent"

export default function TestDesignPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 overflow-x-hidden">
            <div className="container mx-auto px-4 space-y-20">

                {/* Section 1: New LibraryCard Showcase */}
                <section>
                    <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">New Library Card Design</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <LibraryCard
                            name="Kripa Library"
                            address="Ground floor, pandit mohalla, 168, in front of..."
                            price="₹0.00/hr"
                            rating={4.5}
                            featured={true}
                            image="/library.png"
                            amenities={["Proper Lighting", "Air Conditioning", "WiFi", "Comfortable Seats"]}
                        />
                        <LibraryCard
                            name="The Scholar's Nook"
                            address="123 Connaught Place, Delhi"
                            price="₹500/mo"
                            rating={4.8}
                            featured={false}
                            image="/libraryowner.png"
                            amenities={["WiFi", "Air Conditioning", "Drinking Water"]}
                        />
                    </div>
                </section>

                {/* Section 2: Unified Theme Verification */}
                <section className="space-y-12">
                    <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Unified Blue Theme Sections</h2>

                    <div className="border rounded-2xl overflow-hidden bg-white shadow-sm p-4">
                        <h3 className="text-lg font-semibold mb-4 text-blue-600">Hero Section (Updated Gradients)</h3>
                        <HeroSectionComponent />
                    </div>

                    <div className="border rounded-2xl overflow-hidden bg-white shadow-sm p-4">
                        <h3 className="text-lg font-semibold mb-4 text-blue-600">Who's Using Section (Consistent Backgrounds)</h3>
                        <WhosUsingSectionComponent />
                    </div>

                    <div className="border rounded-2xl overflow-hidden bg-white shadow-sm p-4">
                        <h3 className="text-lg font-semibold mb-4 text-blue-600">Mentors Showcase (Unified Accents)</h3>
                        <MentorsShowcaseComponent />
                    </div>
                </section>

            </div>
        </div>
    );
}
