import React, { useState } from 'react';

const ImageGallery = ({ images = [] }) => {
  const [activeImage, setActiveImage] = useState(images[0] || '');
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${activeImage})`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[480px] scrollbar-none py-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                activeImage === img
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt="Product thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main Showcase Image with Zoom */}
      <div
        className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 cursor-crosshair group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={activeImage}
          alt="Selected product"
          className="w-full h-full object-cover object-center"
        />

        {/* Magnifier lens preview */}
        <div
          style={zoomStyle}
          className="hidden md:block absolute inset-0 pointer-events-none bg-no-repeat bg-cover z-20 transition-all rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  );
};

export default ImageGallery;
