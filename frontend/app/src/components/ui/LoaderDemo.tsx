import React from 'react';
import OpenBioCureLoader from './OpenBioCureLoader';

const LoaderDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#00239C] mb-8 text-center">
          OpenBioCure Loader Component
        </h1>
        
        {/* Size Variations */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Size Variations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            <div className="text-center">
              <OpenBioCureLoader size="sm" />
              <p className="text-sm text-gray-600 mt-2">Small (w-16 h-16)</p>
            </div>
            <div className="text-center">
              <OpenBioCureLoader size="md" />
              <p className="text-sm text-gray-600 mt-2">Medium (w-32 h-32)</p>
            </div>
            <div className="text-center">
              <OpenBioCureLoader size="lg" />
              <p className="text-sm text-gray-600 mt-2">Large (w-48 h-48)</p>
            </div>
            <div className="text-center">
              <OpenBioCureLoader size="xl" />
              <p className="text-sm text-gray-600 mt-2">Extra Large (w-64 h-64)</p>
            </div>
          </div>
        </div>
        
        {/* Inline Usage */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Inline Usage</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-700 mb-4">
              This is an example of how the loader can be used inline within content. 
              <OpenBioCureLoader size="sm" className="inline-block mx-2" />
              It maintains the flow of text while showing loading state.
            </p>
          </div>
        </div>
        
        {/* Full Page Mode */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Full Page Mode</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-700 mb-4">
              The loader can also be used as a full-page loading screen with additional text and progress bar.
            </p>
            <div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
              <OpenBioCureLoader size="lg" fullPage={false} />
              <div className="mt-6 text-center">
                <div className="text-lg font-semibold text-[#00239C] mb-2">
                  Loading OpenBioCure Platform
                </div>
                <div className="w-32 h-1 bg-gradient-to-r from-[#00239C] to-[#00A3E0] rounded-full overflow-hidden mx-auto">
                  <div className="h-full bg-[#E76900] rounded-full animate-progress-bar"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Custom Styling */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Custom Styling</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-[#00239C] to-[#00A3E0] p-6 rounded-lg">
              <OpenBioCureLoader size="md" className="mx-auto" />
              <p className="text-white text-center mt-4">On gradient background</p>
            </div>
            <div className="bg-[#E76900] p-6 rounded-lg">
              <OpenBioCureLoader size="md" className="mx-auto" />
              <p className="text-white text-center mt-4">On orange background</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <OpenBioCureLoader size="md" className="mx-auto" />
              <p className="text-white text-center mt-4">On dark background</p>
            </div>
          </div>
        </div>
        
        {/* Usage Examples */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Usage Examples</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Basic Usage:</h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import OpenBioCureLoader from './components/ui/OpenBioCureLoader';

// Default size (w-32 h-32)
<OpenBioCureLoader />

// Custom size
<OpenBioCureLoader size="lg" />

// Full page mode
<OpenBioCureLoader fullPage={true} />

// With custom classes
<OpenBioCureLoader className="mx-auto" size="xl" />`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoaderDemo;
