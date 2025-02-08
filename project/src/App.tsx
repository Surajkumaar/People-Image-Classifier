import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Upload, Loader2, X, Folder } from 'lucide-react';

interface ImageResult {
  id: string;
  url: string;
  category: string;
}

interface ProcessingStats {
  total: number;
  processed: number;
  failed: number;
}

function App() {
  const [imageResults, setImageResults] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [stats, setStats] = useState<ProcessingStats>({ total: 0, processed: 0, failed: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initTensorFlow = async () => {
      try {
        await tf.ready();
        const loadedModel = await cocoSsd.load({
          base: 'lite_mobilenet_v2'
        });
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };

    initTensorFlow();
  }, []);

  const processImageBatch = async (files: File[], startIndex: number, batchSize: number) => {
    if (!model || startIndex >= files.length) return;

    const endIndex = Math.min(startIndex + batchSize, files.length);
    const batch = files.slice(startIndex, endIndex);
    const newResults: ImageResult[] = [];

    for (const file of batch) {
      try {
        const imageUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = imageUrl;
        await img.decode();

        const predictions = await model.detect(img);
        const peopleCount = predictions.filter(pred => pred.class === 'person').length;

        let category = '';
        if (peopleCount === 0) {
          category = 'No people detected';
        } else if (peopleCount === 1) {
          category = 'Single Person';
        } else if (peopleCount === 2) {
          category = 'Two People';
        } else {
          category = 'Group';
        }

        newResults.push({
          id: `${Date.now()}-${Math.random()}`,
          url: imageUrl,
          category
        });

        setStats(prev => ({ ...prev, processed: prev.processed + 1 }));
      } catch (error) {
        console.error('Error processing image:', error);
        setStats(prev => ({ ...prev, failed: prev.failed + 1 }));
      }
    }

    setImageResults(prev => [...prev, ...newResults]);

    if (endIndex < files.length) {
      // Process next batch
      setTimeout(() => processImageBatch(files, endIndex, batchSize), 0);
    } else {
      setIsLoading(false);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!files.length || !model) return;

    setIsLoading(true);
    setStats({ total: files.length, processed: 0, failed: 0 });
    setImageResults([]);

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    const BATCH_SIZE = 10; // Process 10 images at a time
    
    processImageBatch(imageFiles, 0, BATCH_SIZE);
  };

  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) handleFiles(files);
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) handleFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) handleFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeImage = (id: string) => {
    setImageResults(prev => prev.filter(img => img.id !== id));
  };

  const categories = ['Single Person', 'Two People', 'Group', 'No people detected'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Image People Classifier</h1>
          <p className="text-gray-600">Upload multiple images or entire folders to classify them</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="space-y-4">
              <div className="flex justify-center space-x-4">
                <Upload className="h-12 w-12 text-gray-400" />
                <Folder className="h-12 w-12 text-gray-400" />
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">Drag and drop images or folders here, or</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Choose Files
                  </button>
                  <button
                    onClick={() => folderInputRef.current?.click()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Choose Folder
                  </button>
                </div>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <input
              type="file"
              ref={folderInputRef}
              onChange={handleFolderUpload}
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
            />
          </div>

          {isLoading && (
            <div className="mt-6">
              <div className="flex items-center justify-center space-x-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <div className="text-left">
                  <p className="text-gray-600">Processing images...</p>
                  <p className="text-sm text-gray-500">
                    Processed: {stats.processed} / {stats.total}
                    {stats.failed > 0 && ` (${stats.failed} failed)`}
                  </p>
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.processed / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {imageResults.length > 0 && (
          <div className="space-y-8">
            {categories.map(category => {
              const categoryImages = imageResults.filter(img => img.category === category);
              if (categoryImages.length === 0) return null;

              return (
                <div key={category} className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{category}</h2>
                    <span className="text-gray-600">
                      {categoryImages.length} image{categoryImages.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categoryImages.map(image => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={`${image.category}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;