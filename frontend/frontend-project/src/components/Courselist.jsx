import React from 'react';
import CardComponent from './CardComponent';
import { SkeletonCard } from './SkeletonCard';

const Courselist = ({ courses, loading, isAuthenticated }) => {
  return (
    <div className="max-w-screen-xl mx-auto px-4"> 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
        {loading
          ? Array.from({ length: 8 }, (_, index) => <SkeletonCard key={index} />)
          : courses.map((course) => (
              <CardComponent key={course.id} course={course} isAuthenticated={isAuthenticated} />
            ))}
      </div>
    </div>
  );
};
export default Courselist;

