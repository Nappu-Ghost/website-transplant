"use client";

import { useEffect, useRef } from "react";

export default function MapPage() {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let map: google.maps.Map;

        let isAdmin = false;

const checkAdmin = async () => {
  try {
    const res = await fetch("http://localhost:8000/api/v1/users/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) return;

    const user = await res.json();

    // adjust depending on your schema
    if (user.role === "ADMIN" || user.role === "admin") {
      isAdmin = true;
    }
  } catch (e) {
    console.error(e);
  }
};

        const initMap = async () => {
            const maldives = { lat: 3.2028, lng: 73.2207 };

            map = new google.maps.Map(mapRef.current as HTMLElement, {
                zoom: 15,
                center: maldives,
                mapTypeId: "satellite",
            });

            // load markers
            const res = await fetch("http://localhost:8000/api/v1/places");
            const data = await res.json();

            data.forEach((p: any) => {
                new google.maps.Marker({
                    position: { lat: p.lat, lng: p.lng },
                    map,
                    title: p.name,
                });
            });

            // admin add
            if (isAdmin) {
                map.addListener("click", async (e: any) => {
                    const name = prompt("Place name:");
                    if (!name) return;

                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();

                    new google.maps.Marker({
                        position: { lat, lng },
                        map,
                        title: name,
                    });

                    await fetch("http://localhost:8000/api/v1/places", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name, lat, lng }),
                    });
                });
            }
        };

        const loadScript = () => {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
            script.async = true;
            script.onload = initMap;
            document.body.appendChild(script);
        };

        if (!(window as any).google) loadScript();
        else initMap();
    }, []);

    return <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />;
}