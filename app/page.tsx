"use client"
import dynamic from "next/dynamic"
import HeroSectionComponent from "@/components/LandingPage/HeroSectionComponent"
import WhosUsingSectionComponent from "@/components/LandingPage/WhosUsingSection"

// Lazy load components below the fold for better performance
const FeaturesSectionComponent = dynamic(() => import("@/components/LandingPage/FeatureSectionComponent"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-50 rounded-[3rem] mx-12 my-20" />
})
const MentorsShowcaseComponent = dynamic(() => import("@/components/LandingPage/MentorsShowcaseComponent"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-50 rounded-[3rem] mx-12 my-20" />
})
const ResourcesSectionComponent = dynamic(() => import("@/components/LandingPage/ResourceSectionComponent"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-50 rounded-[3rem] mx-12 my-20" />
})
const CtaSectionComponent = dynamic(() => import("@/components/LandingPage/CtaSectionComponent"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-950 rounded-[3rem] mx-12 my-20" />
})

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <HeroSectionComponent />
      <WhosUsingSectionComponent />
      <FeaturesSectionComponent />
      <MentorsShowcaseComponent />
      <ResourcesSectionComponent />
      <CtaSectionComponent />
    </div>
  )
}