"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

interface Service {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  includes: string[];
  priceMorning: number;
  priceAfternoon: number;
  priceEvening: number;
  status: string;
}

interface TimeSlot {
  id: 'morning' | 'afternoon' | 'evening';
  label: string;
  time: string;
  price: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<Record<string, TimeSlot['id']>>({});

  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log('Fetching services from Next.js API...');
        const response = await fetch('/api/services');
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Received data:', data);
        // Ensure data is an array before filtering
        const servicesArray = Array.isArray(data) ? data : [];
        console.log('Services array:', servicesArray);
        const activeServices = servicesArray.filter((service: Service) => service.status === 'ACTIVE');
        console.log('Active services:', activeServices);
        setServices(activeServices);
        const initialTimeSlots = servicesArray.reduce((acc: Record<string, TimeSlot['id']>, service: Service) => {
          acc[service.id] = 'morning';
          return acc;
        }, {});
        setSelectedTimeSlots(initialTimeSlots);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const getTimeSlots = (service: Service): TimeSlot[] => [
    { id: 'morning', label: 'Morning', time: '8:00-12:00', price: service.priceMorning },
    { id: 'afternoon', label: 'Afternoon', time: '13:00-17:00', price: service.priceAfternoon },
    { id: 'evening', label: 'Evening', time: '18:00-22:00', price: service.priceEvening },
  ];

  const handleTimeSlotChange = (serviceId: string, value: TimeSlot['id']) => {
    setSelectedTimeSlots(prev => ({ ...prev, [serviceId]: value }));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <main className="flex-grow bg-gradient-to-b from-teal-50 via-background to-beige-50 py-16 md:py-24">
        <motion.div
          className="container mx-auto px-4"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="mb-12 text-center text-3xl font-bold text-primary md:text-4xl lg:text-5xl">
            Our Dental Services
          </h1>
          <p className="mb-16 text-center text-lg text-foreground/80 md:text-xl max-w-3xl mx-auto">
            We offer a comprehensive range of dental treatments to meet all your oral health needs. Explore our services below.
          </p>

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {services.map((service) => {
                const timeSlots = getTimeSlots(service);
                const selectedSlot = timeSlots.find(slot => slot.id === selectedTimeSlots[service.id]);
                
                return (
                  <motion.div key={service.id} variants={fadeIn}>
                    <Card className="group h-full overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col border-primary/20 bg-card/50 backdrop-blur-sm">
                      <CardHeader className="bg-primary/5 p-6 pb-4">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="rounded-full bg-primary/10 p-3 text-primary transition-transform duration-300 group-hover:scale-110">
                            {service.iconUrl ? (
                              <img 
                                src={service.iconUrl} 
                                alt={service.name}
                                className="h-8 w-8 dark:invert transition-transform duration-300 group-hover:rotate-3" 
                              />
                            ) : (
                              <div className="h-8 w-8 bg-primary/20 rounded-full" />
                            )}
                          </div>
                          <CardTitle className="text-xl font-semibold text-primary">{service.name}</CardTitle>
                        </div>
                        <CardDescription className="text-sm text-foreground/80 leading-relaxed">{service.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-2 flex-grow">
                        <div className="space-y-6">                          {Array.isArray(service.includes) && service.includes.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium uppercase tracking-wide text-primary/90 mb-3">Includes:</h4>
                              <ul className="space-y-2">
                                {service.includes.map((item, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/40 flex-shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="text-sm font-medium uppercase tracking-wide text-primary/90 mb-3">Select Time:</h4>
                            <div className="grid grid-cols-3 gap-1">
                              {timeSlots.map((slot) => (
                                <Button
                                  key={slot.id}
                                  onClick={() => handleTimeSlotChange(service.id, slot.id)}
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "h-auto py-2 px-3",
                                    selectedTimeSlots[service.id] === slot.id
                                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                      : "hover:bg-primary/10"
                                  )}
                                >
                                  {slot.label}
                                </Button>
                              ))}
                            </div>
                            {selectedSlot && (
                              <div className="mt-3 p-3 rounded-lg bg-primary/5">
                                <div className="flex items-baseline justify-between">
                                  <p className="text-lg font-semibold text-primary">
                                    ${selectedSlot.price.toFixed(2)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {selectedSlot.time}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-6 pt-0">
                        <Button 
                          asChild 
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 group-hover:shadow-md"
                        >
                          <Link href={`/book-appointment?service=${service.id}&timeSlot=${selectedTimeSlots[service.id]}`}>
                            Book {service.name}
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </main>

      <AppFooter />
    </div>
  );
}
