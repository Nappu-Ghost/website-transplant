"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, BriefcaseMedical, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { auth as authUtils } from '@/lib/auth';

interface Icon {
    path: string;
    name: string;
}

interface Service {
    id: string;
    name: string;
    description: string | null;
    iconUrl: string;
    includes: string[];
    priceMorning: number;
    priceAfternoon: number;
    priceEvening: number;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt?: string;
    updatedAt?: string;
}

const NO_ICON_SENTINEL_VALUE = "__NO_ICON_SELECTED__";

const ServiceManagementPage: FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [icons, setIcons] = useState<Icon[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState<Partial<Service> | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newInclude, setNewInclude] = useState('');
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { toast } = useToast();

    const mapServiceFromApi = useCallback((apiService: any): Service => {
        // This assumes your ApiClient.toCamelCase worked on the response from Next.js API route
        // If Next.js API route returns snake_case, adjust keys here (e.g., apiService.icon_url)
        return {
            id: String(apiService.id),
            name: apiService.name,
            description: apiService.description || null,
            iconUrl: apiService.iconUrl || '',
            includes: apiService.includes && typeof apiService.includes === 'string'
                ? apiService.includes.split(',').map((item: string) => item.trim()).filter(Boolean)
                : (Array.isArray(apiService.includes) ? apiService.includes : []),
            priceMorning: Number(apiService.priceMorning),
            priceAfternoon: Number(apiService.priceAfternoon),
            priceEvening: Number(apiService.priceEvening),
            status: apiService.status,
            createdAt: apiService.createdAt,
            updatedAt: apiService.updatedAt,
        };
    }, []);

    const getAuthHeaders = useCallback((contentType: string = 'application/json') => {
        const token = authUtils.getToken();
        if (!token) {
            toast({ title: "Authentication Error", description: "Session token not found. Please log in.", variant: "destructive" });
            return null;
        }
        const headers: HeadersInit = { 'Content-Type': contentType };
        headers['Authorization'] = `Bearer ${token}`;
        return headers;
    }, [toast]);

    useEffect(() => {
        const fetchPageData = async () => {
            setIsLoadingPage(true);
            try {
                const servicesResponse = await fetch('/api/services'); // This calls your Next.js API route
                if (!servicesResponse.ok) {
                    const err = await servicesResponse.json().catch(() => ({ error: 'Failed to fetch services' }));
                    throw new Error(err.error || err.detail || `Failed to fetch services: ${servicesResponse.statusText}`);
                }
                const servicesDataFromNextApi = await servicesResponse.json();
                // servicesDataFromNextApi is what your Next.js GET /api/services returns.
                // Ensure that data is correctly cased (camelCase) if ApiClient was used in Next.js API route
                setServices(Array.isArray(servicesDataFromNextApi) ? servicesDataFromNextApi.map(mapServiceFromApi) : []);

                const iconsResponse = await fetch('/api/icons');
                if (!iconsResponse.ok) {
                    const err = await iconsResponse.json().catch(() => ({ error: 'Failed to fetch icons' }));
                    throw new Error(err.error || err.detail || `Failed to fetch icons: ${iconsResponse.statusText}`);
                }
                const iconsData = await iconsResponse.json();
                setIcons(Array.isArray(iconsData) ? iconsData : []);

            } catch (error: any) {
                toast({ title: "Error Loading Page Data", description: error.message, variant: "destructive" });
                setServices([]);
                setIcons([]);
            } finally {
                setIsLoadingPage(false);
            }
        };

        fetchPageData();
    }, [toast, mapServiceFromApi]);

    const handleAddInclude = () => {
        if (newInclude.trim() && currentService) {
            const currentIncludes = Array.isArray(currentService.includes) ? currentService.includes : [];
            const updatedIncludes = [...currentIncludes, newInclude.trim()];
            setCurrentService({ ...currentService, includes: updatedIncludes });
            setNewInclude('');
        }
    };

    const handleRemoveInclude = (includeToRemove: string) => {
        if (currentService) {
            const currentIncludes = Array.isArray(currentService.includes) ? currentService.includes : [];
            const updatedIncludes = currentIncludes.filter(item => item !== includeToRemove);
            setCurrentService({ ...currentService, includes: updatedIncludes });
        }
    };

    const handleAddService = () => {
        setCurrentService({
            name: '',
            description: '',
            priceMorning: 0,
            priceAfternoon: 0,
            priceEvening: 0,
            status: 'ACTIVE',
            iconUrl: '',
            includes: []
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEditService = (service: Service) => {
        setCurrentService({ ...service });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDeleteService = async (id: string) => {
        setIsSubmitting(true);
        const authHeaders = getAuthHeaders();

        if (!authHeaders) {
            setIsSubmitting(false);
            return;
        }
        const deleteHeaders: HeadersInit = { 'Authorization': authHeaders.Authorization };

        try {
            const response = await fetch(`/api/services/${id}`, {
                method: 'DELETE',
                headers: deleteHeaders,
            });

            if (!response.ok && response.status !== 204) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                throw new Error(errorData.error || errorData.detail || `Failed to delete service: ${response.statusText}`);
            }
            setServices(prevServices => prevServices.filter(service => service.id !== id));
            toast({ title: "Success", description: "Service deleted successfully." });
        } catch (error: any) {
            toast({ title: "Deletion Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveService = async () => {
        if (!currentService?.name || currentService.priceMorning === undefined || currentService.priceAfternoon === undefined || currentService.priceEvening === undefined) {
            toast({ variant: "destructive", title: "Validation Error", description: "Name and all price fields are required." });
            return;
        }
        if (Number(currentService.priceMorning) <= 0 || Number(currentService.priceAfternoon) <= 0 || Number(currentService.priceEvening) <= 0) {
            toast({ variant: "destructive", title: "Validation Error", description: "Prices must be greater than 0." });
            return;
        }

        setIsSubmitting(true);
        const headers = getAuthHeaders();

        if (!headers) {
            setIsSubmitting(false);
            return;
        }

        let includesString: string | null = null;
        if (currentService?.includes && Array.isArray(currentService.includes) && currentService.includes.length > 0) {
            includesString = currentService.includes.join(',');
        }

        // Prepare data with camelCase keys, ApiClient will convert to snake_case
        const serviceDataForNextApi = {
            name: currentService.name,
            description: currentService.description || null,
            iconUrl: currentService.iconUrl === '' ? null : currentService.iconUrl,
            includes: includesString,
            priceMorning: Number(currentService.priceMorning),
            priceAfternoon: Number(currentService.priceAfternoon),
            priceEvening: Number(currentService.priceEvening),
            status: currentService.status || 'ACTIVE',
        };

        const tempPayload = { ...serviceDataForNextApi };
        Object.keys(tempPayload).forEach(key =>
            (tempPayload as any)[key] === undefined && delete (tempPayload as any)[key]
        );

        try {
            const url = isEditing && currentService.id ? `/api/services/${currentService.id}` : '/api/services';
            const method = isEditing && currentService.id ? 'PUT' : 'POST';

            const response = await fetch(url, { // This calls your Next.js API route
                method,
                headers: headers, // Auth header is included here
                body: JSON.stringify(tempPayload), // Send camelCase data to Next.js API route
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                throw new Error(errorData.error || errorData.detail || `Failed to save service: ${response.statusText}`);
            }

            const savedApiService = await response.json(); // Data from Next.js API route
            const savedService = mapServiceFromApi(savedApiService);

            if (isEditing) {
                setServices(prevServices => prevServices.map(s => s.id === savedService.id ? savedService : s));
            } else {
                setServices(prevServices => [savedService, ...prevServices]);
            }
            setIsModalOpen(false);
            setCurrentService(null);
            toast({ title: "Success", description: `Service ${isEditing ? 'updated' : 'created'} successfully.` });

        } catch (error: any) {
            toast({ title: "Save Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof Omit<Service, 'id' | 'createdAt' | 'updatedAt'>, value: string | number | string[]) => {
        if (currentService) {
            const isPriceField = typeof field === 'string' && field.startsWith('price');
            let processedValue = value;

            if (isPriceField) {
                processedValue = value === '' ? '' : Number(value);
                if (isNaN(processedValue as number) && value !== '') return;
            }

            setCurrentService({ ...currentService, [field]: processedValue });
        }
    };

    if (isLoadingPage) {
        return <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></main>;
    }

    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
                                <BriefcaseMedical className="h-5 w-5" /> Service Management
                            </CardTitle>
                            <CardDescription>Manage dental services and their pricing.</CardDescription>
                        </div>
                        <Button onClick={handleAddService}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Service
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Morning Price ($)</TableHead>
                                    <TableHead className="text-right">Afternoon Price ($)</TableHead>
                                    <TableHead className="text-right">Evening Price ($)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {services.length > 0 ? (
                                    services.map((service) => (
                                        <TableRow key={service.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {service.iconUrl && (
                                                        <img
                                                            src={service.iconUrl}
                                                            alt={service.name}
                                                            className="w-5 h-5 dark:invert"
                                                        />
                                                    )}
                                                    {service.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{service.description}</TableCell>
                                            <TableCell className="text-right font-mono">{Number(service.priceMorning).toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-mono">{Number(service.priceAfternoon).toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-mono">{Number(service.priceEvening).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant={service.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                    {service.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditService(service)} className="mr-2 text-primary hover:text-primary/80" disabled={isSubmitting}>
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteService(service.id)} className="text-destructive hover:text-destructive/80" disabled={isSubmitting}>
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                                            No services found. Add a new service to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? 'Update the details and pricing for this service.' : 'Fill in the details for the new service.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name *</Label>
                            <Input
                                id="name"
                                className="col-span-3"
                                value={currentService?.name || ''}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="e.g., Teeth Whitening"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right pt-2">Description</Label>
                            <Textarea
                                id="description"
                                className="col-span-3 min-h-[80px]"
                                value={currentService?.description || ''}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Brief description of the service..."
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="priceMorning" className="text-right">Morning Price *</Label>
                            <Input
                                id="priceMorning"
                                type="number"
                                min="0.01" // Prices must be > 0 as per backend schema gt=0
                                step="0.01"
                                className="col-span-3"
                                value={currentService?.priceMorning ?? ''}
                                onChange={(e) => handleInputChange('priceMorning', e.target.value)}
                                placeholder="e.g., 150.00"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="priceAfternoon" className="text-right">Afternoon Price *</Label>
                            <Input
                                id="priceAfternoon"
                                type="number"
                                min="0.01"
                                step="0.01"
                                className="col-span-3"
                                value={currentService?.priceAfternoon ?? ''}
                                onChange={(e) => handleInputChange('priceAfternoon', e.target.value)}
                                placeholder="e.g., 125.00"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="priceEvening" className="text-right">Evening Price *</Label>
                            <Input
                                id="priceEvening"
                                type="number"
                                min="0.01"
                                step="0.01"
                                className="col-span-3"
                                value={currentService?.priceEvening ?? ''}
                                onChange={(e) => handleInputChange('priceEvening', e.target.value)}
                                placeholder="e.g., 100.00"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                            <Select
                                value={currentService?.status || 'ACTIVE'}
                                onValueChange={(value: 'ACTIVE' | 'INACTIVE') => handleInputChange('status', value)}
                            >
                                <SelectTrigger id="status" className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="iconUrl" className="text-right">Icon</Label>
                            <Select
                                value={(currentService?.iconUrl === '' || currentService?.iconUrl === null) ? NO_ICON_SENTINEL_VALUE : currentService?.iconUrl || NO_ICON_SENTINEL_VALUE}
                                onValueChange={(selectedValue: string) => {
                                    handleInputChange('iconUrl', selectedValue === NO_ICON_SENTINEL_VALUE ? '' : selectedValue);
                                }}
                            >
                                <SelectTrigger id="iconUrl" className="col-span-3">
                                    <SelectValue placeholder="Select an icon">
                                        {(() => {
                                            const currentIconPath = currentService?.iconUrl;
                                            if (currentIconPath && currentIconPath !== '') {
                                                const selectedIconObject = icons.find(icon => icon.path === currentIconPath);
                                                return selectedIconObject ? (
                                                    <div className="flex items-center gap-2">
                                                        <img src={selectedIconObject.path} alt={selectedIconObject.name} className="w-5 h-5 dark:invert" />
                                                        <span>{selectedIconObject.name}</span>
                                                    </div>
                                                ) : "Select an icon";
                                            }
                                            if (currentIconPath === '') {
                                                return "No Icon";
                                            }
                                            return "Select an icon";
                                        })()}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NO_ICON_SENTINEL_VALUE}>No Icon</SelectItem>
                                    {icons.map((icon) => (
                                        <SelectItem key={icon.path} value={icon.path}>
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={icon.path}
                                                    alt={icon.name}
                                                    className="w-5 h-5 dark:invert"
                                                />
                                                {icon.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="includes" className="text-right pt-2">Includes</Label>
                            <div className="col-span-3 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="includes"
                                        value={newInclude}
                                        onChange={(e) => setNewInclude(e.target.value)}
                                        placeholder="e.g., Free consultation item"
                                    />
                                    <Button type="button" onClick={handleAddInclude}>Add Item</Button>
                                </div>
                                <ul className="space-y-1">
                                    {Array.isArray(currentService?.includes) && currentService.includes.map((include, index) => (
                                        <li key={index} className="flex items-center justify-between text-sm p-1 border rounded">
                                            <span>{include}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                type="button"
                                                onClick={() => handleRemoveInclude(include)}
                                            >
                                                <Trash2 className="h-3 w-3 text-destructive" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-xs text-muted-foreground">Items will be saved as a comma-separated string.</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" onClick={handleSaveService} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Service
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
};

export default ServiceManagementPage;