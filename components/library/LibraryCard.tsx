import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";

interface LibraryCardProps {
    name: string;
    address: string;
    price: string;
    rating: number;
    featured?: boolean;
    image: string;
    amenities: string[];
}

const LibraryCard: React.FC<LibraryCardProps> = ({
    name,
    address,
    price,
    rating,
    featured = false,
    image,
    amenities,
}) => {
    return (
        <Card className="w-full max-w-sm rounded-2xl overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Featured Badge */}
                {featured && (
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 border-0 font-bold px-3 py-1 rounded-lg">
                            Featured
                        </Badge>
                    </div>
                )}

                {/* Price/Rating Badge */}
                <div className="absolute bottom-4 right-4">
                    <div className="bg-yellow-50/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-yellow-100/50 flex items-center gap-1.5 shadow-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-slate-800">{price}</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <CardContent className="p-5 space-y-3">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{name}</h3>
                    <div className="flex items-start gap-1 text-slate-500">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                        <p className="text-sm line-clamp-1">{address}</p>
                    </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {amenities.slice(0, 2).map((amenity, idx) => (
                        <Badge
                            key={idx}
                            variant="secondary"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1 rounded-lg border-0"
                        >
                            {amenity}
                        </Badge>
                    ))}
                    {amenities.length > 2 && (
                        <Badge variant="outline" className="text-slate-500 border-slate-200 rounded-lg">
                            +{amenities.length - 2} more
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default LibraryCard;
