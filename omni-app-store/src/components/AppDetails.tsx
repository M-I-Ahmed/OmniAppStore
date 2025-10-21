"use client";

import Image from "next/image";
import DropDownDescription from "./DropDownDescription";

interface AppDetailsProps {
  appName: string;
}

export default function AppDetails({ appName }: AppDetailsProps) {
  return (
    <div className="flex gap-8 min-h-screen bg-white/5 backdrop-blur-md rounded-4xl p-8">
      {/* Left Column - Scrollable Content */}
      <div className="w-4/5 space-y-6">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-white/70 mb-8">{appName}</h1>
          
            <section className="mb-8 ">
                <h2 className="text-2xl text-cyan-400 font-semibold mb-4">Description</h2>
                <p className="text-gray-400">Description of the app goes here</p>
            </section>

            <section className="mb-8  ">
                <h2 className="text-2xl text-cyan-400 font-semibold mb-4">Features</h2>
                    <ul className="text-gray-400 list-disc pl-4 space-y-2">
                        <li>Feature 1</li>
                        <li>Feature 2</li>
                        <li>Feature 3</li>
                    </ul>
            </section>

            <section className="mb-8 ">
                <DropDownDescription title="Recommended Assets">
                    <ul className="text-gray-400 list-disc pl-4 space-y-2">
                        <li>Asset 1</li>
                        <li>Asset 2</li>
                        <li>Asset 3</li>
                    </ul>
                </DropDownDescription>
            </section> 

            <section className="mb-8 ">
                <DropDownDescription title="Compatible Assets">
                    <ul className="text-gray-400 list-disc pl-4 space-y-2">
                        <li>Compatible Asset 1</li>
                        <li>Compatible Asset 2</li>
                        <li>Compatible Asset 3</li>
                    </ul>
                </DropDownDescription>
            </section>

            <section className="mb-8 ">
                <DropDownDescription title="Dependencies">
                    <ul className="text-gray-400 list-disc pl-4 space-y-2">
                        <li>Dependency 1</li>
                        <li>Dependency 2</li>
                        <li>Dependency 3</li>
                    </ul>
                </DropDownDescription>
            </section>


                

        </div>
      </div>

      {/* Right Column - Sticky Content */}
      <div className="w-1/2">
        <div className="sticky top-32">
          <div className="p-8">
            <div className="w-[400px] h-[300px] relative rounded-lg overflow-hidden mx-auto ">
              <Image
                src="/vercel.svg"
                alt={`${appName} preview`}
                fill
                className="object-contain w-full h-full"
              />
            </div>

            <section className="mt-15">
                <h2 className="text-xl text-gray-400 font-semibold mb-4">Developed by</h2>    
            </section>


            {/* This section will contain the trust badges */}
            <section className="mt-8">
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                {/* Example Trust Badges */}
                <div className=" px-4 py-2 bg-green-600/20 text-green-400 border border-green-400/30 rounded-lg shadow-md">
                  <span>Trusted</span>
                </div>
              </div>
              <p className="text-gray-400 justify-center items-center flex ">Trust Badges here</p>
            </section>

            <div className="mt-4 justify-center flex items-center">
              <button className="mb-8 mt-8 px-6 py-3 
                     bg-blue-700/70 backdrop-blur-md 
                     border border-blue-600/50 
                     rounded-xl 
                     text-white text-lg font-semibold 
                     shadow-2xl shadow-blue-500/30 
                     hover:bg-blue-500/80 
                     transition-all duration-300 ease-in-out
                     transform hover:scale-[1.03]
                     flex items-center gap-2">
                Install Application
              </button>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}



// {/* App Details Content */}
//           <div className="w-full max-w-4xl mx-auto">
//               <div className="flex gap-8">
//                 <div className="w-1/2 pr-4">
//                   <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-8">
//             {/* Flex grid layout */}
//                   <h1 className="text-4xl font-bold text-white mb-6">{appName}</h1>
//                   <div className="text-gray-300 space-y-4">
//                     <h1 className="text-2xl font-semibold text-gray-400">Description</h1>
//                     <p>Description of the app goes here</p>
//                   </div>
//                   <div className ="text-gray-300 space-y-4 mt-4">
//                     <h1 className="text-2xl font-semibold text-gray-400">Features</h1>
//                   </div>
//                 </div>

//                 {/* right */}
//                 <div className=" flex flex-col w-1/2">
//                   <div className="flex flex-col sticky top-32">
//                     <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-8 h-[600px]">
//                       <div className="relative w-full h-full rounded-lg overflow-hidden">
//                       <Image
//                         src="/vercel.svg" 
//                         alt={`${appName} preview`}
//                         width={500}
//                         height={400}
//                         className="object-cover w-full h-full"
//                       />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>