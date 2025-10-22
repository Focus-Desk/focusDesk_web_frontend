"use client"
import HeroSectionComponent from "@/components/LandingPage/HeroSectionComponent"
import WhosUsingSectionComponent from "@/components/LandingPage/WhosUsingSection"
import FeaturesSectionComponent from "@/components/LandingPage/FeatureSectionComponent"
import PricingSectionComponent from "@/components/LandingPage/PricingSectionComponent"
import CtaSectionComponent from "@/components/LandingPage/CtaSectionComponent"
import ResourcesSectionComponent from "@/components/LandingPage/ResourceSectionComponent"
import MentorsShowcaseComponent from "@/components/LandingPage/MentorsShowcaseComponent"


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <HeroSectionComponent />
      <WhosUsingSectionComponent />
      <FeaturesSectionComponent />
      <MentorsShowcaseComponent />
      <ResourcesSectionComponent />
      <PricingSectionComponent />
      <CtaSectionComponent />
    </div>
  )
}