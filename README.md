# People-Image-Classifier

A modern web application that uses machine learning to automatically classify images based on the number of people detected in them. Built with React, TensorFlow.js, and COCO-SSD model.

![Application Screenshot](https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1000)

## Features

- 🖼️ Drag and drop interface
- 📁 Multiple image upload
- 📂 Folder upload support
- 🤖 Real-time ML-powered detection
- 📊 Progress tracking
- 🔍 Automatic categorization
- 📱 Responsive design

## Categories

Images are automatically sorted into four categories:
- Single Person
- Two People
- Group
- No people detected

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **ML Model**: TensorFlow.js with COCO-SSD
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## How It Works

1. **Upload Images**: 
   - Drag and drop images/folders
   - Use the file picker
   - Select entire folders

2. **Processing**:
   - Images are processed in batches
   - TensorFlow.js runs the COCO-SSD model
   - People detection is performed
   - Progress is shown in real-time

3. **Results**:
   - Images are automatically categorized
   - Organized in a grid layout
   - Can be removed individually
   - Grouped by category

## Performance

- Processes images in batches of 10
- Uses a lightweight ML model variant
- Runs entirely in the browser
- No server uploads required

## Browser Support

Works in modern browsers that support:
- WebAssembly
- File System Access API
- ES2020+ features

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
