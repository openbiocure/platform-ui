import React from 'react';

export const ScholarDashboardSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        <div>
          <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
      </div>
    </header>

    <section className="mb-8">
      <div className="h-6 w-56 bg-gray-200 rounded mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-5 w-40 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 w-28 bg-gray-200 rounded mb-3"></div>
            <div className="h-16 w-full bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-md">
          <div className="h-5 w-40 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
          </div>
        </div>
      ))}
    </section>

    <section className="mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="h-5 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-100 rounded"></div>
          <div className="h-4 w-11/12 bg-gray-100 rounded"></div>
          <div className="h-4 w-10/12 bg-gray-100 rounded"></div>
        </div>
      </div>
    </section>

    <section>
      <div className="h-6 w-64 bg-gray-200 rounded mb-4"></div>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gray-300 rounded-full mr-4"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
              <div className="h-3 w-5/6 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);
