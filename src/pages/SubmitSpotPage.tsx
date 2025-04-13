// src/pages/SubmitSpotPage.tsx
import { useState, useEffect } from "react"; // Added useEffect
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Clock, Image, Wifi, Info, Check, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase"; // *** ADDED IMPORT ***

const amenitiesList = [
  "Free WiFi", "Power Outlets", "Quiet Zone", "24/7 Access", "Coffee & Snacks",
  "Restrooms", "Private Rooms", "Natural Lighting", "Free Parking", "Printing Services",
  "Group Tables", "Whiteboards", "Outdoor Seating"
];

const SubmitSpotPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth(); // Use auth hook
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [spotName, setSpotName] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [showLoginWarning, setShowLoginWarning] = useState(false); // State for warning

  // Redirect if not logged in after auth check
  useEffect(() => {
    if (!authLoading && !user) {
      setShowLoginWarning(true);
      // Optionally redirect immediately or after a delay
      // setTimeout(() => navigate('/'), 3000);
    } else {
      setShowLoginWarning(false);
    }
  }, [user, authLoading, navigate]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  // --- *** MODIFIED handleSubmit FUNCTION *** ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Double-check user status before submitting
    if (!user) {
        toast({
            title: "Authentication Required",
            description: "Please sign in to submit a study space.",
            variant: "destructive",
        });
        return; // Stop submission if not logged in
    }

    setIsSubmitting(true);

    // Basic coordinate parsing (improve this for production)
    let latitude: number | null = null;
    let longitude: number | null = null;
    const addressParts = address.split(',');
    if (addressParts.length >= 3) { // Assuming format "Street, City, CA ZIP" or similar
        const coordsMatch = address.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
        if (coordsMatch) {
            latitude = parseFloat(coordsMatch[1]);
            longitude = parseFloat(coordsMatch[2]);
        }
        // Basic fallback if specific coords aren't in address string (consider Geocoding API for robustness)
         else if (address.toLowerCase().includes('fullerton, ca')) {
            latitude = 33.8816 + (Math.random() - 0.5) * 0.05; // Random near CSUF
            longitude = -117.8854 + (Math.random() - 0.5) * 0.05;
         }
    }

    const newSpotData = {
        name: spotName,
        address: address,
        hours: hours,
        description: description,
        amenities: selectedAmenities,
        latitude: latitude,
        longitude: longitude,
        submitted_by: user.id, // Use the authenticated user's ID
    };

    console.log("Attempting to insert new spot:", newSpotData);

    try {
        // Insert data into Supabase 'study_spots' table
        const { data, error } = await supabase
            .from('study_spots') // Use your actual table name
            .insert([newSpotData])
            .select(); // Optionally select the inserted data back

        if (error) {
            // Handle Supabase error
            console.error("Supabase insert error:", error);
            throw error; // Throw error to be caught below
        }

        console.log("Supabase insert success:", data);

        toast({
            title: "Study Spot Submitted!",
            description: "Thanks for helping the community find great places to study.",
            variant: "default",
            action: (
                <Button variant="outline" size="sm" onClick={() => navigate('/spots')}>
                    View Spaces
                </Button>
            ),
        });

        navigate("/spots"); // Redirect after successful submission

    } catch (error: any) {
        console.error("Submission failed:", error);
        toast({
            title: "Submission Failed",
            description: `Could not submit the study space. ${error.message || 'Please try again.'}`,
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false); // Ensure loading state is turned off
    }
  };
  // --- *** END OF MODIFIED handleSubmit FUNCTION *** ---

  if (authLoading) {
    return (
       <div className="min-h-screen flex flex-col bg-background">
         <Navbar />
         <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            <span className="ml-2 text-muted-foreground">Checking authentication...</span>
         </div>
       </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-primary">
              <Link to="/spots"><ArrowLeft className="h-4 w-4 mr-1"/> Back to Spaces</Link>
            </Button>
            <h1 className="text-3xl font-bold mb-2 gradient-text">Add a Study Space</h1>
            <p className="text-muted-foreground">
              Share your favorite place to study with fellow students. Fill in the details below.
            </p>
          </div>

          {/* Login Warning */}
          {showLoginWarning && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Required</AlertTitle>
              <AlertDescription>
                You must be signed in to submit a new study space. Please sign in or sign up.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-card rounded-lg shadow-lg p-6 md:p-8 border border-border">
            {/* Disable form if user is not logged in */}
            <form onSubmit={handleSubmit} className={`space-y-8 ${!user ? 'opacity-50 pointer-events-none' : ''}`}>
              {/* Basic Information Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary">
                  <Info className="h-5 w-5" />
                  Basic Information
                </h2>
                <div className="space-y-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="name">Space Name *</Label>
                    <Input id="name" placeholder="E.g., Stellar Cafe, Library Quiet Floor" required value={spotName} onChange={e => setSpotName(e.target.value)} disabled={!user}/>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="address">Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="address" className="pl-10" placeholder="123 Galaxy Way, Fullerton, CA" required value={address} onChange={e => setAddress(e.target.value)} disabled={!user}/>
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="hours">Opening Hours *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="hours" className="pl-10" placeholder="E.g., Mon-Fri 8 AM - 10 PM, Sat 10 AM - 6 PM or 24/7" required value={hours} onChange={e => setHours(e.target.value)} disabled={!user}/>
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="What makes this spot great for studying? Mention noise level, seating, vibe, etc."
                      className="min-h-[100px] bg-background"
                      required
                      value={description} onChange={e => setDescription(e.target.value)}
                      disabled={!user}
                    />
                     <p className="text-xs text-muted-foreground">Be descriptive! Help others know what to expect.</p>
                  </div>
                </div>
              </div>

              {/* Amenities Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary">
                  <Wifi className="h-5 w-5" />
                  Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                  {amenitiesList.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity.replace(/\s+/g, '-')}`} // Create valid ID
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                        aria-labelledby={`label-amenity-${amenity.replace(/\s+/g, '-')}`}
                        disabled={!user}
                      />
                      <Label
                        htmlFor={`amenity-${amenity.replace(/\s+/g, '-')}`}
                        id={`label-amenity-${amenity.replace(/\s+/g, '-')}`}
                        className="text-sm font-normal cursor-pointer select-none"
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Upload Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary">
                  <Image className="h-5 w-5" />
                  Photos (Optional)
                </h2>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-card/30 hover:border-primary/50 transition-colors">
                  <Image className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">Drag & drop photos or</p>
                  <Button type="button" variant="outline" size="sm" className="pointer-events-none" disabled={!user || true}> {/* Also disable photo button for now */}
                    Select Files
                  </Button>
                   <p className="text-xs text-muted-foreground mt-2">(Photo upload coming soon!)</p>
                </div>
              </div>

              {/* Submission Footer */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end border-t border-border pt-6 mt-8">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate("/spots")}
                  disabled={!user} // Also disable cancel if form disabled
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[150px]"
                  disabled={isSubmitting || !user} // Disable submit if not logged in or already submitting
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Submit Study Space
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubmitSpotPage;