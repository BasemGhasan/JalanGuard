import { Camera, MapPin, ThumbsUp, ThumbsDown, Award, Star, Shield, Eye, ChevronRight } from "lucide-react";

export function OnboardingFlow() {
  return (
    <div className="flex gap-8 items-start">
      {[1, 2, 3, 4].map((step) => (
        <OnboardingScreen key={step} step={step} />
      ))}
    </div>
  );
}

function OnboardingScreen({ step }: { step: number }) {
  return (
    <div
      className="flex-shrink-0 overflow-hidden relative"
      style={{
        width: '390px',
        height: '844px',
        backgroundColor: '#f8fafc',
        borderRadius: '40px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex flex-col h-full">
        {/* Status Bar Area + Skip */}
        <div className="flex items-center justify-between px-8 pt-16 pb-2">
          <div className="w-10" />
          <button className="text-sm tracking-wide" style={{ color: '#334155' }}>
            Skip
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          {step === 1 && <Screen1Content />}
          {step === 2 && <Screen2Content />}
          {step === 3 && <Screen3Content />}
          {step === 4 && <Screen4Content />}
        </div>

        {/* Bottom Section */}
        <div className="px-8 pb-12">
          {/* Text */}
          <div className="text-center mb-8">
            <h2 className="text-[22px] mb-2" style={{ color: '#0f172a', fontWeight: 700 }}>
              {step === 1 && "Report Hazards Instantly"}
              {step === 2 && "Navigate Safely"}
              {step === 3 && "Verify & Update"}
              {step === 4 && "Earn Trust Badges"}
            </h2>
            <p className="text-[14px] leading-[1.6] px-2" style={{ color: '#334155' }}>
              {step === 1 && "Just snap a photo. Our built-in AI automatically detects the road defect, calculates its severity, and tags your exact location."}
              {step === 2 && "Explore the live community map to view reported road defects, check hazard statuses, and avoid high-risk zones in your town."}
              {step === 3 && "Keep the map accurate. Help your fellow drivers by voting to confirm if a nearby hazard is still dangerous or has been repaired."}
              {step === 4 && "Build your civic reputation! Gain trust points and unlock exclusive badges."}
            </p>
          </div>

          {/* Pagination + CTA */}
          {step < 4 ? (
            <div className="flex items-center justify-between">
              <PaginationDots active={step} />
              <button
                className="px-7 py-3 rounded-full text-[14px] text-white flex items-center gap-1.5"
                style={{ backgroundColor: '#d97706', fontWeight: 600 }}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5">
              <PaginationDots active={4} />
              <button
                className="w-full py-4 rounded-full text-[16px] text-white"
                style={{ backgroundColor: '#d97706', fontWeight: 700 }}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PaginationDots({ active }: { active: number }) {
  return (
    <div className="flex gap-2 items-center">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: i === active ? '24px' : '8px',
            height: '8px',
            backgroundColor: i === active ? '#d97706' : '#e2e8f0',
            borderRadius: '4px',
          }}
        />
      ))}
    </div>
  );
}

function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* Phone Frame */}
      <div
        className="relative overflow-hidden"
        style={{
          width: '220px',
          height: '440px',
          borderRadius: '28px',
          backgroundColor: '#0f172a',
          border: '6px solid #1a1a2e',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
          <div
            className="rounded-full"
            style={{ width: '72px', height: '22px', backgroundColor: '#000' }}
          />
        </div>
        {/* Screen Content */}
        <div className="w-full h-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

function Screen1Content() {
  return (
    <div className="flex flex-col items-center">
      {/* Illustration Placeholder */}
      <div
        className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center"
        style={{ backgroundColor: '#fef3c7' }}
      >
        <Camera className="w-8 h-8" style={{ color: '#d97706' }} />
      </div>

      <PhoneMockup>
        <div className="w-full h-full relative">
          <img
            src="https://images.unsplash.com/photo-1709934730506-fba12664d4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3Rob2xlJTIwcm9hZCUyMGRhbWFnZXxlbnwxfHx8fDE3NzQzNDI0MTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Pothole detection"
            className="w-full h-full object-cover"
          />
          {/* Viewfinder Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Corner brackets */}
            <div className="relative" style={{ width: '120px', height: '100px' }}>
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: '#d97706' }} />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2" style={{ borderColor: '#d97706' }} />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2" style={{ borderColor: '#d97706' }} />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: '#d97706' }} />
              {/* Severity Tag */}
              <div
                className="absolute -top-7 left-0 px-2 py-0.5 rounded text-[10px] text-white"
                style={{ backgroundColor: '#dc2626', fontWeight: 600 }}
              >
                ⚠ High Severity
              </div>
              {/* AI Label */}
              <div
                className="absolute -bottom-7 right-0 px-2 py-0.5 rounded text-[10px] text-white"
                style={{ backgroundColor: '#d97706', fontWeight: 500 }}
              >
                AI Detected
              </div>
            </div>
          </div>
          {/* Bottom Camera UI */}
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6">
            <div className="w-9 h-9 rounded-full border-2 border-white/40 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white/60" />
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
              <div className="w-13 h-13 rounded-full" style={{ width: '48px', height: '48px', backgroundColor: '#d97706' }} />
            </div>
            <div className="w-9 h-9 rounded-full border-2 border-white/40" />
          </div>
          {/* Top status */}
          <div className="absolute top-10 left-4 right-4 flex items-center justify-between">
            <span className="text-[10px] text-white/70" style={{ fontWeight: 500 }}>JalanGuard Camera</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#16a34a', fontWeight: 500 }}>● LIVE</span>
          </div>
        </div>
      </PhoneMockup>
    </div>
  );
}

function Screen2Content() {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center"
        style={{ backgroundColor: '#fef3c7' }}
      >
        <MapPin className="w-8 h-8" style={{ color: '#d97706' }} />
      </div>

      <PhoneMockup>
        <div className="w-full h-full relative" style={{ backgroundColor: '#0f172a' }}>
          {/* Dark map grid */}
          <div className="absolute inset-0" style={{ opacity: 0.15 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={`h${i}`} className="absolute w-full" style={{ top: `${i * 40}px`, height: '1px', backgroundColor: '#475569' }} />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`v${i}`} className="absolute h-full" style={{ left: `${i * 30}px`, width: '1px', backgroundColor: '#475569' }} />
            ))}
          </div>

          {/* Roads */}
          <div className="absolute" style={{ top: '100px', left: 0, right: 0, height: '3px', backgroundColor: '#334155' }} />
          <div className="absolute" style={{ top: '200px', left: 0, right: 0, height: '4px', backgroundColor: '#475569' }} />
          <div className="absolute" style={{ top: '300px', left: '20px', right: '40px', height: '3px', backgroundColor: '#334155' }} />
          <div className="absolute" style={{ top: '60px', left: '80px', width: '3px', height: '380px', backgroundColor: '#475569' }} />
          <div className="absolute" style={{ top: '40px', left: '160px', width: '3px', height: '350px', backgroundColor: '#334155' }} />

          {/* Choropleth zones */}
          <div className="absolute" style={{ top: '80px', left: '50px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.4) 0%, transparent 70%)' }} />
          <div className="absolute" style={{ top: '250px', left: '100px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.3) 0%, transparent 70%)' }} />
          <div className="absolute" style={{ top: '180px', left: '20px', width: '60px', height: '60px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 70%)' }} />

          {/* Map Pins */}
          {[
            { top: 95, left: 70 },
            { top: 195, left: 155 },
            { top: 290, left: 45 },
            { top: 140, left: 130 },
            { top: 260, left: 170 },
          ].map((pos, i) => (
            <div key={i} className="absolute flex flex-col items-center" style={{ top: `${pos.top}px`, left: `${pos.left}px` }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#d97706' }}>
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '5px solid #d97706', marginTop: '-1px' }} />
            </div>
          ))}

          {/* User location pulse */}
          <div className="absolute" style={{ top: '210px', left: '100px' }}>
            <div className="relative">
              <div className="absolute -inset-3 rounded-full animate-ping" style={{ backgroundColor: '#3b82f6', opacity: 0.2 }} />
              <div className="w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: '#3b82f6' }} />
            </div>
          </div>

          {/* Search bar */}
          <div className="absolute top-10 left-3 right-3">
            <div className="rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ backgroundColor: '#1e293b' }}>
              <MapPin className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
              <span className="text-[10px]" style={{ color: '#94a3b8' }}>Search location...</span>
            </div>
          </div>

          {/* Bottom card */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: '#1e293b' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-white" style={{ fontWeight: 600 }}>5 hazards nearby</p>
                  <p className="text-[9px]" style={{ color: '#94a3b8' }}>2 high severity zones</p>
                </div>
                <div className="px-2 py-1 rounded-lg text-[9px] text-white" style={{ backgroundColor: '#d97706', fontWeight: 500 }}>
                  View All
                </div>
              </div>
            </div>
          </div>
        </div>
      </PhoneMockup>
    </div>
  );
}

function Screen3Content() {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center"
        style={{ backgroundColor: '#fef3c7' }}
      >
        <ThumbsUp className="w-8 h-8" style={{ color: '#d97706' }} />
      </div>

      <PhoneMockup>
        <div className="w-full h-full flex flex-col" style={{ backgroundColor: '#0f172a' }}>
          {/* Header */}
          <div className="pt-10 px-4 pb-3">
            <p className="text-[11px] text-white" style={{ fontWeight: 600 }}>Nearby Hazard Report</p>
            <p className="text-[9px]" style={{ color: '#94a3b8' }}>0.2 km from your location</p>
          </div>

          {/* Card */}
          <div className="mx-3 rounded-2xl overflow-hidden flex-1 flex flex-col" style={{ backgroundColor: '#1e293b' }}>
            {/* Image */}
            <div className="h-40 relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1709934730506-fba12664d4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3Rob2xlJTIwcm9hZCUyMGRhbWFnZXxlbnwxfHx8fDE3NzQzNDI0MTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Hazard"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] text-white" style={{ backgroundColor: '#dc2626', fontWeight: 600 }}>
                High Risk
              </div>
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px]" style={{ backgroundColor: '#0f172a', color: '#94a3b8' }}>
                2 days ago
              </div>
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#d97706' }}>
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-white" style={{ fontWeight: 600 }}>Jl. Main Street</p>
                  <p className="text-[8px]" style={{ color: '#64748b' }}>Reported by @citizen_23</p>
                </div>
              </div>

              <p className="text-[11px] text-white mb-1" style={{ fontWeight: 600 }}>
                Is this hazard still there?
              </p>
              <p className="text-[9px] mb-4" style={{ color: '#94a3b8' }}>
                Help verify this report for the community
              </p>

              {/* Voting Buttons */}
              <div className="flex gap-2 mt-auto">
                <button className="flex-1 py-3 rounded-xl text-[11px] flex items-center justify-center gap-1.5" style={{ backgroundColor: '#16a34a', color: 'white', fontWeight: 600 }}>
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Yes, it's fixed
                </button>
                <button className="flex-1 py-3 rounded-xl text-[11px] flex items-center justify-center gap-1.5" style={{ backgroundColor: '#dc2626', color: 'white', fontWeight: 600 }}>
                  <ThumbsDown className="w-3.5 h-3.5" />
                  Still broken
                </button>
              </div>

              {/* Vote count */}
              <div className="flex items-center justify-center gap-4 mt-3">
                <span className="text-[9px]" style={{ color: '#64748b' }}>12 votes so far</span>
                <span className="text-[9px]" style={{ color: '#64748b' }}>•</span>
                <span className="text-[9px]" style={{ color: '#d97706' }}>67% say still broken</span>
              </div>
            </div>
          </div>

          <div className="h-4" />
        </div>
      </PhoneMockup>
    </div>
  );
}

function Screen4Content() {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center"
        style={{ backgroundColor: '#fef3c7' }}
      >
        <Award className="w-8 h-8" style={{ color: '#d97706' }} />
      </div>

      <PhoneMockup>
        <div className="w-full h-full flex flex-col" style={{ backgroundColor: '#0f172a' }}>
          {/* Profile Header */}
          <div className="flex flex-col items-center pt-12 pb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
              style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
            >
              <span className="text-[20px] text-white" style={{ fontWeight: 700 }}>JG</span>
            </div>
            <h3 className="text-[13px] text-white" style={{ fontWeight: 700 }}>JalanGuard User</h3>
            <div className="flex items-center gap-1 mt-1">
              <Shield className="w-3 h-3" style={{ color: '#d97706' }} />
              <span className="text-[10px]" style={{ color: '#d97706', fontWeight: 500 }}>Community Hero</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex mx-4 mb-4 rounded-xl overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
            {[
              { label: 'Reports', value: '24' },
              { label: 'Verifies', value: '58' },
              { label: 'Rank', value: '#12' },
            ].map((stat, i) => (
              <div key={i} className="flex-1 py-3 flex flex-col items-center" style={{ borderRight: i < 2 ? '1px solid #334155' : 'none' }}>
                <span className="text-[14px] text-white" style={{ fontWeight: 700 }}>{stat.value}</span>
                <span className="text-[9px]" style={{ color: '#94a3b8' }}>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Trust Score */}
          <div className="mx-4 rounded-xl p-4 mb-4" style={{ backgroundColor: '#1e293b' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-white" style={{ fontWeight: 600 }}>Trust Score</span>
              <span className="text-[12px]" style={{ color: '#d97706', fontWeight: 700 }}>750 / 1000</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#334155' }}>
              <div
                className="h-full rounded-full"
                style={{ width: '75%', background: 'linear-gradient(90deg, #d97706, #f59e0b)' }}
              />
            </div>
            <p className="text-[9px] mt-1.5" style={{ color: '#64748b' }}>250 points to next level</p>
          </div>

          {/* Badges */}
          <div className="mx-4 rounded-xl p-4" style={{ backgroundColor: '#1e293b' }}>
            <p className="text-[11px] text-white mb-3" style={{ fontWeight: 600 }}>Unlocked Badges</p>
            <div className="flex gap-3 justify-center">
              {[
                { icon: <Star className="w-5 h-5 text-white fill-white" />, label: 'First Report', unlocked: true },
                { icon: <Award className="w-5 h-5 text-white" />, label: '10 Verifies', unlocked: true },
                { icon: <Shield className="w-5 h-5" style={{ color: '#64748b' }} />, label: 'Locked', unlocked: false },
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center" style={{ opacity: badge.unlocked ? 1 : 0.4 }}>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
                    style={{ backgroundColor: badge.unlocked ? '#d97706' : '#334155' }}
                  >
                    {badge.icon}
                  </div>
                  <span className="text-[8px]" style={{ color: '#94a3b8' }}>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PhoneMockup>
    </div>
  );
}
