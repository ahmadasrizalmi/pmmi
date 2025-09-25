import React from 'react';
import { LinkedInIcon, FacebookIcon, SalesforceIcon, GoogleIcon, HubspotIcon } from '../components/Icons';

// Fix: Add style prop to component definition to allow inline styles for 3D transform.
const GlassCard = ({ children, className, style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) => (
  <div className={`absolute rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl ${className}`} style={style}>
    {children}
  </div>
);

const IconBubble = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`absolute w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl ${className}`}>
    {children}
  </div>
);

const MarketingPage: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center pt-24 pb-12 px-4 z-10">
      
      {/* Main Text */}
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight max-w-4xl">
          Bickering <br className="sm:hidden" /> Marketing Channels?
        </h1>
        <div className="mt-8 inline-block px-6 py-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
          <p className="text-lg md:text-xl text-gray-200">
            Integrated Data is the Peacekeeper You Need
          </p>
        </div>
      </div>

      {/* 3D Card Section */}
      <div className="relative mt-16 lg:mt-20 w-full max-w-lg h-[400px] md:max-w-2xl md:h-[500px] lg:max-w-4xl lg:h-[600px]">
        
        {/* Decorative Purple Arc */}
        <div 
          className="absolute -top-[50%] -right-[50%] w-[200%] h-[200%] border border-purple-500/30 rounded-full"
          aria-hidden="true"
        ></div>

        {/* Perspective Container */}
        <div className="w-full h-full" style={{ perspective: '2000px' }}>
          <div className="relative w-full h-full transform-style-3d" style={{ transform: 'rotateX(55deg) rotateZ(0deg)' }}>
            
            {/* Card 3: Back */}
            <GlassCard className="w-[80%] h-[80%] top-[10%] left-[10%] p-4" style={{ transform: 'translateZ(-80px)'}}>
               <h3 className="text-sm font-semibold text-gray-300">Social Media Platforms</h3>
               <div className="w-full h-1 bg-gray-500/20 rounded-full mt-2"></div>
               <div className="w-3/4 h-1 bg-gray-500/20 rounded-full mt-2"></div>
            </GlassCard>

            {/* Card 2: Middle */}
             <GlassCard className="w-[90%] h-[90%] top-[5%] left-[5%] p-4 md:p-6" style={{ transform: 'translateZ(0px)'}}>
                <h3 className="text-base font-semibold text-gray-200">Marketing Automation</h3>
                <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Account ID</span>
                        <div className="w-24 h-4 bg-gray-500/20 rounded-md"></div>
                    </div>
                     <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Account name</span>
                        <div className="w-32 h-4 bg-gray-500/20 rounded-md"></div>
                    </div>
                     <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Email</span>
                         <div className="w-40 h-4 bg-gray-500/20 rounded-md"></div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Status</span>
                        <div className="w-20 h-4 bg-gray-500/20 rounded-md"></div>
                    </div>
                </div>
{/* Fix: Corrected closing tag from </D> to </GlassCard> */}
             </GlassCard>
            
            {/* Card 1: Front */}
            <GlassCard className="w-full h-full p-4 md:p-6 text-left" style={{ transform: 'translateZ(80px)'}}>
                <h3 className="text-lg font-semibold text-white">Advertisement Platforms</h3>
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-400 font-medium">
                                <td className="py-2 pr-4">Account ID</td>
                                <td className="py-2 pr-4">Account name</td>
                                <td className="py-2 pr-4">Email</td>
                                <td className="py-2">Status</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-white">
                                <td className="py-2 pr-4 font-mono text-xs">0000273897</td>
                                <td className="py-2 pr-4">DIGGrowth</td>
                                <td className="py-2 pr-4">info@diggrowth.com</td>
                                <td className="py-2 text-green-400">Connected</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </GlassCard>

          </div>
        </div>

        {/* Platform Icons */}
        <IconBubble className="bottom-[5%] -left-[5%] md:bottom-[10%] md:-left-[10%]">
          <SalesforceIcon className="w-8 h-8 md:w-12 md:h-12 text-white/80" />
        </IconBubble>
        <IconBubble className="top-[5%] left-[10%] md:top-[10%] md:left-[5%]">
          <LinkedInIcon className="w-7 h-7 md:w-10 md:h-10 text-white/80" />
        </IconBubble>
         <IconBubble className="top-[20%] right-[5%] md:top-[15%] md:-right-[5%]">
          <FacebookIcon className="w-7 h-7 md:w-10 md:h-10 text-white/80" />
        </IconBubble>
        <IconBubble className="bottom-[5%] left-1/2 -translate-x-1/2 translate-y-1/2">
          <GoogleIcon className="w-7 h-7 md:w-10 md:h-10 text-white/80" />
        </IconBubble>
        <IconBubble className="bottom-[5%] -right-[5%] md:bottom-[10%] md:-right-[10%]">
          <HubspotIcon className="w-8 h-8 md:w-12 md:h-12 text-white/80" />
        </IconBubble>

      </div>
    </div>
  );
};

export default MarketingPage;
