import React, { useEffect, useState } from 'react'
import type { PricingPlan } from '../types'
import { appPlans } from '../assets/assets'
import Footer from '../components/Footer'
import { authClient } from '../lib/auth-client'
import { toast } from 'sonner'
import api from '../config/axios'

const Pricing = () => {
  const {data:session} = authClient.useSession();
  const [plans,setPlans] = useState<PricingPlan[]>([])

  const handlePurchase = async (planId : string) => {
      try {
        if(!session?.user) return toast.error('Please sign in to purchase credits.');
        const {data} = await api.post('/api/user/purchase-credits', {planId});
        window.location.href = data.payment_link;
      } catch (error:any) {
        toast.error(error.response?.data?.message || error.message);
        console.log(error);
      }
  }

  useEffect(() => {
    setPlans(appPlans);
  },[])

  return (
    <>
      <div className='text-center mt-10 px-4 max-w-2xl mx-auto text-balance'>
        <h1 className='text-3xl text-white'>Choose Your Plan</h1>
        <p className='text-small text-gray-400'>Start for free and scale up as you grow. Find the perfect plan for your <br />content creation needs.</p>
      </div>
      <div className='w-full max-w-5xl mx-auto z-20 max-md:px-4'>
          <div className='pt-14 py-4 px-4 '>
              <div className='grid grid-cols-1 md:grid-cols-3 flex-wrap gap-4'>
                  {plans.map((plan, idx) => (
                      <div key={idx} className="p-6 bg-black/20 ring ring-indigo-950 mx-auto w-full max-w-sm rounded-lg text-white shadow-lg hover:ring-indigo-500 transition-all duration-400">
                          <h3 className="text-xl font-bold">{plan.name}</h3>
                          <div className="my-2">
                              <span className="text-4xl font-bold">{plan.price}</span>
                              <span className="text-gray-300"> / {plan.credits} credits</span>
                          </div>

                          <p className="text-gray-300 mb-6">{plan.description}</p>

                          <ul className="space-y-1.5 mb-6 text-sm">
                              {plan.features.map((feature, i) => (
                                  <li key={i} className="flex items-center">
                                      <svg className="h-5 w-5 text-indigo-300 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                          stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                      </svg>
                                      <span className="text-gray-400">{feature}</span>
                                  </li>
                              ))}
                          </ul>
                          <button onClick={() => handlePurchase(plan.id)} className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-sm rounded-md transition-all">
                              Buy Now
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      </div>
      <div className='text-center mt-10'>
        <p className='text-gray-400 text-sm max-w-lg mx-auto text-balance'>
          Project <span className='text-white font-small'>Creation/Revision</span> consumes <span className='text-white font-medium'>5 credits</span>. 
          Purchase more credits to create and manage more projects!
        </p>
      </div>
      <Footer />
    </>  
    )
}

export default Pricing