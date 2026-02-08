"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Phone, Building2, Loader2 } from 'lucide-react';

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
      staggerChildren: 0.3,
    },
  },
};

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  openingHours: string | null;
  imageUrl: string | null;
  rooms: number;
  beds: number;
  surgeryRooms: number;
  status: string;
}

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await fetch('/api/clinics');
        if (!response.ok) throw new Error('Failed to fetch clinics');
        const data = await response.json();
        setClinics(data.filter((clinic: Clinic) => clinic.status === 'ACTIVE'));
      } catch (error) {
        console.error('Error fetching clinics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <main className="flex-grow bg-gradient-to-b from-background to-teal-50 py-16 md:py-24">
        <motion.div
          className="container mx-auto px-4"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="mb-12 text-center text-3xl font-bold text-primary md:text-4xl lg:text-5xl">
            Our Clinic Locations
          </h1>
          <p className="mb-16 text-center text-lg text-foreground/80 md:text-xl max-w-2xl mx-auto">
            Find the Island Dental Connect clinic nearest to you. Our modern facilities are equipped with the latest dental technology.
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
              {clinics.map((clinic) => (
                <motion.div key={clinic.id} variants={fadeIn}>
                  <Card className="h-full overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col">
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full bg-muted">
                        {clinic.imageUrl ? (
                          <Image
                            src={clinic.imageUrl}
                            alt={`Image of ${clinic.name}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/5">
                            <Building2 className="h-12 w-12 text-primary/40" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 flex-grow">
                      <CardTitle className="mb-3 text-xl font-semibold text-primary">{clinic.name}</CardTitle>
                      <div className="space-y-4">
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary"/>
                            <span>{clinic.address}</span>
                          </div>
                          {clinic.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 shrink-0 text-primary"/>
                              <span>{clinic.phone}</span>
                            </div>
                          )}
                          {clinic.openingHours && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 shrink-0 text-primary"/>
                              <span>{clinic.openingHours}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-2 rounded-lg bg-primary/5">
                            <div className="text-lg font-semibold text-primary">{clinic.rooms}</div>
                            <div className="text-xs text-muted-foreground">Rooms</div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-primary/5">
                            <div className="text-lg font-semibold text-primary">{clinic.beds}</div>
                            <div className="text-xs text-muted-foreground">Beds</div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-primary/5">
                            <div className="text-lg font-semibold text-primary">{clinic.surgeryRooms}</div>
                            <div className="text-xs text-muted-foreground">Surgery Rooms</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      <Button 
                        asChild 
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Link href={`/book-appointment?clinic=${clinic.id}`}>Book at {clinic.name}</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </main>

      <AppFooter />
    </div>
  );
}

