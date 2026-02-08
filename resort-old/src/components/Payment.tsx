"use client";

import { useState, useEffect, useRef } from 'react';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

interface PaymentProps {
  totalAmount: number;
  onPaymentComplete: () => void;
  isPremiumPlan: boolean;
}

type FocusedInput = 'number' | 'name' | 'expiry' | 'cvc' | '';

export default function Payment({ totalAmount, onPaymentComplete, isPremiumPlan }: PaymentProps) {
  const [cardState, setCardState] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
    focused: '' as FocusedInput,
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  const formRef = useRef<HTMLFormElement>(null);
  const successConfettiRef = useRef<HTMLDivElement>(null);
  
  // GSAP animation for form elements
  useEffect(() => {
    const formElements = formRef.current?.querySelectorAll('.form-group');
    
    if (formElements) {
      gsap.fromTo(
        formElements,
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.1, 
          duration: 0.6, 
          ease: 'power2.out' 
        }
      );
    }
  }, []);

  // GSAP confetti animation for successful payment
  useEffect(() => {
    if (isSuccess && successConfettiRef.current) {
      // Create confetti particles
      const createConfetti = () => {
        for (let i = 0; i < 100; i++) {
          const confetti = document.createElement('div');
          confetti.className = 'confetti-particle';
          
          // Randomize confetti appearance
          const size = Math.random() * 10 + 5;
          const colors = ['#FFC700', '#FF0055', '#2D95BF', '#9B0CE1', '#14F195'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          confetti.style.width = `${size}px`;
          confetti.style.height = `${size}px`;
          confetti.style.background = color;
          confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
          confetti.style.position = 'absolute';
          confetti.style.top = '0';
          confetti.style.left = `${Math.random() * 100}%`;
          
          if (successConfettiRef.current) {
            successConfettiRef.current.appendChild(confetti);
          }
          
          // Animate each confetti particle
          gsap.to(confetti, {
            y: `${Math.random() * 400 + 200}px`,
            x: `${(Math.random() - 0.5) * 200}px`,
            rotation: Math.random() * 360,
            duration: Math.random() * 2 + 1.5,
            ease: 'power1.out',
            opacity: 0,
            onComplete: () => {
              if (successConfettiRef.current && successConfettiRef.current.contains(confetti)) {
                successConfettiRef.current.removeChild(confetti);
              }
            }
          });
        }
      };
      
      // Trigger confetti multiple times for a fuller effect
      createConfetti();
      const timer1 = setTimeout(createConfetti, 300);
      const timer2 = setTimeout(createConfetti, 600);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces every 4 digits
    if (name === 'number') {
      const formattedValue = value
        .replace(/\D/g, '')
        .substring(0, 16)
        .replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      setCardState(prev => ({ ...prev, number: formattedValue }));
      return;
    }
    
    // Format expiry date as MM/YY
    if (name === 'expiry') {
      const formattedValue = value
        .replace(/\D/g, '')
        .substring(0, 4);
      
      if (formattedValue.length > 2) {
        setCardState(prev => ({ 
          ...prev, 
          expiry: `${formattedValue.substring(0, 2)}/${formattedValue.substring(2)}` 
        }));
      } else {
        setCardState(prev => ({ ...prev, expiry: formattedValue }));
      }
      return;
    }
    
    // Limit CVC to 3 or 4 digits
    if (name === 'cvc') {
      const formattedValue = value.replace(/\D/g, '').substring(0, 4);
      setCardState(prev => ({ ...prev, cvc: formattedValue }));
      return;
    }
    
    // For cardholder name
    if (name === 'name') {
      setCardState(prev => ({ ...prev, name: value.toUpperCase() }));
      return;
    }
    
    setCardState(prev => ({ ...prev, [name]: value }));
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setCardState(prev => ({ 
      ...prev, 
      focused: name as FocusedInput 
    }));
  };

  const validateForm = () => {
    // Basic validation logic
    if (cardState.number.replace(/\s/g, '').length < 16) {
      setPaymentError('Please enter a valid 16-digit card number');
      return false;
    }
    
    if (!cardState.name.trim()) {
      setPaymentError('Please enter the cardholder name');
      return false;
    }
    
    if (cardState.expiry.length < 5) {
      setPaymentError('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    
    const [month, year] = cardState.expiry.split('/');
    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt(`20${year}`, 10);
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed
    const currentYear = currentDate.getFullYear();
    
    if (
      expiryYear < currentYear || 
      (expiryYear === currentYear && expiryMonth < currentMonth) ||
      expiryMonth > 12
    ) {
      setPaymentError('Your card has expired or has an invalid date');
      return false;
    }
    
    if (cardState.cvc.length < 3) {
      setPaymentError('Please enter a valid security code');
      return false;
    }
    
    setPaymentError(null);
    return true;
  };

  const processPayment = () => {
    setIsProcessing(true);
    
    // Simulate API call with timeout
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        resolve();
      }, 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    
    if (validateForm()) {
      try {
        setIsProcessing(true);
        await processPayment();
        try {
          await onPaymentComplete();
          // Don't set success here - it's already set in processPayment
        } catch (error: any) {
          setIsSuccess(false); // Revert success state if booking creation fails
          throw error; // Re-throw to be caught by outer catch block
        }
      } catch (error: any) {
        setPaymentError(error?.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
        setIsSuccess(false);
      }
    }
  };

  return (
    <div className="mt-8 p-6 sm:p-8 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10">
      {/* Confetti container for success animation */}
      <div ref={successConfettiRef} className="absolute top-0 left-0 w-full h-0 overflow-visible pointer-events-none z-50" />
      
      {!isSuccess ? (
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Credit Card Preview */}
          <motion.div 
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-8">
              <Cards
                number={cardState.number}
                name={cardState.name}
                expiry={cardState.expiry}
                cvc={cardState.cvc}
                focused={cardState.focused}
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <div className="w-12 h-8 bg-white/10 rounded-md flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 0H740C762.1 0 780 17.9 780 40V460C780 482.1 762.1 500 740 500H40C17.9 500 0 482.1 0 460V40C0 17.9 17.9 0 40 0Z" fill="#16366F"/>
                  <path d="M449 250C449 310 398 359 337 359C276 359 225 310 225 250C225 190 276 141 337 141C398 141 449 190 449 250Z" fill="#D9222A"/>
                  <path d="M337 141C398 141 449 190 449 250C449 310 398 359 337 359" fill="#EE9F2D"/>
                  <path d="M337 359C276 359 225 310 225 250C225 190 276 141 337 141" fill="#D9222A"/>
                  <path d="M313 250C313 239 319 229 328 224C324 224 319 224 314 225C288 230 270 247 271 267C272 287 292 301 317 295C329 293 337 287 344 279C340 287 331 293 321 296C297 301 277 288 276 269C276 259 282 251 292 246C299 241 309 237 325 236C319 239 313 245 313 250Z" fill="#D9222A"/>
                  <path d="M590 250C590 239 596 229 605 224C601 224 596 224 591 225C565 230 547 247 548 267C549 287 569 301 594 295C606 293 614 287 621 279C617 287 608 293 598 296C574 301 554 288 553 269C553 259 559 251 569 246C576 241 586 237 602 236C596 239 590 245 590 250Z" fill="#EE9F2D"/>
                  <path d="M444 302L455 200H479L469 302H444ZM406 200L381 266L378 253L378 252L371 210C371 210 370 200 358 200H313L312 205C312 205 324 207 335 214L354 302H380L422 200L406 200ZM538 302H560L581 200H557C547 200 542 208 542 208L503 302H538ZM526 267L540 230L547 267H526Z" fill="white"/>
                </svg>
              </div>
              
              <div className="w-12 h-8 bg-white/10 rounded-md flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 0H740C762.1 0 780 17.9 780 40V460C780 482.1 762.1 500 740 500H40C17.9 500 0 482.1 0 460V40C0 17.9 17.9 0 40 0Z" fill="#F8F8F8"/>
                  <path d="M470 374H311V126H470V374Z" fill="#FF5F00"/>
                  <path d="M330 250C330 200 353 156 390 126C358 100 317 86 273 86C171 86 88 160 88 250C88 340 171 414 273 414C317 414 358 400 390 374C353 344 330 300 330 250Z" fill="#EB001B"/>
                  <path d="M693 250C693 340 610 414 508 414C464 414 423 400 391 374C428 344 451 300 451 250C451 200 428 156 391 126C423 100 464 86 508 86C610 86 693 160 693 250Z" fill="#F79E1B"/>
                </svg>
              </div>

              <div className="w-12 h-8 bg-white/10 rounded-md flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 0H740C762.1 0 780 17.9 780 40V460C780 482.1 762.1 500 740 500H40C17.9 500 0 482.1 0 460V40C0 17.9 17.9 0 40 0Z" fill="#0E4595"/>
                  <path d="M293 350H253L279 155H319L293 350ZM557 158C547 155 531 150 512 150C472 150 443 171 443 201C443 223 464 236 479 244C494 252 499 257 499 264C499 274 487 280 463 280C444 280 424 275 410 270L403 266L396 301C409 307 433 312 459 312C501 312 529 291 529 259C529 241 516 228 493 216C479 208 471 203 471 195C471 187 480 180 499 180C515 180 527 184 535 187L540 190L547 158H557ZM688 350H652L633 254C632 250 629 246 622 246H567L567 250L598 314C598 314 602 350 569 350H536L539 330H577C577 330 639 249 651 229C659 216 652 211 647 200L631 155H709L688 350ZM394 155L338 288L332 260L306 176C303 164 292 155 280 155H195L194 160C211 163 226 168 239 175L267 223L294 350H335L394 155Z" fill="white"/>
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Payment Form */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-bold text-white mb-6">Payment Details</h2>
            {isPremiumPlan && (
              <div className="p-4 mb-6 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-purple-300 font-semibold">Premium Plan Benefits Applied</span>
                </div>
              </div>
            )}
            
            <div className="pb-6 mb-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Amount to pay:</span>
                <span className="text-2xl font-bold text-white">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            {paymentError && (
              <motion.div 
                className="p-4 mb-4 bg-red-500/20 rounded-lg border border-red-500/30 text-red-300"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{paymentError}</span>
                </div>
              </motion.div>
            )}
            
            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="form-group">
                  <label htmlFor="number" className="block text-sm font-medium text-gray-300 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="number"
                    name="number"
                    value={cardState.number}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoComplete="cc-number"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={cardState.name}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder="JOHN DOE"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoComplete="cc-name"
                  />
                </div>
                
                <div className="form-group grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-300 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="expiry"
                      name="expiry"
                      value={cardState.expiry}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoComplete="cc-exp"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cvc" className="block text-sm font-medium text-gray-300 mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      id="cvc"
                      name="cvc"
                      value={cardState.cvc}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      placeholder="123"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoComplete="cc-csc"
                    />
                  </div>
                </div>
                
                <div className="form-group pt-2">
                  <motion.button
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center"
                    disabled={isProcessing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>Pay ${totalAmount.toFixed(2)}</>
                    )}
                  </motion.button>
                </div>
                
                <p className="text-sm text-gray-400 text-center mt-4">
                  Your payment information is encrypted and secure.
                </p>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <motion.div
          className="flex flex-col items-center justify-center py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1
            }}
          >
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          
          <motion.h2
            className="text-4xl font-bold text-white mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Payment Successful!
          </motion.h2>
          
          <motion.p
            className="text-gray-300 text-center max-w-md mb-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your payment of ${totalAmount.toFixed(2)} has been processed successfully. 
            A confirmation email will be sent to your registered email address.
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-md p-6 bg-white/5 rounded-lg border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-4">What's Next?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-gray-300">Your booking is confirmed and will be processed shortly.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </span>
                <span className="text-gray-300">Check your email for booking details and confirmation.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-gray-300">For any assistance, contact our customer support.</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}