import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export const ImageUpload = ({ images, onImagesChange }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Get signed URL for displaying an image
  const getSignedUrl = async (path: string): Promise<string | null> => {
    if (signedUrls[path]) return signedUrls[path];
    
    // Extract just the path part after the bucket URL if it's a full URL
    const pathOnly = path.includes('journal-images/') 
      ? path.split('journal-images/')[1] 
      : path;

    const { data, error } = await supabase.storage
      .from('journal-images')
      .createSignedUrl(pathOnly, 3600); // 1 hour expiry

    if (error || !data?.signedUrl) {
      console.error('Failed to get signed URL:', error);
      return null;
    }

    setSignedUrls(prev => ({ ...prev, [path]: data.signedUrl }));
    return data.signedUrl;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!user) {
      toast.error('You must be logged in to upload images');
      return;
    }

    setIsUploading(true);
    const newImagePaths: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        // Store in user-specific folder for RLS
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('journal-images')
          .upload(fileName, file);

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}`);
          console.error('Upload error:', uploadError);
          continue;
        }

        // Store just the path, we'll get signed URLs when displaying
        newImagePaths.push(fileName);
      }

      if (newImagePaths.length > 0) {
        onImagesChange([...images, ...newImagePaths]);
        toast.success(`${newImagePaths.length} image(s) uploaded`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  // Component to render an image with signed URL
  const SignedImage = ({ path, index }: { path: string; index: number }) => {
    const [url, setUrl] = useState<string | null>(signedUrls[path] || null);
    const [loading, setLoading] = useState(!signedUrls[path]);

    useState(() => {
      if (!signedUrls[path]) {
        getSignedUrl(path).then((signedUrl) => {
          setUrl(signedUrl);
          setLoading(false);
        });
      }
    });

    if (loading) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      );
    }

    return (
      <img
        src={url || ''}
        alt={`Attached image ${index + 1}`}
        className="w-full h-full object-cover rounded-lg border border-border/50"
      />
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !user}
          className="bg-background/50 border-border/50"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ImagePlus className="w-4 h-4 mr-2" />
          )}
          Add Images
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((path, index) => (
            <div key={path} className="relative group aspect-square">
              <SignedImage path={path} index={index} />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
