'use client';

import React from 'react';

interface IconProps {
  active?: boolean;
}

export default function EthereumIcon({ active = false }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      width="100%"
      height="100%"
      version="1.1"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      imageRendering="optimizeQuality"
      fillRule="evenodd"
      clipRule="evenodd"
      viewBox="0 0 1700 1700"
    >
      <g id="Layer_x0020_1">
        <g id="_1421394342400">
          <g>
            <polygon
              className={active ? 'fill-[#f7931a]' : 'fill-[#343434]'}
              fillRule="nonzero"
              points="392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54"
            />
            <polygon
              className="fill-[#8C8C8C]"
              fillRule="nonzero"
              points="392.07,0 -0,650.54 392.07,882.29 392.07,472.33"
            />
            <polygon
              className={active ? 'fill-[#f7931a]' : 'fill-[#3C3C3B]'}
              fillRule="nonzero"
              points="392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89"
            />
            <polygon
              className="fill-[#8C8C8C]"
              fillRule="nonzero"
              points="392.07,1277.38 392.07,956.52 -0,724.89"
            />
            <polygon
              className="fill-[#141414]"
              fillRule="nonzero"
              points="392.07,882.29 784.13,650.54 392.07,472.33"
            />
            <polygon
              className="fill-[#393939]"
              fillRule="nonzero"
              points="0,650.54 392.07,882.29 392.07,472.33"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
